import type { ProviderCall } from "./types";

const OPENAI_URL = "https://api.openai.com/v1/chat/completions";
const DEFAULT_MODEL = "gpt-4o-mini";

export const callOpenAI: ProviderCall = async (payload, apiKey, options) => {
  if (!apiKey?.trim()) throw new Error("OpenAI API key is required.");
  const model = options?.modelId?.trim() || DEFAULT_MODEL;
  const res = await fetch(OPENAI_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey.trim()}`,
    },
    body: JSON.stringify({
      model,
      messages: [
        { role: "system", content: payload.systemPrompt },
        { role: "user", content: payload.userPrompt },
      ],
      response_format: { type: "json_object" },
      max_tokens: 4096,
    }),
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`OpenAI API error: ${res.status} ${err}`);
  }
  const data = (await res.json()) as { choices?: { message?: { content?: string } }[] };
  const content = data.choices?.[0]?.message?.content;
  if (typeof content !== "string") throw new Error("OpenAI returned no content");
  return content;
};
