import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 bg-[var(--bg-base)] text-[var(--text-primary)]">
      <div className="max-w-md w-full text-center space-y-6">
        <p className="text-6xl font-semibold text-[var(--accent)]">404</p>
        <h1 className="text-xl font-semibold text-[var(--text-primary)]">
          Page not found
        </h1>
        <p className="text-sm text-[var(--text-secondary)]">
          The page you’re looking for doesn’t exist or has been moved.
        </p>
        <Link
          href="/"
          className="inline-flex items-center justify-center rounded-lg bg-[var(--accent)] text-white px-5 py-2.5 text-sm font-medium hover:bg-[var(--accent-hover)] transition-colors"
        >
          Back to Smart Code Reviewer
        </Link>
      </div>
    </div>
  );
}
