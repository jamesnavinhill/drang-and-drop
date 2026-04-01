import { gateway, type LanguageModel } from "ai";
import { createOpenAI } from "@ai-sdk/openai";

function normalizeProvider(value: string | undefined) {
  const trimmed = value?.trim().toLowerCase();

  if (trimmed === "gateway" || trimmed === "openai") {
    return trimmed;
  }

  return null;
}

export function resolveAssistantModel(): {
  model: LanguageModel;
  providerLabel: string;
  modelId: string;
} {
  const configuredProvider = normalizeProvider(process.env.BUILDER_AI_PROVIDER);
  const modelId = process.env.BUILDER_AI_MODEL?.trim();
  const hasGatewayKey = Boolean(process.env.AI_GATEWAY_API_KEY);
  const hasOpenAIKey = Boolean(process.env.OPENAI_API_KEY);

  if (!modelId) {
    throw new Error(
      "Missing BUILDER_AI_MODEL. Set a model id such as an AI Gateway model string or a direct OpenAI model id.",
    );
  }

  if (configuredProvider === "gateway") {
    if (!hasGatewayKey) {
      throw new Error("BUILDER_AI_PROVIDER is set to gateway, but AI_GATEWAY_API_KEY is missing.");
    }

    return {
      model: gateway(modelId),
      providerLabel: "Vercel AI Gateway",
      modelId,
    };
  }

  if (configuredProvider === "openai") {
    if (!hasOpenAIKey) {
      throw new Error("BUILDER_AI_PROVIDER is set to openai, but OPENAI_API_KEY is missing.");
    }

    const openai = createOpenAI({ apiKey: process.env.OPENAI_API_KEY });

    return {
      model: openai(modelId),
      providerLabel: "OpenAI",
      modelId,
    };
  }

  if (hasGatewayKey && !hasOpenAIKey) {
    return {
      model: gateway(modelId),
      providerLabel: "Vercel AI Gateway",
      modelId,
    };
  }

  if (hasOpenAIKey && !hasGatewayKey) {
    const openai = createOpenAI({ apiKey: process.env.OPENAI_API_KEY });

    return {
      model: openai(modelId),
      providerLabel: "OpenAI",
      modelId,
    };
  }

  if (!hasGatewayKey && !hasOpenAIKey) {
    throw new Error(
      "No AI provider credentials found. Configure either AI_GATEWAY_API_KEY or OPENAI_API_KEY, plus BUILDER_AI_MODEL.",
    );
  }

  throw new Error(
    "Multiple AI providers are configured. Set BUILDER_AI_PROVIDER to either gateway or openai so the assistant can resolve the correct backend.",
  );
}
