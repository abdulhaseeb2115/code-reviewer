import { MAX_CODE_LENGTH, MODELS } from "@/constants";

/**
 * Strips leading/trailing markdown code fence (```) from pasted code.
 */
export function stripCodeFence(code: string): string {
  let out = code.trim();
  const open = "```";
  if (out.startsWith(open)) {
    const firstLineEnd = out.indexOf("\n");
    out = firstLineEnd === -1 ? out.slice(open.length) : out.slice(firstLineEnd + 1);
  }
  if (out.endsWith("```")) {
    out = out.slice(0, -3).trimEnd();
  }
  return out;
}

/**
 * Validates code input. Returns error message or null if valid.
 */
export function validateCode(code: string): string | null {
  const trimmed = code.trim();
  if (!trimmed) return "Please paste some code to review.";
  if (trimmed.length > MAX_CODE_LENGTH) {
    return `Code must be at most ${MAX_CODE_LENGTH.toLocaleString()} characters.`;
  }
  return null;
}

/**
 * Whether the selected model requires an API key from the user.
 */
export function modelRequiresKey(selectedModelId: string): boolean {
  const model = MODELS.find((m) => m.id === selectedModelId);
  return model?.requiresKey ?? false;
}
