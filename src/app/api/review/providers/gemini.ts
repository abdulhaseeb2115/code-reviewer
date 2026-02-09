import type { ProviderCall } from "./types";

const BASE_URL = "https://generativelanguage.googleapis.com/v1beta";
const DEFAULT_MODEL = "gemini-3-flash-preview";

export const callGemini: ProviderCall = async (payload, apiKey, options) => {
	if (!apiKey?.trim()) throw new Error("Gemini API key is required.");
	const model = options?.modelId?.trim() || DEFAULT_MODEL;
	const url = `${BASE_URL}/models/${model}:generateContent?key=${encodeURIComponent(
		apiKey.trim()
	)}`;
	const fullPrompt = `${payload.systemPrompt}\n\n${payload.userPrompt}`;
	const res = await fetch(url, {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify({
			contents: [{ parts: [{ text: fullPrompt }] }],
			generationConfig: {
				maxOutputTokens: 4096,
				responseMimeType: "application/json",
			},
		}),
	});
	if (!res.ok) {
		const err = await res.text();
		throw new Error(`Gemini API error: ${res.status} ${err}`);
	}
	const data = (await res.json()) as {
		candidates?: { content?: { parts?: { text?: string }[] } }[];
	};
	const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
	if (typeof text !== "string") throw new Error("Gemini returned no text");
	return text;
};
