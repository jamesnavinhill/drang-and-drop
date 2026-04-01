import { spawn } from "node:child_process";
import { promises as fs } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright";

import { collectProjectBlockTypes, getParityCriticalBlockTypes } from "../src/lib/builder/block-catalog";
import {
  builderTemplateCatalog,
  createProjectFromTemplate,
  type BuilderTemplateId,
} from "../src/lib/builder/default-project";
import {
  getStarterArchiveBaseName,
  getStarterProjectFiles,
} from "../src/lib/builder/starter-artifacts";
import { createBlockContractVerificationProject } from "../src/lib/builder/verification-project";
import type { BuilderPage, BuilderProject } from "../src/lib/builder/types";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const appDir = path.resolve(__dirname, "..");
const outputRoot = path.join(appDir, "output", "starter-verification");
const basePort = Number(process.env.STARTER_VERIFY_BASE_PORT ?? 3210);

const preferredPropKeys = [
  "title",
  "eyebrow",
  "logo",
  "label",
  "tier",
  "author",
  "ctaLabel",
  "primaryLabel",
  "buttonLabel",
  "body",
  "quote",
] as const;

function normalizeSnippet(value: string) {
  return value.replace(/\s+/g, " ").trim();
}

function quoteShellArg(value: string) {
  if (/^[a-zA-Z0-9_./:-]+$/.test(value)) {
    return value;
  }

  return `"${value.replace(/"/g, '\\"')}"`;
}

function spawnPnpm(args: string[], cwd: string) {
  if (process.platform === "win32") {
    return spawn("cmd.exe", ["/d", "/s", "/c", `pnpm ${args.map(quoteShellArg).join(" ")}`], {
      cwd,
      env: {
        ...process.env,
        CI: "1",
      },
      stdio: ["ignore", "pipe", "pipe"],
    });
  }

  return spawn("pnpm", args, {
    cwd,
    env: {
      ...process.env,
      CI: "1",
    },
    stdio: ["ignore", "pipe", "pipe"],
  });
}

function collectExpectedStrings(project: BuilderProject, page: BuilderPage) {
  const values = new Set<string>();

  function visit(nodeId: string) {
    const node = project.nodes[nodeId];
    if (!node) {
      return;
    }

    for (const key of preferredPropKeys) {
      const value = node.props[key];
      if (typeof value === "string") {
        const normalized = normalizeSnippet(value);
        if (normalized.length >= 6) {
          values.add(normalized);
        }
      }
    }

    for (const childIds of Object.values(node.regions)) {
      for (const childId of childIds) {
        visit(childId);
      }
    }
  }

  for (const regionIds of Object.values(page.regions)) {
    for (const rootId of regionIds) {
      visit(rootId);
    }
  }

  return Array.from(values).slice(0, 6);
}

function describePage(page: BuilderPage) {
  return page.path === "/" ? "home route" : page.path;
}

