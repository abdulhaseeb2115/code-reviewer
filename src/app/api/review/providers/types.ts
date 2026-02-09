/** Re-export shared types; API uses same shape as frontend */
export type { NormalizedReview, ProviderId, ReviewMetrics } from "@/types";

export interface ProviderPayload {
  systemPrompt: string;
  userPrompt: string;
}

export interface ProviderOptions {
  /** Model ID for the provider's API (used by all providers). */
  modelId?: string;
  /** @deprecated Use modelId. Kept for HF backward compat. */
  huggingFaceModelId?: string;
}

export type ProviderCall = (
  payload: ProviderPayload,
  apiKey?: string,
  options?: ProviderOptions
) => Promise<string>;
