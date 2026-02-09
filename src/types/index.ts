/** LLM provider identifier */
export type ProviderId = "huggingface" | "openai" | "claude" | "gemini";

/** Code review metrics returned by the API */
export interface ReviewMetrics {
  readabilityScore: number;
  maintainabilityScore: number;
  structureScore: number;
}

/** Normalized review response from the API */
export interface NormalizedReview {
  metrics: ReviewMetrics;
  feedback: string[];
  improvedCode: string;
}

/** Single model option: id is sent to API, provider + modelId used for routing */
export interface ReviewModelConfig {
  id: string;
  label: string;
  provider: ProviderId;
  modelId: string;
  /** If true, user must provide provider API key (OpenAI, Claude, Gemini). */
  requiresKey: boolean;
  /** If true, model supports free serverless tier (Hugging Face only). */
  supportsFreeTier?: boolean;
}

/** Request body for POST /api/review */
export interface ReviewRequestBody {
  code: string;
  selectedModelId: string;
  apiKey?: string;
}

/** API error response when Hugging Face free tier is unavailable */
export const HF_QUOTA_EXCEEDED_CODE = "HF_QUOTA_EXCEEDED" as const;

export interface ReviewErrorResponse {
  error: string;
  code?: typeof HF_QUOTA_EXCEEDED_CODE;
}
