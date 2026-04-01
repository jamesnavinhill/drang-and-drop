import { convertToModelMessages, streamText, type UIMessage } from "ai";

import { buildAssistantSystemPrompt } from "@/lib/ai/prompt";
import { resolveAssistantModel } from "@/lib/ai/model";
import { builderAssistantContextSchema } from "@/lib/ai/types";

export const maxDuration = 30;

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      messages?: UIMessage[];
      context?: unknown;
    };

    const contextResult = builderAssistantContextSchema.safeParse(body.context);

    if (!contextResult.success) {
      return Response.json(
        {
          error:
            "Invalid builder assistant context. The client request is missing the structured project/page/selection payload.",
        },
        { status: 400 },
      );
    }

    const messages = Array.isArray(body.messages) ? body.messages : [];
    const { model } = resolveAssistantModel();

    const result = streamText({
      model,
      system: buildAssistantSystemPrompt(contextResult.data),
      messages: await convertToModelMessages(messages),
    });

    return result.toUIMessageStreamResponse();
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown assistant error.";
    return Response.json({ error: message }, { status: 500 });
  }
}
