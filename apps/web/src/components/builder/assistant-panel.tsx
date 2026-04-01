"use client";

import { Sparkles } from "lucide-react";
import { useState } from "react";

import { cn } from "@/lib/utils";

export type AssistantMode = "proposal" | "auto-apply";

interface AssistantMessage {
  id: string;
  role: "assistant" | "user";
  content: string;
  points?: string[];
}

function createId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function buildLocalResponse(prompt: string, mode: AssistantMode): AssistantMessage {
  const lowerPrompt = prompt.toLowerCase();
  const modeLabel = mode === "proposal" ? "proposal-first" : "auto-apply preference";

  if (/(theme|color|font|typography|palette|radius|shadow)/.test(lowerPrompt)) {
    return {
      id: createId(),
      role: "assistant",
      content: `I would start with a small ${modeLabel} theme pass before touching layout.`,
      points: [
        "Tune accent and surface colors first so every block feels more intentional.",
        "Choose one font direction, then adjust radius and shadow depth for consistency.",
        "Review the result in desktop first, then check tablet and mobile preview.",
      ],
    };
  }

  if (/(copy|headline|hero|cta|messaging|text)/.test(lowerPrompt)) {
    return {
      id: createId(),
      role: "assistant",
      content: `I would keep this focused on copy and use the ${modeLabel} path for content edits.`,
      points: [
        "Start with the hero eyebrow, headline, body, and CTA labels.",
        "Tighten long sentences so the canvas reads faster at a glance.",
        "Use the Selection tab to update only the chosen block before broadening the pass.",
      ],
    };
  }

  if (/(layout|spacing|section|grid|stack|structure|canvas)/.test(lowerPrompt)) {
    return {
      id: createId(),
      role: "assistant",
      content: `I would treat layout changes carefully and keep them reviewable in ${modeLabel} mode.`,
      points: [
        "Add or reorder one section at a time so the page hierarchy stays clear.",
        "Use stack and grid primitives before introducing more visual complexity.",
        "After each layout change, re-check the active page in tablet and mobile preview.",
      ],
    };
  }

  return {
    id: createId(),
    role: "assistant",
    content: `This assistant workspace is ready for proposal-first builder guidance while full model wiring comes next.`,
    points: [
      "Ask for theme, copy, or layout direction and I will suggest the safest next pass.",
      "The future Vercel AI SDK integration can turn these proposals into structured review cards.",
      "For now, this panel is the right place to shape assistant UX before tool execution is connected.",
    ],
  };
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
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<AssistantMessage[]>([
    {
      id: createId(),
      role: "assistant",
      content: "Proposal-first assistant foundation is in place. Ask for guidance on layout, copy, or theme polish.",
      points: [
        "Conversation and composer stay together in this sidebar mode.",
        "Suggestions are framed as safe proposals before any direct editing workflow exists.",
        "Model and tool execution can be wired into this surface next.",
      ],
    },
  ]);

  function submitPrompt(rawValue: string) {
    const value = rawValue.trim();
    if (!value) {
      return;
    }

    setMessages((current) => [
      ...current,
      { id: createId(), role: "user", content: value },
      buildLocalResponse(value, assistantMode),
    ]);
    setInput("");
  }

  return (
    <div className="flex h-full min-h-0 flex-col">
      <section className="rounded-[24px] border border-border bg-white/72 p-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted">Assistant</p>
            <h2 className="mt-1 text-lg font-semibold text-foreground">Helpful, proposal-first guidance</h2>
          </div>
          <span className="rounded-full border border-border bg-white/80 px-3 py-1 text-[11px] font-semibold text-muted">
            {assistantMode === "proposal" ? "Proposal first" : "Auto-apply pref"}
          </span>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          {starterPrompts.map((prompt) => (
            <button
              key={prompt}
              type="button"
              onClick={() => submitPrompt(prompt)}
              className="builder-pill rounded-full px-3 py-2 text-xs font-semibold text-foreground"
            >
              {prompt}
            </button>
          ))}
        </div>
      </section>

      <div className="builder-scrollbar mt-4 flex-1 space-y-3 overflow-y-auto pr-1">
        {messages.map((message) => (
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
            <p className="mt-3 text-sm leading-6 text-foreground">{message.content}</p>
            {message.points?.length ? (
              <div className="mt-4 grid gap-2">
                {message.points.map((point) => (
                  <div
                    key={point}
                    className="rounded-[18px] border border-border/80 bg-white/72 px-3 py-2 text-sm leading-6 text-muted"
                  >
                    {point}
                  </div>
                ))}
              </div>
            ) : null}
          </article>
        ))}
      </div>

      <section className="mt-4 rounded-[24px] border border-border bg-white/80 p-3">
        <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-muted">
          Assistant Composer
        </label>
        <div className="flex items-end gap-3">
          <textarea
            value={input}
            onChange={(event) => setInput(event.target.value)}
            placeholder="Ask for help with copy, layout, or theme direction..."
            rows={3}
            className="min-h-24 flex-1 rounded-[20px] border border-border bg-white px-4 py-3 text-sm text-foreground outline-none"
          />
          <button
            type="button"
            onClick={() => submitPrompt(input)}
            className="inline-flex h-12 items-center justify-center rounded-full bg-foreground px-4 text-sm font-semibold text-background transition-transform hover:-translate-y-0.5"
          >
            Send
          </button>
        </div>
      </section>
    </div>
  );
}
