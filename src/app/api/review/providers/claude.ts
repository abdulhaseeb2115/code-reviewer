import type { ProviderCall } from "./types";

const ANTHROPIC_URL = "https://api.anthropic.com/v1/messages";
const DEFAULT_MODEL = "claude-3-5-haiku-20241022";

export const callClaude: ProviderCall = async (payload, apiKey, options) => {
  if (!apiKey?.trim()) throw new Error("Anthropic API key is required.");
  const model = options?.modelId?.trim() || DEFAULT_MODEL;
  const res = await fetch(ANTHROPIC_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey.trim(),
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model,
      max_tokens: 4096,
      system: payload.systemPrompt,
      messages: [{ role: "user", content: payload.userPrompt }],
    }),
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Anthropic API error: ${res.status} ${err}`);
  }
  const data = (await res.json()) as {
    content?: { type: string; text?: string }[];
  };
  const textBlock = data.content?.find((c) => c.type === "text");
  const text = textBlock?.text;
  if (typeof text !== "string") throw new Error("Claude returned no text");
  return text;
};
