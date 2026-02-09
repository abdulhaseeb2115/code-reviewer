import type { ProviderCall } from "./types";

const ROUTER_URL = "https://router.huggingface.co/v1/chat/completions";

/** Thrown when HF free tier is unavailable (rate limit, quota, capacity). */
export class HFQuotaExceededError extends Error {
	readonly code = "HF_QUOTA_EXCEEDED" as const;
	constructor(message: string) {
		super(message);
		this.name = "HFQuotaExceededError";
	}
}

function isQuotaOrCapacityError(status: number, body: string): boolean {
	if (status === 429) return true;
	const lower = body.toLowerCase();
	return (
		lower.includes("rate limit") ||
		lower.includes("quota") ||
		lower.includes("capacity") ||
		lower.includes("overloaded") ||
		lower.includes("unavailable") ||
		lower.includes("too many requests")
	);
}

export const callHuggingFace: ProviderCall = async (
	payload,
	apiKey,
	options
) => {
	const modelId =
		options?.modelId?.trim() || options?.huggingFaceModelId?.trim();

	if (!modelId) {
		throw new Error("Hugging Face model ID is required.");
	}

	// Prefer user's key; otherwise use server's HF token from env (free-first; if env quota exceeded, user can supply key)
	const token = apiKey?.trim() || process.env.HF_TOKEN || "";
	const headers: Record<string, string> = {
		"Content-Type": "application/json",
	};
	if (token) {
		headers.Authorization = `Bearer ${token}`;
	}

	const res = await fetch(ROUTER_URL, {
		method: "POST",
		headers,
		body: JSON.stringify({
			model: modelId,
			messages: [
				{ role: "system", content: payload.systemPrompt },
				{ role: "user", content: payload.userPrompt },
			],
			max_tokens: 4096,
			temperature: 0.3,
		}),
	});

	if (!res.ok) {
		const errText = await res.text();
		if (isQuotaOrCapacityError(res.status, errText)) {
			throw new HFQuotaExceededError(
				"Free Hugging Face inference is currently unavailable."
			);
		}
		throw new Error(`Hugging Face API error: ${res.status} ${errText}`);
	}

	let data: { choices?: { message?: { content?: string } }[] };
	try {
		data = (await res.json()) as typeof data;
	} catch {
		throw new Error("Hugging Face returned invalid JSON");
	}

	const content = data.choices?.[0]?.message?.content;
	if (typeof content !== "string") {
		throw new Error("Hugging Face returned no content");
	}
	return content;
};
