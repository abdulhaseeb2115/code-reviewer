import { NextResponse } from "next/server";
import type { ProviderId } from "@/types";
import { HF_QUOTA_EXCEEDED_CODE } from "@/types";
import { MODELS } from "@/constants";
import { getSystemPrompt, buildUserPrompt } from "./prompt";
import { normalizeReviewResponse } from "./providers/normalize";
import { callHuggingFace, HFQuotaExceededError } from "./providers/huggingface";
import { callOpenAI } from "./providers/openai";
import { callClaude } from "./providers/claude";
import { callGemini } from "./providers/gemini";

const MAX_CODE_LENGTH = 20_000;

function getProviderFn(provider: ProviderId) {
  switch (provider) {
    case "huggingface":
      return callHuggingFace;
    case "openai":
      return callOpenAI;
    case "claude":
      return callClaude;
    case "gemini":
      return callGemini;
    default:
      throw new Error(`Unknown provider: ${provider}`);
  }
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as unknown;
    if (!body || typeof body !== "object") {
      return NextResponse.json(
        { error: "Invalid body: expected object" },
        { status: 400 }
      );
    }
    const { code, selectedModelId, apiKey } = body as {
      code?: unknown;
      selectedModelId?: unknown;
      apiKey?: unknown;
    };
    if (typeof code !== "string") {
      return NextResponse.json(
        { error: "Missing or invalid 'code' (string)" },
        { status: 400 }
      );
    }
    const trimmedCode = code.trim();
    if (!trimmedCode) {
      return NextResponse.json(
        { error: "Code cannot be empty" },
        { status: 400 }
      );
    }
    if (trimmedCode.length > MAX_CODE_LENGTH) {
      return NextResponse.json(
        { error: `Code must be at most ${MAX_CODE_LENGTH} characters` },
        { status: 400 }
      );
    }
    if (typeof selectedModelId !== "string" || !selectedModelId.trim()) {
      return NextResponse.json(
        { error: "Missing or invalid 'selectedModelId'" },
        { status: 400 }
      );
    }
    const model = MODELS.find((m) => m.id === selectedModelId.trim());
    if (!model) {
      return NextResponse.json(
        { error: "Unknown model" },
        { status: 400 }
      );
    }
    if (model.requiresKey && (typeof apiKey !== "string" || !apiKey.trim())) {
      return NextResponse.json(
        { error: "API key is required for this model" },
        { status: 400 }
      );
    }

    const systemPrompt = getSystemPrompt();
    const userPrompt = buildUserPrompt(trimmedCode);
    const options = { modelId: model.modelId };

    if (model.provider === "huggingface") {
      const hfKey = typeof apiKey === "string" && apiKey.trim() ? apiKey.trim() : undefined;
      try {
        const rawText = await callHuggingFace(
          { systemPrompt, userPrompt },
          hfKey,
          options
        );
        const normalized = normalizeReviewResponse(rawText);
        return NextResponse.json(normalized);
      } catch (err) {
        if (err instanceof HFQuotaExceededError) {
          return NextResponse.json(
            {
              error: "Free Hugging Face inference is currently unavailable.",
              code: HF_QUOTA_EXCEEDED_CODE,
            },
            { status: 503 }
          );
        }
        const message = err instanceof Error ? err.message : "Review failed";
        return NextResponse.json({ error: message }, { status: 500 });
      }
    }

    const call = getProviderFn(model.provider);
    const rawText = await call(
      { systemPrompt, userPrompt },
      model.requiresKey ? (apiKey as string).trim() : undefined,
      options
    );
    const normalized = normalizeReviewResponse(rawText);
    return NextResponse.json(normalized);
  } catch (err) {
    if (err instanceof HFQuotaExceededError) {
      return NextResponse.json(
        {
          error: "Free Hugging Face inference is currently unavailable.",
          code: HF_QUOTA_EXCEEDED_CODE,
        },
        { status: 503 }
      );
    }
    const message = err instanceof Error ? err.message : "Review failed";
    const status = message.includes("required") ? 400 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
