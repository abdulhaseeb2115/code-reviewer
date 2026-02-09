import type { NormalizedReview } from "@/types";

/**
 * Strip thinking/reasoning blocks (e.g. <think>...</think>) and markdown code fences,
 * then parse JSON from raw LLM response text. Coerces and validates required fields.
 */
function extractJsonText(rawText: string): string {
  let text = rawText.trim();
  // Remove <think>...</think> blocks (some models emit reasoning before JSON)
  text = text.replace(/<think>[\s\S]*?<\/think>/gi, "").trim();
  // If <think> is still present (unclosed), drop everything before the first {
  const thinkStart = text.search(/<think>/i);
  const jsonStart = text.indexOf("{");
  if (thinkStart !== -1 && jsonStart !== -1 && jsonStart > thinkStart) {
    text = text.slice(jsonStart);
  } else if (thinkStart !== -1 && jsonStart === -1) {
    text = text.slice(0, thinkStart).trim();
  }
  return text;
}

/** Escape control characters inside double-quoted JSON string literals so JSON.parse accepts them. */
function escapeControlCharsInJsonStrings(json: string): string {
  let result = "";
  let inString = false;
  let escapeNext = false;
  for (let i = 0; i < json.length; i++) {
    const c = json[i];
    if (escapeNext) {
      result += c;
      escapeNext = false;
      continue;
    }
    if (c === "\\" && inString) {
      result += c;
      escapeNext = true;
      continue;
    }
    if (c === '"') {
      inString = !inString;
      result += c;
      continue;
    }
    if (inString && c >= "\x00" && c <= "\x1f") {
      const code = c.charCodeAt(0);
      result += code === 10 ? "\\n" : code === 13 ? "\\r" : code === 9 ? "\\t" : "\\u" + code.toString(16).padStart(4, "0");
      continue;
    }
    result += c;
  }
  return result;
}

/**
 * Fix invalid JSON escape sequences inside string values.
 * JSON only allows \ " \ / b f n r t and \uXXXX. Other \X cause "Bad escaped character".
 */
function fixInvalidJsonEscapes(json: string): string {
  let result = "";
  let inString = false;
  let escapeNext = false;
  for (let i = 0; i < json.length; i++) {
    const c = json[i];
    if (escapeNext) {
      escapeNext = false;
      const validSingle = /^["\\/bfnrt]$/.test(c);
      if (validSingle) {
        result += "\\" + c;
        continue;
      }
      if (c === "u" && i + 4 < json.length && /^[0-9a-fA-F]{4}$/.test(json.slice(i + 1, i + 5))) {
        result += "\\u" + json.slice(i + 1, i + 5);
        i += 4;
        continue;
      }
      result += "\\\\" + c;
      continue;
    }
    if (c === "\\" && inString) {
      escapeNext = true;
      continue;
    }
    if (c === '"') {
      inString = !inString;
      result += c;
      continue;
    }
    result += c;
  }
  return result;
}

/** Try to fix truncated JSON by closing the unterminated string and any open brackets. */
function tryFixUnterminatedString(text: string, position: number): string {
  const head = text.slice(0, Math.min(position, text.length));
  let openBraces = 0;
  let openBrackets = 0;
  let inString = false;
  let escapeNext = false;
  for (let i = 0; i < head.length; i++) {
    const c = head[i];
    if (escapeNext) {
      escapeNext = false;
      continue;
    }
    if (inString) {
      if (c === "\\") escapeNext = true;
      else if (c === '"') inString = false;
      continue;
    }
    if (c === '"') {
      inString = true;
      continue;
    }
    if (c === "{") openBraces++;
    else if (c === "}") openBraces--;
    else if (c === "[") openBrackets++;
    else if (c === "]") openBrackets--;
  }
  const closers = '"' + "]".repeat(Math.max(0, openBrackets)) + "}".repeat(Math.max(0, openBraces));
  return head + closers;
}

export function normalizeReviewResponse(rawText: string): NormalizedReview {
  let text = extractJsonText(rawText);
  // Remove optional markdown code block
  const jsonMatch = text.match(/^```(?:json)?\s*([\s\S]*?)```$/);
  if (jsonMatch) text = jsonMatch[1].trim();
  // Find the first { and last } to extract JSON object if there's extra text
  const firstBrace = text.indexOf("{");
  if (firstBrace !== -1) {
    const lastBrace = text.lastIndexOf("}");
    if (lastBrace > firstBrace) {
      text = text.slice(firstBrace, lastBrace + 1);
    }
  }
  let parsed: unknown;
  try {
    parsed = JSON.parse(text) as unknown;
  } catch (parseErr) {
    if (!(parseErr instanceof SyntaxError)) throw parseErr;
    const msg = parseErr.message;
    if (/control character|Unexpected token/.test(msg)) {
      text = escapeControlCharsInJsonStrings(text);
      parsed = JSON.parse(text) as unknown;
    } else if (/Bad escape|escaped character/.test(msg)) {
      text = fixInvalidJsonEscapes(text);
      parsed = JSON.parse(text) as unknown;
    } else if (/Unterminated string/.test(msg)) {
      const posMatch = msg.match(/position (\d+)/);
      const position = posMatch ? parseInt(posMatch[1], 10) : text.length;
      const fixed = tryFixUnterminatedString(text, position);
      try {
        parsed = JSON.parse(fixed) as unknown;
      } catch {
        text = escapeControlCharsInJsonStrings(text);
        const fixed2 = tryFixUnterminatedString(text, Math.min(position, text.length));
        parsed = JSON.parse(fixed2) as unknown;
      }
    } else {
      throw parseErr;
    }
  }
  if (!parsed || typeof parsed !== "object") {
    throw new Error("Invalid response: not an object");
  }
  const obj = parsed as Record<string, unknown>;
  const metrics = obj.metrics as Record<string, unknown> | undefined;
  if (!metrics || typeof metrics !== "object") {
    throw new Error("Invalid response: missing or invalid metrics");
  }
  const readabilityScore = Number(metrics.readabilityScore);
  const maintainabilityScore = Number(metrics.maintainabilityScore);
  const structureScore = Number(metrics.structureScore);
  const feedback = Array.isArray(obj.feedback)
    ? (obj.feedback as unknown[]).map((x) => String(x))
    : [];
  const improvedCode =
    typeof obj.improvedCode === "string" ? obj.improvedCode : "";
  return {
    metrics: {
      readabilityScore: Number.isFinite(readabilityScore)
        ? Math.min(100, Math.max(0, readabilityScore))
        : 0,
      maintainabilityScore: Number.isFinite(maintainabilityScore)
        ? Math.min(100, Math.max(0, maintainabilityScore))
        : 0,
      structureScore: Number.isFinite(structureScore)
        ? Math.min(100, Math.max(0, structureScore))
        : 0,
    },
    feedback,
    improvedCode,
  };
}
