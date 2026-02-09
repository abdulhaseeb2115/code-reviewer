"use client";

import { useState } from "react";
import type { NormalizedReview } from "@/types";
import { HF_QUOTA_EXCEEDED_CODE } from "@/types";
import { CodeEditor } from "./codeEditor";

interface ReviewResultsProps {
  result: NormalizedReview | null;
  loading: boolean;
  error: string | null;
  errorCode?: string | null;
  onClearHfQuotaError?: () => void;
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  const copy = () => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };
  return (
    <button
      type="button"
      onClick={copy}
      className="shrink-0 rounded-lg border border-[var(--border)] bg-[var(--bg-elevated)] px-3 py-1.5 text-xs font-medium text-[var(--text-secondary)] hover:bg-[var(--bg-input)] hover:text-[var(--text-primary)] transition-colors"
    >
      {copied ? "Copied" : "Copy"}
    </button>
  );
}

function Loader() {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4" aria-busy="true" aria-label="Loading">
      <div className="relative w-12 h-12">
        <div
          className="absolute inset-0 rounded-full border-2 border-[var(--border)]"
          aria-hidden
        />
        <div
          className="absolute inset-0 rounded-full border-2 border-transparent border-t-[var(--accent)] animate-spin"
          aria-hidden
        />
      </div>
      <p className="mt-4 text-sm text-[var(--text-secondary)]">Reviewing your code…</p>
    </div>
  );
}

export function ReviewResults({
  result,
  loading,
  error,
  errorCode,
  onClearHfQuotaError,
}: ReviewResultsProps) {
  if (loading) {
    return (
      <div className="h-full flex flex-col rounded-2xl border border-[var(--card-border)] bg-[var(--bg-surface)] overflow-hidden">
        <Loader />
      </div>
    );
  }
  if (error && errorCode === HF_QUOTA_EXCEEDED_CODE && onClearHfQuotaError) {
    return (
      <div className="rounded-2xl border border-[var(--card-border)] bg-[var(--bg-surface)] p-5 space-y-4">
        <p className="text-sm font-medium text-[var(--text-primary)]">
          This free Hugging Face model is currently unavailable.
        </p>
        <p className="text-sm text-[var(--text-secondary)]">
          Free Hugging Face models have limited capacity. You can retry later, switch
          models, or use your own API key.
        </p>
        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={onClearHfQuotaError}
            className="rounded-xl bg-[var(--accent)] text-white px-4 py-2.5 text-sm font-medium hover:bg-[var(--accent-hover)] transition-colors"
          >
            Use my Hugging Face API key
          </button>
          <button
            type="button"
            onClick={onClearHfQuotaError}
            className="rounded-xl border border-[var(--border)] bg-[var(--bg-elevated)] text-[var(--text-primary)] px-4 py-2.5 text-sm font-medium hover:bg-[var(--bg-input)] transition-colors"
          >
            Switch to another model
          </button>
        </div>
      </div>
    );
  }
  if (error) {
    return (
      <div className="rounded-2xl border border-[var(--error)] bg-[var(--error-bg)] p-4">
        <p className="text-sm text-[var(--error)]">{error}</p>
      </div>
    );
  }
  if (!result) {
    return (
      <div className="h-full flex flex-col items-center justify-center rounded-2xl border border-[var(--card-border)] bg-[var(--bg-surface)] text-center py-16 px-4">
        <p className="text-sm text-[var(--text-muted)]">
          Run a review to see metrics, suggestions, and improved code here.
        </p>
      </div>
    );
  }

  const { metrics, feedback, improvedCode } = result;
  return (
    <div className="h-full flex flex-col rounded-2xl border border-[var(--card-border)] bg-[var(--bg-surface)] overflow-hidden">
      <div className="flex-1 overflow-y-auto p-5 space-y-5">
        <div className="grid grid-cols-3 gap-3">
          <div className="rounded-xl border border-[var(--card-border)] bg-[var(--bg-elevated)] p-4 text-center">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-[var(--text-muted)]">
              Readability
            </p>
            <p className="mt-1 text-2xl font-bold text-[var(--accent)]">
              {metrics.readabilityScore}
            </p>
          </div>
          <div className="rounded-xl border border-[var(--card-border)] bg-[var(--bg-elevated)] p-4 text-center">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-[var(--text-muted)]">
              Maintainability
            </p>
            <p className="mt-1 text-2xl font-bold text-[var(--accent)]">
              {metrics.maintainabilityScore}
            </p>
          </div>
          <div className="rounded-xl border border-[var(--card-border)] bg-[var(--bg-elevated)] p-4 text-center">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-[var(--text-muted)]">
              Structure
            </p>
            <p className="mt-1 text-2xl font-bold text-[var(--accent)]">
              {metrics.structureScore}
            </p>
          </div>
        </div>

        {feedback.length > 0 && (
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-[var(--text-secondary)] mb-2">
              Suggestions
            </h3>
            <ul className="space-y-2">
              {feedback.map((item, i) => (
                <li
                  key={i}
                  className="text-sm text-[var(--text-primary)] pl-4 border-l-2 border-[var(--accent-muted)]"
                >
                  {item}
                </li>
              ))}
            </ul>
          </div>
        )}

        {improvedCode && (
          <div>
            <div className="flex items-center justify-end gap-2 mb-2">
              <CopyButton text={improvedCode} />
            </div>
            <CodeEditor
              value={improvedCode}
              onChange={() => {}}
              maxLength={improvedCode.length}
              readOnly
              label="Improved code (read-only)"
            />
          </div>
        )}
      </div>
    </div>
  );
}
