import { spawn } from "node:child_process";
import { promises as fs } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import {
  builderTemplateCatalog,
  createProjectFromTemplate,
  type BuilderTemplateId,
} from "../src/lib/builder/default-project";
import {
  getStarterArchiveBaseName,
  getStarterProjectFiles,
} from "../src/lib/builder/starter-artifacts";
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

    for (const childId of node.children) {
      visit(childId);
    }
  }

  for (const rootId of page.rootIds) {
    visit(rootId);
  }

  return Array.from(values).slice(0, 6);
}

function describePage(page: BuilderPage) {
  return page.path === "/" ? "home route" : page.path;
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

async function verifyTemplate(templateId: BuilderTemplateId, port: number) {
  const project = createProjectFromTemplate(templateId);
  const workspaceDir = path.join(outputRoot, templateId, getStarterArchiveBaseName(project));
  const logsDir = path.join(workspaceDir, ".verification");

  console.log(`\n[verify:starters] Preparing ${templateId} in ${workspaceDir}`);
  await writeStarterWorkspace(project, workspaceDir);
  await fs.mkdir(logsDir, { recursive: true });

  await runCommand({
    cwd: workspaceDir,
    label: `${templateId} install`,
    args: ["install"],
    stdoutPath: path.join(logsDir, "install.stdout.log"),
    stderrPath: path.join(logsDir, "install.stderr.log"),
  });

  await runCommand({
    cwd: workspaceDir,
    label: `${templateId} build`,
    args: ["build"],
    stdoutPath: path.join(logsDir, "build.stdout.log"),
    stderrPath: path.join(logsDir, "build.stderr.log"),
  });

  const server = await startServer(workspaceDir, port, logsDir);

  try {
    await verifyRoutes(project, server.baseUrl);
  } finally {
    await server.stop();
  }

  console.log(`[verify:starters] ${templateId} passed route and static-asset checks on port ${port}.`);
}

async function main() {
  const requestedTemplate = process.argv[2] as BuilderTemplateId | undefined;
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

  for (const [index, templateId] of templateIds.entries()) {
    await verifyTemplate(templateId, basePort + index);
  }

  console.log(`\n[verify:starters] Completed ${templateIds.length} template verification run(s).`);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
