"use client";

import { useState } from "react";
import type { ProviderId } from "@/types";

interface ApiKeyInputProps {
	value: string;
	onChange: (value: string) => void;
	disabled?: boolean;
	provider: ProviderId;
}

const LABELS: Record<ProviderId, string> = {
	huggingface: "Hugging Face API Key (optional)",
	openai: "OpenAI API Key (not stored)",
	claude: "Anthropic API Key (not stored)",
	gemini: "Google Gemini API Key (not stored)",
};

export function ApiKeyInput({
	value,
	onChange,
	disabled,
	provider,
}: ApiKeyInputProps) {
	const label = LABELS[provider];
	const [masked, setMasked] = useState(false);
	return (
		<div className="w-full">
			<label
				htmlFor="api-key-input"
				className="block text-xs font-medium uppercase tracking-wider text-[var(--text-secondary)] mb-2"
			>
				{label}
			</label>
			<div className="relative">
				<input
					id="api-key-input"
					type={masked ? "password" : "text"}
					value={value}
					onChange={(e) => onChange(e.target.value)}
					disabled={disabled}
					placeholder="Paste your API key (not stored)"
					autoComplete="off"
					data-1p-ignore
					data-lpignore="true"
					data-form-type="other"
					className="w-full rounded-xl border border-[var(--border)] bg-[var(--bg-input)] px-4 py-3 pr-10 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--border-focus)] focus:border-[var(--border-focus)] disabled:opacity-50"
				/>
				<button
					type="button"
					onClick={() => setMasked((m) => !m)}
					className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1.5 text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-elevated)] transition-colors"
					title={masked ? "Show key" : "Hide key"}
					tabIndex={-1}
				>
					{masked ? (
						<svg
							xmlns="http://www.w3.org/2000/svg"
							width="16"
							height="16"
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							strokeWidth="2"
							strokeLinecap="round"
							strokeLinejoin="round"
						>
							<path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
							<circle cx="12" cy="12" r="3" />
						</svg>
					) : (
						<svg
							xmlns="http://www.w3.org/2000/svg"
							width="16"
							height="16"
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							strokeWidth="2"
							strokeLinecap="round"
							strokeLinejoin="round"
						>
							<path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
							<line x1="1" y1="1" x2="23" y2="23" />
						</svg>
					)}
				</button>
			</div>
		</div>
	);
}
