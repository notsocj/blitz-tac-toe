"use client";

import type { Settings } from "@/lib/match";

type Option<T> = { value: T; label: string };

function Segmented<T extends string | number>(props: {
  label: string;
  options: Option<T>[];
  value: T;
  onChange: (value: T) => void;
}) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="text-sm font-medium text-white/85">{props.label}</span>
      <div
        role="radiogroup"
        aria-label={props.label}
        className="flex rounded-xl border-3 border-ink bg-ink/45 p-1"
      >
        {props.options.map((option) => {
          const selected = option.value === props.value;
          return (
            <button
              key={option.value}
              type="button"
              role="radio"
              aria-checked={selected}
              onClick={() => props.onChange(option.value)}
              className={`cursor-pointer rounded-lg px-3.5 py-1 text-sm font-medium transition-colors active:scale-97 ${
                selected ? "bg-white text-ink" : "text-white/85 hover:text-white"
              }`}
            >
              {option.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export function Setup({ settings, onChange }: { settings: Settings; onChange: (patch: Partial<Settings>) => void }) {
  return (
    <section aria-label="Game setup" className="flex flex-col gap-2.5">
      <Segmented
        label="Players"
        value={settings.mode}
        onChange={(mode) => onChange({ mode })}
        options={[
          { value: "local", label: "2 players" },
          { value: "bot", label: "vs Bot" },
        ]}
      />
      {settings.mode === "bot" && (
        <Segmented
          label="Bot level"
          value={settings.level}
          onChange={(level) => onChange({ level })}
          options={[
            { value: "easy", label: "Easy" },
            { value: "medium", label: "Medium" },
            { value: "hard", label: "Hard" },
          ]}
        />
      )}
      <Segmented
        label="Clock"
        value={settings.baseMs}
        onChange={(baseMs) => onChange({ baseMs })}
        options={[
          { value: 15_000, label: "15s" },
          { value: 30_000, label: "30s" },
          { value: 60_000, label: "60s" },
        ]}
      />
      <Segmented
        label="Bonus per move"
        value={settings.increment ? "on" : "off"}
        onChange={(v) => onChange({ increment: v === "on" })}
        options={[
          { value: "off", label: "None" },
          { value: "on", label: "+1s" },
        ]}
      />
    </section>
  );
}
