"use client";

import type { ReviewModelConfig } from "@/types";
import { MODELS } from "@/constants";

const MODELS_PER_GROUP = 2;

const GROUP_LABELS: Record<ReviewModelConfig["provider"], string> = {
  huggingface: "Hugging Face",
  openai: "OpenAI",
  claude: "Claude",
  gemini: "Gemini",
};

function getGroupLabel(group: ReviewModelConfig[]): string {
  const first = group[0];
  if (!first) return "Models";
  const name = GROUP_LABELS[first.provider];
  const tier = first.supportsFreeTier ? " (free)" : " (requires key)";
  return `${name}${tier}`;
}

interface ModelDropdownProps {
  value: string;
  onChange: (modelId: string) => void;
  disabled?: boolean;
}

export function ModelDropdown({ value, onChange, disabled }: ModelDropdownProps) {
  const groups: typeof MODELS[] = [];
  for (let i = 0; i < MODELS.length; i += MODELS_PER_GROUP) {
    groups.push(MODELS.slice(i, i + MODELS_PER_GROUP));
  }

  return (
    <div className="w-full">
      <label
        htmlFor="model-select"
        className="block text-xs font-medium uppercase tracking-wider text-[var(--text-secondary)] mb-2"
      >
        Model
      </label>
      <select
        id="model-select"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        className="w-full rounded-xl border border-[var(--border)] bg-[var(--bg-input)] px-4 py-3 text-sm text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--border-focus)] focus:border-[var(--border-focus)] disabled:opacity-50 appearance-none cursor-pointer"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%239ca3af' d='M6 8L1 3h10z'/%3E%3C/svg%3E")`,
          backgroundRepeat: "no-repeat",
          backgroundPosition: "right 12px center",
          paddingRight: 36,
        }}
      >
        {groups.map((group, groupIndex) => (
          <optgroup key={groupIndex} label={getGroupLabel(group)}>
            {group.map((m) => (
              <option key={m.id} value={m.id}>
                {m.label}
              </option>
            ))}
          </optgroup>
        ))}
      </select>
    </div>
  );
}
