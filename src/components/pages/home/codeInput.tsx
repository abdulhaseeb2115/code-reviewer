"use client";

interface CodeInputProps {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  maxLength: number;
  error?: string | null;
}

export function CodeInput({
  value,
  onChange,
  disabled,
  maxLength,
  error,
}: CodeInputProps) {
  return (
    <div className="w-full">
      <label htmlFor="code-input" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
        Code to review
      </label>
      <textarea
        id="code-input"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        maxLength={maxLength}
        placeholder="Paste your code here..."
        className={`w-full min-h-[200px] rounded-lg border px-3 py-2 font-mono text-sm bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-400 dark:focus:ring-zinc-500 ${
          error ? "border-red-500" : "border-zinc-300 dark:border-zinc-600"
        }`}
      />
      <div className="mt-1 flex justify-between text-xs text-zinc-500 dark:text-zinc-400">
        <span className={error ? "text-red-600 dark:text-red-400" : ""}>
          {error ?? `${value.length.toLocaleString()} / ${maxLength.toLocaleString()} characters`}
        </span>
      </div>
    </div>
  );
}