function routePathToFileStem(pathname: string) {
  if (pathname === "/") {
    return "home";
  }

  return pathname.replace(/^\//, "").replace(/[\\/]+/g, "-");
}

function assertParityCoverage(projects: BuilderProject[]) {
  const coveredTypes = new Set<string>();

  for (const project of projects) {
    for (const type of collectProjectBlockTypes(project)) {
      coveredTypes.add(type);
    }
  }

  const missingTypes = getParityCriticalBlockTypes().filter((type) => !coveredTypes.has(type));

  if (missingTypes.length > 0) {
    throw new Error(
      `Starter verification is missing parity coverage for: ${missingTypes.join(", ")}. Add them to a shipped template or the internal coverage project.`,
    );
  }
}

async function writeStarterWorkspace(project: BuilderProject, workspaceDir: string) {
  await fs.rm(workspaceDir, { recursive: true, force: true });
  await fs.mkdir(workspaceDir, { recursive: true });

  for (const file of getStarterProjectFiles(project)) {
    const destination = path.join(workspaceDir, file.path);
    await fs.mkdir(path.dirname(destination), { recursive: true });
    await fs.writeFile(destination, file.contents, "utf8");
  }
}

async function runCommand({
  cwd,
  label,
  args,
  stdoutPath,
  stderrPath,
}: {
  cwd: string;
  label: string;
  args: string[];
  stdoutPath: string;
  stderrPath: string;
}) {
  const child = spawnPnpm(args, cwd);

  let stdout = "";
  let stderr = "";

  child.stdout.on("data", (chunk) => {
    stdout += chunk.toString();
  });

  child.stderr.on("data", (chunk) => {
    stderr += chunk.toString();
  });

  const exitCode = await new Promise<number>((resolve, reject) => {
    child.once("error", reject);
    child.once("close", (code) => resolve(code ?? 0));
  });

  await fs.writeFile(stdoutPath, stdout, "utf8");
  await fs.writeFile(stderrPath, stderr, "utf8");

  if (exitCode !== 0) {
    throw new Error(`${label} failed with exit code ${exitCode}. See ${stdoutPath} and ${stderrPath}.`);
  }
}

async function killProcessTree(pid: number) {
  if (process.platform === "win32") {
    await new Promise<void>((resolve) => {
      const killer = spawn("taskkill", ["/pid", String(pid), "/t", "/f"], { stdio: "ignore" });
      killer.once("close", () => resolve());
      killer.once("error", () => resolve());
    });
    return;
  }

  try {
    process.kill(pid, "SIGTERM");
  } catch {
    return;
  }
}

async function waitForHttp(url: string, timeoutMs: number) {
  const startedAt = Date.now();

  while (Date.now() - startedAt < timeoutMs) {
    try {
      const response = await fetch(url, { redirect: "manual" });
      if (response.ok || response.status === 308 || response.status === 307) {
        return;
      }
    } catch {
      // Keep polling until the timeout.
    }

    await new Promise((resolve) => setTimeout(resolve, 1000));
  }

  throw new Error(`Timed out waiting for ${url} after ${timeoutMs}ms.`);
}

async function startServer(workspaceDir: string, port: number, logsDir: string) {
  const child = spawnPnpm(["start", "--port", String(port)], workspaceDir);

  let stdout = "";
  let stderr = "";

  child.stdout.on("data", (chunk) => {
    stdout += chunk.toString();
  });

  child.stderr.on("data", (chunk) => {
    stderr += chunk.toString();
  });

  child.once("error", async (error) => {
    await fs.writeFile(path.join(logsDir, "start.stdout.log"), stdout, "utf8");
    await fs.writeFile(path.join(logsDir, "start.stderr.log"), `${stderr}\n${error.message}`, "utf8");
  });

  const baseUrl = `http://127.0.0.1:${port}`;

  try {
    await waitForHttp(baseUrl, 60000);
  } catch (error) {
    await killProcessTree(child.pid ?? 0);
    await fs.writeFile(path.join(logsDir, "start.stdout.log"), stdout, "utf8");
    await fs.writeFile(path.join(logsDir, "start.stderr.log"), stderr, "utf8");
    throw error;
  }

  return {
    baseUrl,
    async stop() {
      if (child.pid) {
        await killProcessTree(child.pid);
      }
      await fs.writeFile(path.join(logsDir, "start.stdout.log"), stdout, "utf8");
      await fs.writeFile(path.join(logsDir, "start.stderr.log"), stderr, "utf8");
    },
  };
}

async function fetchHtml(url: string) {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Expected ${url} to return 200, received ${response.status}.`);
  }

  return response.text();
}

function getNextStaticAssetPath(html: string) {
  const matches = html.match(/\/_next\/static\/[^"' )]+/g);
  return matches?.[0] ?? null;
}

async function verifyRoutes(project: BuilderProject, baseUrl: string) {
  let homeHtml = "";

  for (const page of project.pages) {
    const routeUrl = new URL(page.path, `${baseUrl}/`).toString();
    const html = await fetchHtml(routeUrl);
    const expectedStrings = collectExpectedStrings(project, page);

    if (expectedStrings.length > 0 && !expectedStrings.some((entry) => html.includes(entry))) {
      throw new Error(
        `Rendered HTML for ${describePage(page)} did not include any expected page content. Checked: ${expectedStrings.join(", ")}`,
      );
    }

    if (page.path === "/") {
      homeHtml = html;
    }
  }

  const assetPath = getNextStaticAssetPath(homeHtml);
  if (!assetPath) {
    throw new Error("Could not find a Next static asset reference in the generated home page HTML.");
  }

  const assetResponse = await fetch(new URL(assetPath, `${baseUrl}/`));
  if (!assetResponse.ok) {
    throw new Error(`Expected generated asset ${assetPath} to return 200, received ${assetResponse.status}.`);
  }
}

async function verifyRoutesInBrowser(project: BuilderProject, baseUrl: string, screenshotsDir: string) {
  let browser;

  try {
    browser = await chromium.launch({
      headless: true,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);

    if (/executable doesn't exist|browserType\.launch/i.test(message)) {
      throw new Error(
        `Playwright Chromium is not installed. Run "pnpm verify:playwright:install" from apps/web, then retry.`,
      );
    }

    throw error;
  }

  const context = await browser.newContext({
    viewport: {
      width: 1440,
      height: 1100,
    },
  });

  try {
    for (const page of project.pages) {
      const routeUrl = new URL(page.path, `${baseUrl}/`).toString();
      const browserPage = await context.newPage();
      const pageErrors: string[] = [];
      const consoleErrors: string[] = [];
      const failedRequests: string[] = [];

      browserPage.on("pageerror", (error) => {
        pageErrors.push(error.message);
      });

      browserPage.on("console", (message) => {
        if (message.type() === "error") {
          consoleErrors.push(message.text());
        }
      });

      browserPage.on("requestfailed", (request) => {
        failedRequests.push(`${request.method()} ${request.url()}`);
      });

      const response = await browserPage.goto(routeUrl, {
        waitUntil: "networkidle",
      });

      if (!response || !response.ok()) {
        throw new Error(
          `Browser navigation for ${describePage(page)} failed with ${
            response ? response.status() : "no response"
          }.`,
        );
      }

      await browserPage.locator("main").waitFor({ state: "visible" });

      const renderedText = normalizeSnippet(await browserPage.locator("main").innerText());
      const expectedStrings = collectExpectedStrings(project, page);

      if (expectedStrings.length > 0 && !expectedStrings.some((entry) => renderedText.includes(entry))) {
        throw new Error(
          `Browser-rendered output for ${describePage(page)} did not include any expected content. Checked: ${expectedStrings.join(", ")}`,
        );
      }

      const title = await browserPage.title();
      if (!title.includes("Generated by Drag and Drop Studio")) {
        throw new Error(`Unexpected document title for ${describePage(page)}: ${title}`);
      }

      const builderMainStyles = await browserPage.locator("main").evaluate((element) => {
        const styles = window.getComputedStyle(element);
        return {
          minHeight: styles.minHeight,
          color: styles.color,
        };
      });

      if (!builderMainStyles.minHeight || builderMainStyles.color === "rgba(0, 0, 0, 0)") {
        throw new Error(`Rendered styles for ${describePage(page)} looked incomplete in the browser.`);
      }

      await browserPage.screenshot({
        path: path.join(screenshotsDir, `${routePathToFileStem(page.path)}.png`),
        fullPage: true,
      });

      await browserPage.close();

      if (pageErrors.length > 0) {
        throw new Error(`Browser page errors for ${describePage(page)}: ${pageErrors.join(" | ")}`);
      }

      if (consoleErrors.length > 0) {
        throw new Error(`Browser console errors for ${describePage(page)}: ${consoleErrors.join(" | ")}`);
      }

      const significantFailedRequests = failedRequests.filter((entry) => !entry.startsWith("GET data:"));
      if (significantFailedRequests.length > 0) {
        throw new Error(
          `Browser request failures for ${describePage(page)}: ${significantFailedRequests.join(" | ")}`,
        );
      }
    }
  } finally {
    await context.close();
    await browser.close();
  }
}

async function verifyProject({
  port,
  project,
  projectId,
  verifyBrowser,
}: {
  port: number;
  project: BuilderProject;
  projectId: string;
  verifyBrowser: boolean;
}) {
  const workspaceDir = path.join(outputRoot, projectId, getStarterArchiveBaseName(project));
  const logsDir = path.join(workspaceDir, ".verification");
  const screenshotsDir = path.join(logsDir, "screenshots");

  console.log(`\n[verify:starters] Preparing ${projectId} in ${workspaceDir}`);
  await writeStarterWorkspace(project, workspaceDir);
  await fs.mkdir(logsDir, { recursive: true });
  await fs.mkdir(screenshotsDir, { recursive: true });

  await runCommand({
    cwd: workspaceDir,
    label: `${projectId} install`,
    args: ["install"],
    stdoutPath: path.join(logsDir, "install.stdout.log"),
    stderrPath: path.join(logsDir, "install.stderr.log"),
  });

  await runCommand({
    cwd: workspaceDir,
    label: `${projectId} build`,
    args: ["build"],
    stdoutPath: path.join(logsDir, "build.stdout.log"),
    stderrPath: path.join(logsDir, "build.stderr.log"),
  });

  const server = await startServer(workspaceDir, port, logsDir);

  try {
    await verifyRoutes(project, server.baseUrl);
    if (verifyBrowser) {
      await verifyRoutesInBrowser(project, server.baseUrl, screenshotsDir);
    }
  } finally {
    await server.stop();
  }

  console.log(
    `[verify:starters] ${projectId} passed ${
      verifyBrowser ? "runtime and browser-rendered" : "runtime"
    } checks on port ${port}.`,
  );
}

async function main() {
  const args = process.argv.slice(2);
  const verifyBrowser = args.includes("--browser");
  const requestedTemplate = args.find((entry) => !entry.startsWith("--")) as BuilderTemplateId | undefined;
  const templateIds = requestedTemplate
    ? builderTemplateCatalog
        .map((entry) => entry.id)
        .filter((entry): entry is BuilderTemplateId => entry === requestedTemplate)
    : builderTemplateCatalog.map((entry) => entry.id);

  if (requestedTemplate && templateIds.length === 0) {
    throw new Error(
      `Unknown template "${requestedTemplate}". Expected one of: ${builderTemplateCatalog.map((entry) => entry.id).join(", ")}`,
    );
  }

  await fs.mkdir(outputRoot, { recursive: true });

  const verificationProjects = [
    ...templateIds.map((templateId) => createProjectFromTemplate(templateId)),
    createBlockContractVerificationProject(),
  ];
  assertParityCoverage(verificationProjects);

  for (const [index, templateId] of templateIds.entries()) {
    await verifyProject({
      port: basePort + index,
      project: createProjectFromTemplate(templateId),
      projectId: templateId,
      verifyBrowser,
    });
  }

  if (!requestedTemplate) {
    await verifyProject({
      port: basePort + templateIds.length,
      project: createBlockContractVerificationProject(),
      projectId: "block-contract-coverage",
      verifyBrowser,
    });
  }

  console.log(
    `\n[verify:starters] Completed ${
      templateIds.length + (requestedTemplate ? 0 : 1)
    } verification run(s).`,
  );
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
