"use client";

import { useEffect } from "react";

export default function GlobalError({
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
    <html lang="en">
      <body style={{ background: "#0c0e12", color: "#e6e9ef", fontFamily: "system-ui, sans-serif", margin: 0, padding: 24, minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ maxWidth: 420, textAlign: "center" }}>
          <h1 style={{ fontSize: "1.25rem", fontWeight: 600, marginBottom: 8 }}>
            Application error
          </h1>
          <p style={{ fontSize: "0.875rem", color: "#9ca3af", marginBottom: 24 }}>
            {error.message || "A critical error occurred."}
          </p>
          <button
            type="button"
            onClick={reset}
            style={{
              background: "#2d9d85",
              color: "white",
              border: "none",
              borderRadius: 8,
              padding: "10px 16px",
              fontSize: "0.875rem",
              fontWeight: 500,
              cursor: "pointer",
            }}
          >
            Try again
          </button>
        </div>
      </body>
    </html>
  );
}
