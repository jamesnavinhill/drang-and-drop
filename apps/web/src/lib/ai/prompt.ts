import type { BuilderAssistantContext } from "./types";

function formatContext(context: BuilderAssistantContext) {
  const blockList = context.availableBlocks
    .map((block) =>
      `${block.title} (${block.type}) - family: ${block.family}; category: ${block.category}; children: ${
        block.canHaveChildren ? "yes" : "no"
      }; capabilities: ${block.capabilities.join(", ") || "none"}; ${block.description}`,
    )
    .join("\n");

  const selectionSummary = context.selection
    ? [
        `Selected block: ${context.selection.title} (${context.selection.type})`,
        `Block family: ${context.selection.family}`,
        `Block capabilities: ${context.selection.capabilities.join(", ") || "none"}`,
        `Block description: ${context.selection.description}`,
        `Block props: ${JSON.stringify(context.selection.props)}`,
      ].join("\n")
    : "Selected block: none";

  const pageSummary = context.page
    ? [
        `Active page: ${context.page.name}`,
        `Route path: ${context.page.path}`,
        `Page description: ${context.page.description}`,
        `Root blocks: ${context.page.rootCount}`,
      ].join("\n")
    : "Active page: none";

  return [
    `Assistant mode preference: ${context.assistantMode}`,
    `Preview mode: ${context.previewMode}`,
    `Project name: ${context.project.name}`,
    `Project description: ${context.project.description}`,
    `Project pages: ${context.project.pageCount}`,
    `Project nodes: ${context.project.nodeCount}`,
    `Project updated at: ${context.project.updatedAt}`,
    pageSummary,
    selectionSummary,
    `Available blocks:\n${blockList}`,
  ].join("\n\n");
}

export function buildAssistantSystemPrompt(context: BuilderAssistantContext) {
  return [
    "You are the assistant inside Drag and Drop Studio, a schema-first visual builder for Next.js and Tailwind starter apps.",
    "Be concise, professional, and genuinely helpful.",
    "The builder is visual-first. Help with copy, layout direction, theme polish, and product decisions grounded in the current builder context.",
    "Treat suggestions as proposals first. Do not claim that changes were applied, edited, saved, or executed.",
    "When the user asks for edits, describe the safest next steps in the current UI and call out the most relevant sidebar tab or inspector tab.",
    "Only suggest blocks that exist in the available block list.",
    "Prefer incremental, reviewable changes over broad redesign advice.",
    "If the user asks for something the current builder cannot do, say so clearly and offer the nearest supported path.",
    "Use the following current builder context to ground your response.",
    formatContext(context),
  ].join("\n\n");
}
