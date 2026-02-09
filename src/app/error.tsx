"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 bg-[var(--bg-base)] text-[var(--text-primary)]">
      <div className="max-w-md w-full text-center space-y-6">
        <div className="rounded-xl border border-[var(--card-border)] bg-[var(--bg-surface)] p-8">
          <h1 className="text-xl font-semibold text-[var(--text-primary)]">
            Something went wrong
          </h1>
          <p className="mt-2 text-sm text-[var(--text-secondary)]">
            {error.message || "An unexpected error occurred."}
          </p>
          <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-center">
            <button
              type="button"
              onClick={reset}
              className="rounded-lg bg-[var(--accent)] text-white px-4 py-2.5 text-sm font-medium hover:bg-[var(--accent-hover)] transition-colors"
            >
              Try again
            </button>
            <Link
              href="/"
              className="rounded-lg border border-[var(--border)] bg-[var(--bg-elevated)] text-[var(--text-primary)] px-4 py-2.5 text-sm font-medium hover:bg-[var(--bg-input)] transition-colors inline-block"
            >
              Back to home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
