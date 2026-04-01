"use client";

import { DefaultChatTransport } from "ai";
import { useChat } from "@ai-sdk/react";
import { Sparkles } from "lucide-react";
import { useState } from "react";

import { isAssistantFeatureEnabled } from "@/lib/ai/config";
import { buildBuilderAssistantContext } from "@/lib/ai/context";
import type { AssistantMode } from "@/lib/ai/types";
import { getSelectedNode, useBuilderStore } from "@/lib/builder/store";
import { cn } from "@/lib/utils";

function getMessageText(message: { parts?: Array<{ type: string; text?: string }> }) {
  return (
    message.parts
      ?.filter((part) => part.type === "text" && typeof part.text === "string")
      .map((part) => part.text)
      .join("\n")
      .trim() ?? ""
  );
}

const starterPrompts = [
  "Help me make this page feel more premium.",
  "What should I adjust first for theme polish?",
  "How would you tighten the hero copy?",
] as const;

export function AssistantPanel({
  assistantMode,
}: {
  assistantMode: AssistantMode;
}) {
  const assistantEnabled = isAssistantFeatureEnabled();
  const [input, setInput] = useState("");
  const project = useBuilderStore((state) => state.project);
  const selectedPageId = useBuilderStore((state) => state.selectedPageId);
  const selectedNode = useBuilderStore(getSelectedNode);
  const previewMode = useBuilderStore((state) => state.previewMode);

  const builderContext = buildBuilderAssistantContext({
    assistantMode,
    previewMode,
    project,
    selectedPageId,
    selectedNodeId: selectedNode?.id ?? null,
  });

  const { messages, sendMessage, status, error, stop } = useChat({
    transport: new DefaultChatTransport({
      api: "/api/chat",
    }),
  });

  function submitPrompt(rawValue: string) {
    const value = rawValue.trim();
    if (!assistantEnabled || !value || status !== "ready") {
      return;
    }

    sendMessage(
      { text: value },
      {
        body: {
          context: builderContext,
        },
      },
    );
    setInput("");
  }

  return (
    <div className="flex h-full min-h-0 flex-col">
      <section className="rounded-[24px] border border-border bg-white/72 p-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted">Assistant</p>
            <h2 className="mt-1 text-lg font-semibold text-foreground">Streamed, context-aware guidance</h2>
          </div>
          <span className="rounded-full border border-border bg-white/80 px-3 py-1 text-[11px] font-semibold text-muted">
            {assistantMode === "proposal" ? "Proposal first" : "Auto-apply pref"}
          </span>
        </div>

        <div className="mt-3 rounded-[20px] border border-border/80 bg-white/76 px-3 py-3 text-sm leading-6 text-muted">
          {assistantEnabled
            ? "The assistant receives the active page, selection, preview mode, and available component catalog on each send."
            : "The assistant is wired but dormant. Keep the shell polished now, then enable live model requests when the team is ready."}
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          {starterPrompts.map((prompt) => (
            <button
              key={prompt}
              type="button"
              onClick={() => submitPrompt(prompt)}
              disabled={!assistantEnabled || status !== "ready"}
              className={cn(
                "builder-pill rounded-full px-3 py-2 text-xs font-semibold text-foreground",
                (!assistantEnabled || status !== "ready") && "cursor-not-allowed opacity-60",
              )}
            >
              {prompt}
            </button>
          ))}
        </div>
      </section>

      <div className="builder-scrollbar mt-4 flex-1 space-y-3 overflow-y-auto pr-1">
        {messages.length === 0 ? (
          <article className="rounded-[24px] border border-border bg-white/76 px-4 py-4">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-muted">
              <Sparkles className="h-3.5 w-3.5" />
              <span>Assistant</span>
            </div>
            <p className="mt-3 text-sm leading-6 text-foreground">
              {assistantEnabled
                ? "Live assistant transport is wired. Ask for help with copy, theme polish, or safe layout direction once your provider env vars are configured."
                : "Assistant transport is wired, but live calls are intentionally off. Enable the feature flag and provider env vars later when you want to start using it."}
            </p>
          </article>
        ) : null}

        {messages.map((message) => {
          const text = getMessageText(message);

          return (
            <article
              key={message.id}
              className={cn(
                "rounded-[24px] border px-4 py-4",
                message.role === "assistant"
                  ? "border-border bg-white/76"
                  : "border-accent/30 bg-accent/8",
              )}
            >
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-muted">
                {message.role === "assistant" ? <Sparkles className="h-3.5 w-3.5" /> : null}
                <span>{message.role === "assistant" ? "Assistant" : "You"}</span>
              </div>
              <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-foreground">
                {text || (status === "streaming" && message.role === "assistant" ? "Thinking..." : "No text returned.")}
              </p>
            </article>
          );
        })}

        {error ? (
          <article className="rounded-[24px] border border-danger/30 bg-orange-50 px-4 py-4">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-danger">Assistant error</p>
            <p className="mt-2 text-sm leading-6 text-foreground">{error.message}</p>
          </article>
        ) : null}
      </div>

      <section className="mt-4 rounded-[24px] border border-border bg-white/80 p-3">
        <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-muted">
          Assistant Composer
        </label>
        <div className="flex items-end gap-3">
          <textarea
            value={input}
            onChange={(event) => setInput(event.target.value)}
            placeholder={
              assistantEnabled
                ? "Ask for help with copy, layout, or theme direction..."
                : "Assistant is dormant until NEXT_PUBLIC_BUILDER_ASSISTANT_ENABLED=true"
            }
            rows={3}
            className="min-h-24 flex-1 rounded-[20px] border border-border bg-white px-4 py-3 text-sm text-foreground outline-none"
          />
          {!assistantEnabled ? (
            <button
              type="button"
              disabled
              className="inline-flex h-12 items-center justify-center rounded-full border border-border bg-white px-4 text-sm font-semibold text-muted"
            >
              Disabled
            </button>
          ) : null}
          {status === "streaming" ? (
            <button
              type="button"
              onClick={() => stop()}
              className="inline-flex h-12 items-center justify-center rounded-full border border-border bg-white px-4 text-sm font-semibold text-foreground"
            >
              Stop
            </button>
          ) : assistantEnabled ? (
            <button
              type="button"
              onClick={() => submitPrompt(input)}
              disabled={status !== "ready"}
              className={cn(
                "inline-flex h-12 items-center justify-center rounded-full bg-foreground px-4 text-sm font-semibold text-background transition-transform hover:-translate-y-0.5",
                status !== "ready" && "cursor-not-allowed opacity-60 hover:translate-y-0",
              )}
            >
              Send
            </button>
          ) : null}
        </div>
      </section>
    </div>
  );
}
