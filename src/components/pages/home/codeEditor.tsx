"use client";

import { useCallback } from "react";
import Editor from "react-simple-code-editor";
import { highlight, languages } from "prismjs";
import "prismjs/components/prism-javascript";
import "prismjs/components/prism-typescript";
import "prismjs/components/prism-jsx";
import "prismjs/components/prism-css";
import "prismjs/components/prism-markup";
import "prismjs/themes/prism-tomorrow.css";
import { stripCodeFence } from "@/utils";

interface CodeEditorProps {
	value: string;
	onChange: (value: string) => void;
	disabled?: boolean;
	maxLength: number;
	error?: string | null;
	/** When true, content is shown but not editable (e.g. improved code). */
	readOnly?: boolean;
	/** Optional label override (e.g. "Improved code (read-only)"). */
	label?: string;
}

export function CodeEditor({
	value,
	onChange,
	disabled,
	maxLength,
	error,
	readOnly = false,
	label,
}: CodeEditorProps) {
	const handlePaste = useCallback(
		(e: React.ClipboardEvent) => {
			if (readOnly) {
				e.preventDefault();
				return;
			}
			const pasted = e.clipboardData.getData("text");
			const stripped = stripCodeFence(pasted);
			if (stripped !== pasted) {
				e.preventDefault();
				const newValue = value + stripped;
				onChange(newValue.slice(0, maxLength));
			}
		},
		[value, onChange, maxLength, readOnly]
	);

	const handleChange = useCallback(
		(v: string) => {
			if (readOnly) return;
			if (v.length <= maxLength) onChange(v);
		},
		[onChange, maxLength, readOnly]
	);

	const displayLabel = label ?? "Code to review";

	return (
		<div className="w-full">
			<label
				htmlFor="code-editor"
				className="block text-xs font-medium uppercase tracking-wider text-[var(--text-secondary)] mb-2"
			>
				{displayLabel}
			</label>
			<div
				className={`prism-editor-wrapper rounded-xl border bg-[var(--bg-input)] overflow-auto min-h-[220px] max-h-[50vh] ${readOnly ? "cursor-default" : ""} ${
					error ? "border-[var(--error)]" : "border-[var(--border)]"
				} focus-within:ring-2 focus-within:ring-[var(--border-focus)] focus-within:border-[var(--border-focus)]`}
			>
				<Editor
					id="code-editor"
					value={value}
					onValueChange={handleChange}
					onPaste={handlePaste}
					highlight={(code) => highlight(code, languages.js, "javascript")}
					padding={14}
					disabled={disabled || readOnly}
					placeholder={readOnly ? "" : "Paste your code here… (markdown fences are stripped)"}
					style={{
						fontFamily: "var(--font-geist-mono), ui-monospace, monospace",
						fontSize: 13,
						minHeight: 220,
						color: "var(--text-primary)",
						caretColor: "var(--accent)",
					}}
					textareaClassName="focus:outline-none"
					preClassName="m-0 !bg-transparent"
				/>
			</div>
			{!readOnly && (
				<div className="mt-1.5 flex justify-between text-xs text-[var(--text-muted)]">
					<span className={error ? "text-[var(--error)]" : ""}>
						{error ??
							`${value.length.toLocaleString()} / ${maxLength.toLocaleString()} characters`}
					</span>
				</div>
			)}
		</div>
	);
}
