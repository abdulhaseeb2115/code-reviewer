import type { ReviewModelConfig } from "@/types";

export const MAX_CODE_LENGTH = 20_000;

export const REVIEW_API_PATH = "/api/review";

/**
 * Single source of truth for all review models.
 * id: sent as selectedModelId; modelId: used by each provider's API.
 */
export const MODELS: ReviewModelConfig[] = [
	{
		id: "Qwen3-Coder-Next",
		label: "Qwen3-Coder-Next (free)",
		provider: "huggingface",
		modelId: "Qwen/Qwen3-Coder-Next:novita",
		requiresKey: false,
	},
	{
		id: "hf-smollm3-3b",
		label: "SmolLM3 3B (free)",
		provider: "huggingface",
		modelId: "HuggingFaceTB/SmolLM3-3B:hf-inference",
		requiresKey: false,
	},
	{
		id: "openai-gpt-4o-mini",
		label: "GPT-4o Mini (requires key)",
		provider: "openai",
		modelId: "gpt-4o-mini",
		requiresKey: true,
	},
	{
		id: "openai-gpt-3.5-turbo",
		label: "GPT-3.5 Turbo (requires key)",
		provider: "openai",
		modelId: "gpt-3.5-turbo",
		requiresKey: true,
	},
	{
		id: "claude-3-haiku",
		label: "Claude 3 Haiku (requires key)",
		provider: "claude",
		modelId: "claude-3-5-haiku-20241022",
		requiresKey: true,
	},
	{
		id: "claude-3-7-sonnet-20250219",
		label: "Claude 3.7 Sonnet (requires key)",
		provider: "claude",
		modelId: "claude-3-7-sonnet-20250219",
		requiresKey: true,
	},
	{
		id: "gemini-3-flash-preview",
		label: "Gemini 3 Flash Preview (requires key)",
		provider: "gemini",
		modelId: "gemini-3-flash-preview",
		requiresKey: true,
	},
	{
		id: "gemini-2.5-flash-lite",
		label: "Gemini 2.5 Flash Lite (requires key)",
		provider: "gemini",
		modelId: "gemini-2.5-flash-lite",
		requiresKey: true,
	},
];
