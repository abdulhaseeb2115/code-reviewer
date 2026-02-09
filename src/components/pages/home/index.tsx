"use client";

import { useState } from "react";
import type { NormalizedReview } from "@/types";
import { MAX_CODE_LENGTH, MODELS, REVIEW_API_PATH } from "@/constants";
import { validateCode, stripCodeFence } from "@/utils";
import { CodeEditor } from "./codeEditor";
import { ModelDropdown } from "./modelDropdown";
import { ApiKeyInput } from "./apiKeyInput";
import { ReviewResults } from "./reviewResults";
import Image from "next/image";

export default function Home() {
	const [code, setCode] = useState("");
	const [selectedModelId, setSelectedModelId] = useState(
		() => MODELS[0]?.id ?? ""
	);
	const [apiKey, setApiKey] = useState("");
	const [result, setResult] = useState<NormalizedReview | null>(null);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [errorCode, setErrorCode] = useState<string | null>(null);

	const selectedModel = MODELS.find((m) => m.id === selectedModelId);
	const showApiKey =
		(selectedModel?.requiresKey ?? false) ||
		selectedModel?.provider === "huggingface";
	const codeError = validateCode(code);

	async function handleSubmit(e: React.FormEvent) {
		e.preventDefault();
		const cleanedCode = stripCodeFence(code.trim());
		const validationError = validateCode(cleanedCode);
		if (validationError) {
			setError(validationError);
			return;
		}
		if (selectedModel?.requiresKey && !apiKey.trim()) {
			setError("API key is required for this model.");
			setErrorCode(null);
			return;
		}
		setError(null);
		setErrorCode(null);
		setResult(null);
		setLoading(true);
		try {
			const body: { code: string; selectedModelId: string; apiKey?: string } = {
				code: cleanedCode,
				selectedModelId,
			};
			if (selectedModel?.requiresKey) body.apiKey = apiKey.trim();
			else if (selectedModel?.provider === "huggingface" && apiKey.trim())
				body.apiKey = apiKey.trim();
			const res = await fetch(REVIEW_API_PATH, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(body),
			});
			let data: { error?: string; code?: string };
			try {
				data = (await res.json()) as { error?: string; code?: string };
			} catch {
				setError(
					"Invalid response from server. The review output may have been truncated or malformed."
				);
				setErrorCode(null);
				return;
			}
			if (!res.ok) {
				setError(data?.error ?? `Request failed (${res.status})`);
				setErrorCode(data?.code ?? null);
				return;
			}
			setResult(data as NormalizedReview);
		} catch (err) {
			setError(err instanceof Error ? err.message : "Something went wrong.");
			setErrorCode(null);
		} finally {
			setLoading(false);
		}
	}

	function clearHfQuotaError() {
		setError(null);
		setErrorCode(null);
	}

	return (
		<div className="min-h-screen bg-[var(--bg-base)] text-[var(--text-primary)]">
			<header className="border-b border-[var(--border)] bg-[var(--bg-surface)] px-6 py-4">
				<h1 className="text-lg font-black">Smart Code Reviewer</h1>
				<p className="mt-0.5 text-sm text-[var(--text-secondary)]">
					Paste code, pick a model, and get readability metrics, suggestions,
					and a refactored version.
				</p>
			</header>

			<div className="grid grid-cols-1 lg:grid-cols-2 gap-0 h-[calc(100vh-88px)] overflow-hidden">
				{/* Left pane */}
				<div className="flex flex-col border-r border-[var(--border)] bg-[var(--bg-surface)] p-6 overflow-hidden min-h-0">
					<form
						onSubmit={handleSubmit}
						className="flex flex-col gap-4 flex-1 min-h-0"
					>
						<ModelDropdown
							value={selectedModelId}
							onChange={setSelectedModelId}
							disabled={loading}
						/>
						{showApiKey && selectedModel && (
							<ApiKeyInput
								value={apiKey}
								onChange={setApiKey}
								disabled={loading}
								provider={selectedModel.provider}
							/>
						)}
						<div className="flex-1 min-h-0 flex flex-col">
							<CodeEditor
								value={code}
								onChange={setCode}
								disabled={loading}
								maxLength={MAX_CODE_LENGTH}
								error={codeError}
							/>
						</div>
						<div className="shrink-0 space-y-2">
							<button
								type="submit"
								disabled={loading || !!codeError}
								className="w-full rounded-xl bg-[var(--accent)] text-white py-3 px-4 text-sm font-semibold hover:bg-[var(--accent-hover)] focus:outline-none focus:ring-2 focus:ring-[var(--border-focus)] focus:ring-offset-2 focus:ring-offset-[var(--bg-surface)] disabled:opacity-50 disabled:pointer-events-none transition-colors"
							>
								{loading ? "Reviewing…" : "Review Code"}
							</button>
							{error && (
								<p className="text-sm text-[var(--error)]" role="alert">
									{error}
								</p>
							)}
						</div>
					</form>
				</div>

				{/* Right pane - scrolls internally on lg */}
				<div className="flex flex-col min-h-[320px] lg:min-h-0 lg:overflow-hidden p-6 bg-[var(--bg-base)]">
					<ReviewResults
						result={result}
						loading={loading}
						error={error}
						errorCode={errorCode}
						onClearHfQuotaError={clearHfQuotaError}
					/>
				</div>
			</div>
		</div>
	);
}
