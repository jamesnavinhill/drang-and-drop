import { spawn } from "node:child_process";
import { promises as fs } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { chromium, type Page } from "playwright";

import type { ComponentType } from "../src/lib/builder/types";
import type { BuilderVerificationSnapshot } from "../src/lib/builder/verification";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const appDir = path.resolve(__dirname, "..");
const outputRoot = path.join(appDir, "output", "builder-dnd-verification");
const port = Number(process.env.BUILDER_DND_VERIFY_PORT ?? 3206);

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
      if (response.ok || response.status === 307 || response.status === 308) {
        return;
      }
    } catch {
      // Keep polling until the server is up.
    }

    await new Promise((resolve) => setTimeout(resolve, 1000));
  }

  throw new Error(`Timed out waiting for ${url} after ${timeoutMs}ms.`);
}

async function startServer(logsDir: string) {
  const child = spawnPnpm(["start", "--port", String(port)], appDir);
  let stdout = "";
  let stderr = "";

  child.stdout.on("data", (chunk) => {
    stdout += chunk.toString();
  });

  child.stderr.on("data", (chunk) => {
    stderr += chunk.toString();
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

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) {
    throw new Error(message);
  }
}

function getCurrentPage(snapshot: BuilderVerificationSnapshot) {
  assert(snapshot.currentPage, "Builder verification snapshot did not include a current page.");
  return snapshot.currentPage;
}

function getNodeTypes(snapshot: BuilderVerificationSnapshot, nodeIds: string[]) {
  return nodeIds.map((nodeId) => snapshot.nodes[nodeId]?.type ?? "missing");
}

function assertNodeTypeSequence(
  snapshot: BuilderVerificationSnapshot,
  nodeIds: string[],
  expectedTypes: ComponentType[],
  label: string,
) {
  const actualTypes = getNodeTypes(snapshot, nodeIds);

  if (
    actualTypes.length !== expectedTypes.length ||
    actualTypes.some((type, index) => type !== expectedTypes[index])
  ) {
    throw new Error(`${label} mismatch. Expected ${expectedTypes.join(" -> ")}, received ${actualTypes.join(" -> ")}.`);
  }
}

async function getBuilderSnapshot(page: Page) {
  await page.waitForFunction(() => Boolean((window as Window & { __builderVerification?: unknown }).__builderVerification));
  const snapshot = await page.evaluate(
    () => (window as Window & { __builderVerification?: { getSnapshot: () => BuilderVerificationSnapshot } }).__builderVerification?.getSnapshot() ?? null,
  );
  assert(snapshot, "Builder verification hook was not available in the browser session.");
  return snapshot;
}

async function expectEditorNotice(page: Page, expectedText: string) {
  const notice = page.locator("[data-builder-editor-notice]");
  await notice.waitFor({ state: "visible" });
  const noticeText = await notice.textContent();
  assert(noticeText?.includes(expectedText), `Expected editor notice to include "${expectedText}". Received "${noticeText ?? ""}".`);
}

async function dragBetween({
  page,
  sourceSelector,
  targetSelector,
  targetXFactor = 0.5,
  targetYFactor = 0.5,
}: {
  page: Page;
  sourceSelector: string;
  targetSelector: string;
  targetXFactor?: number;
  targetYFactor?: number;
}) {
  await page.locator(sourceSelector).waitFor({ state: "visible" });
  await page.locator(targetSelector).waitFor({ state: "visible" });
  await page.evaluate(
    async ({ sourceSelector: source, targetSelector: target, targetXFactor: targetX, targetYFactor: targetY }) => {
      const verification = (
        window as Window & {
          __builderVerification?: {
            dragBetween: (options: {
              sourceSelector: string;
              targetSelector: string;
              targetXFactor?: number;
              targetYFactor?: number;
            }) => Promise<void>;
          };
        }
      ).__builderVerification;

      if (!verification) {
        throw new Error("Builder verification hook was not available for drag automation.");
      }

      await verification.dragBetween({
        sourceSelector: source,
        targetSelector: target,
        targetXFactor: targetX,
        targetYFactor: targetY,
      });
    },
    {
      sourceSelector,
      targetSelector,
      targetXFactor,
      targetYFactor,
    },
  );
  await page.waitForTimeout(250);
}

async function verifyBuilderDnd(baseUrl: string, screenshotsDir: string) {
  let browser;

  try {
    browser = await chromium.launch({ headless: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);

    if (/executable doesn't exist|browserType\.launch/i.test(message)) {
      throw new Error('Playwright Chromium is not installed. Run "pnpm verify:playwright:install" from apps/web, then retry.');
    }

    throw error;
  }

  const context = await browser.newContext({
    viewport: {
      width: 1600,
      height: 1200,
    },
  });

  const page = await context.newPage();
  const pageErrors: string[] = [];
  const consoleErrors: string[] = [];
  const failedRequests: string[] = [];

  page.on("pageerror", (error) => {
    pageErrors.push(error.message);
  });

  page.on("console", (message) => {
    if (message.type() === "error") {
      consoleErrors.push(message.text());
    }
  });

  page.on("requestfailed", (request) => {
    failedRequests.push(`${request.method()} ${request.url()}`);
  });

  try {
    const response = await page.goto(`${baseUrl}/?builder-test=1`, {
      waitUntil: "networkidle",
    });

    if (!response || !response.ok()) {
      throw new Error(`Builder navigation failed with ${response ? response.status() : "no response"}.`);
    }

    await page.locator('[data-builder-action="reset"]').waitFor({ state: "visible" });
    await page.click('[data-builder-action="reset"]');
    await page.waitForTimeout(250);

    await page.click('[data-builder-sidebar-tab="pages"]');
    await page.click('[data-builder-page-tab="routes"]');
    await page.click('[data-builder-page-action="new"]');
    await page.waitForTimeout(250);

    let snapshot = await getBuilderSnapshot(page);
    let currentPage = getCurrentPage(snapshot);
    assert(currentPage.rootIds.length === 0, "Expected the new verification page to start empty.");

    await page.click('[data-builder-sidebar-tab="library"]');

    const pageDropTargetSelector = '[data-builder-drop-target^="page:"]';

    await dragBetween({
      page,
      sourceSelector: '[data-builder-palette="section"]',
      targetSelector: pageDropTargetSelector,
    });

    snapshot = await getBuilderSnapshot(page);
    currentPage = getCurrentPage(snapshot);
    assertNodeTypeSequence(snapshot, currentPage.rootIds, ["section"], "Root order after inserting section");
    const sectionId = currentPage.rootIds[0];

    await dragBetween({
      page,
      sourceSelector: '[data-builder-palette="text"]',
      targetSelector: `[data-builder-drop-target="node:${sectionId}"]`,
    });

    snapshot = await getBuilderSnapshot(page);
    assertNodeTypeSequence(snapshot, snapshot.nodes[sectionId]?.childIds ?? [], ["text"], "Section children after inserting text");

    await dragBetween({
      page,
      sourceSelector: '[data-builder-palette="button"]',
      targetSelector: `[data-builder-drop-target="node:${sectionId}"]`,
    });

    snapshot = await getBuilderSnapshot(page);
    const sectionChildIds = snapshot.nodes[sectionId]?.childIds ?? [];
    assertNodeTypeSequence(snapshot, sectionChildIds, ["text", "button"], "Section children after inserting button");

    const textId = sectionChildIds[0];
    const buttonId = sectionChildIds[1];

    await dragBetween({
      page,
      sourceSelector: `[data-builder-drag-handle="${buttonId}"]`,
      targetSelector: `[data-builder-node="${textId}"]`,
      targetYFactor: 0.2,
    });

    snapshot = await getBuilderSnapshot(page);
    assertNodeTypeSequence(
      snapshot,
      snapshot.nodes[sectionId]?.childIds ?? [],
      ["button", "text"],
      "Section children after reordering",
    );

    await page.click('[data-builder-action="clear-selection"]');
    await page.waitForTimeout(100);

    await dragBetween({
      page,
      sourceSelector: '[data-builder-palette="hero"]',
      targetSelector: pageDropTargetSelector,
    });

    snapshot = await getBuilderSnapshot(page);
    currentPage = getCurrentPage(snapshot);
    assertNodeTypeSequence(snapshot, currentPage.rootIds, ["section", "hero"], "Root order after inserting hero");

    const heroId = currentPage.rootIds[1];

    await dragBetween({
      page,
      sourceSelector: `[data-builder-drag-handle="${heroId}"]`,
      targetSelector: `[data-builder-node="${sectionId}"]`,
      targetYFactor: 0.2,
    });

    snapshot = await getBuilderSnapshot(page);
    currentPage = getCurrentPage(snapshot);
    assertNodeTypeSequence(snapshot, currentPage.rootIds, ["hero", "section"], "Root order after reordering");

    await dragBetween({
      page,
      sourceSelector: '[data-builder-palette="stack"]',
      targetSelector: `[data-builder-drop-target="node:${sectionId}"]`,
    });

    snapshot = await getBuilderSnapshot(page);
    assertNodeTypeSequence(
      snapshot,
      snapshot.nodes[sectionId]?.childIds ?? [],
      ["button", "text", "stack"],
      "Section children after inserting stack",
    );

    const stackId = (snapshot.nodes[sectionId]?.childIds ?? [])[2];
    assert(stackId, "Expected the inserted stack node to exist.");

    await dragBetween({
      page,
      sourceSelector: `[data-builder-drag-handle="${textId}"]`,
      targetSelector: `[data-builder-drop-target="node:${stackId}"]`,
    });

    snapshot = await getBuilderSnapshot(page);
    assertNodeTypeSequence(
      snapshot,
      snapshot.nodes[sectionId]?.childIds ?? [],
      ["button", "stack"],
      "Section children after moving text into nested stack",
    );
    assertNodeTypeSequence(
      snapshot,
      snapshot.nodes[stackId]?.childIds ?? [],
      ["text"],
      "Stack children after moving text into nested stack",
    );

    await page.click('[data-builder-library-view="all"]');
    await page.waitForTimeout(100);

    const rootIdsBeforeInvalidHeroMove = [...currentPage.rootIds];
    const sectionChildrenBeforeInvalidHeroMove = [...(snapshot.nodes[sectionId]?.childIds ?? [])];
    const stackChildrenBeforeInvalidHeroMove = [...(snapshot.nodes[stackId]?.childIds ?? [])];

    await dragBetween({
      page,
      sourceSelector: `[data-builder-drag-handle="${heroId}"]`,
      targetSelector: `[data-builder-drop-target="node:${sectionId}"]`,
    });

    snapshot = await getBuilderSnapshot(page);
    currentPage = getCurrentPage(snapshot);
    assertNodeTypeSequence(snapshot, currentPage.rootIds, ["hero", "section"], "Root order after invalid hero nesting");
    assertNodeTypeSequence(
      snapshot,
      snapshot.nodes[sectionId]?.childIds ?? [],
      ["button", "stack"],
      "Section children after invalid hero nesting",
    );
    assertNodeTypeSequence(
      snapshot,
      snapshot.nodes[stackId]?.childIds ?? [],
      ["text"],
      "Stack children after invalid hero nesting",
    );

    const rootIdsChangedAfterInvalidHeroMove =
      currentPage.rootIds.length !== rootIdsBeforeInvalidHeroMove.length ||
      currentPage.rootIds.some((nodeId, index) => nodeId !== rootIdsBeforeInvalidHeroMove[index]);
    const sectionChildrenChangedAfterInvalidHeroMove =
      (snapshot.nodes[sectionId]?.childIds ?? []).length !== sectionChildrenBeforeInvalidHeroMove.length ||
      (snapshot.nodes[sectionId]?.childIds ?? []).some(
        (nodeId, index) => nodeId !== sectionChildrenBeforeInvalidHeroMove[index],
      );
    const stackChildrenChangedAfterInvalidHeroMove =
      (snapshot.nodes[stackId]?.childIds ?? []).length !== stackChildrenBeforeInvalidHeroMove.length ||
      (snapshot.nodes[stackId]?.childIds ?? []).some(
        (nodeId, index) => nodeId !== stackChildrenBeforeInvalidHeroMove[index],
      );

    if (
      rootIdsChangedAfterInvalidHeroMove ||
      sectionChildrenChangedAfterInvalidHeroMove ||
      stackChildrenChangedAfterInvalidHeroMove
    ) {
      throw new Error("Invalid hero nesting unexpectedly changed the builder structure.");
    }

    await expectEditorNotice(page, "A hero block cannot be placed inside section.");

    await dragBetween({
      page,
      sourceSelector: `[data-builder-drag-handle="${sectionId}"]`,
      targetSelector: `[data-builder-drop-target="node:${stackId}"]`,
    });

    snapshot = await getBuilderSnapshot(page);
    currentPage = getCurrentPage(snapshot);
    assertNodeTypeSequence(snapshot, currentPage.rootIds, ["hero", "section"], "Root order after invalid descendant move");
    assertNodeTypeSequence(
      snapshot,
      snapshot.nodes[sectionId]?.childIds ?? [],
      ["button", "stack"],
      "Section children after invalid descendant move",
    );
    assertNodeTypeSequence(
      snapshot,
      snapshot.nodes[stackId]?.childIds ?? [],
      ["text"],
      "Stack children after invalid descendant move",
    );

    await expectEditorNotice(page, "A node cannot be inserted into one of its descendants.");

    const rootIdsBeforeInvalidDrop = [...currentPage.rootIds];
    const sectionChildrenBeforeInvalidDrop = [...(snapshot.nodes[sectionId]?.childIds ?? [])];
    const stackChildrenBeforeInvalidDrop = [...(snapshot.nodes[stackId]?.childIds ?? [])];

    await dragBetween({
      page,
      sourceSelector: '[data-builder-palette="navbar"]',
      targetSelector: `[data-builder-drop-target="node:${sectionId}"]`,
    });

    snapshot = await getBuilderSnapshot(page);
    currentPage = getCurrentPage(snapshot);
    assertNodeTypeSequence(snapshot, currentPage.rootIds, ["hero", "section"], "Root order after invalid navbar drop");
    assertNodeTypeSequence(
      snapshot,
      snapshot.nodes[sectionId]?.childIds ?? [],
      ["button", "stack"],
      "Section children after invalid navbar drop",
    );
    assertNodeTypeSequence(
      snapshot,
      snapshot.nodes[stackId]?.childIds ?? [],
      ["text"],
      "Stack children after invalid navbar drop",
    );

    const rootIdsChanged =
      currentPage.rootIds.length !== rootIdsBeforeInvalidDrop.length ||
      currentPage.rootIds.some((nodeId, index) => nodeId !== rootIdsBeforeInvalidDrop[index]);
    const sectionChildrenChanged =
      (snapshot.nodes[sectionId]?.childIds ?? []).length !== sectionChildrenBeforeInvalidDrop.length ||
      (snapshot.nodes[sectionId]?.childIds ?? []).some(
        (nodeId, index) => nodeId !== sectionChildrenBeforeInvalidDrop[index],
      );
    const stackChildrenChanged =
      (snapshot.nodes[stackId]?.childIds ?? []).length !== stackChildrenBeforeInvalidDrop.length ||
      (snapshot.nodes[stackId]?.childIds ?? []).some(
        (nodeId, index) => nodeId !== stackChildrenBeforeInvalidDrop[index],
      );

    if (rootIdsChanged || sectionChildrenChanged || stackChildrenChanged) {
      throw new Error("Invalid nested navbar drop unexpectedly changed the builder structure.");
    }

    await expectEditorNotice(page, "A navbar block cannot be placed inside section.");
    await page.click('[data-builder-editor-notice-dismiss="true"]');
    await page.locator("[data-builder-editor-notice]").waitFor({ state: "hidden" });

    await page.screenshot({
      path: path.join(screenshotsDir, "builder-dnd.png"),
      fullPage: true,
    });
  } finally {
    await context.close();
    await browser.close();
  }

  if (pageErrors.length > 0) {
    throw new Error(`Builder page errors: ${pageErrors.join(" | ")}`);
  }

  if (consoleErrors.length > 0) {
    throw new Error(`Builder console errors: ${consoleErrors.join(" | ")}`);
  }

  const significantFailedRequests = failedRequests.filter((entry) => !entry.startsWith("GET data:"));
  if (significantFailedRequests.length > 0) {
    throw new Error(`Builder request failures: ${significantFailedRequests.join(" | ")}`);
  }
}

async function main() {
  await fs.rm(outputRoot, { recursive: true, force: true });
  await fs.mkdir(outputRoot, { recursive: true });

  const logsDir = path.join(outputRoot, "logs");
  const screenshotsDir = path.join(outputRoot, "screenshots");

  await fs.mkdir(logsDir, { recursive: true });
  await fs.mkdir(screenshotsDir, { recursive: true });

  await runCommand({
    cwd: appDir,
    label: "builder verify build",
    args: ["build"],
    stdoutPath: path.join(logsDir, "build.stdout.log"),
    stderrPath: path.join(logsDir, "build.stderr.log"),
  });

  const server = await startServer(logsDir);

  try {
    await verifyBuilderDnd(server.baseUrl, screenshotsDir);
  } finally {
    await server.stop();
  }

  console.log(`[verify:dnd] Builder drag verification passed on ${server.baseUrl}.`);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
