import { useChatStore } from '../app/store';
import ModelPicker from './ModelPicker';
import type { OllamaModel } from '@curio/core';

interface BrainControlsProps {
  models: OllamaModel[];
}

/**
 * Minimal brain switch: Local (Ollama) or Groq (cloud). Key + model come from `.env.local`
 * (VITE_GROQ_*), so the header stays clean — no key field, no model textbox here. On Local it
 * shows the installed-model picker; on Groq it shows nothing (config lives in the env file).
 */
export default function BrainControls({ models }: BrainControlsProps) {
  const brain = useChatStore((s) => s.brain);
  const setBrain = useChatStore((s) => s.setBrain);

  const options: { value: 'ollama' | 'groq'; label: string }[] = [
    { value: 'ollama', label: 'Local' },
    { value: 'groq', label: 'Groq' },
  ];

  return (
    <div className="flex items-center gap-2">
      <div
        role="tablist"
        aria-label="Cerebro"
        className="inline-flex items-center gap-0.5 rounded-full border border-border p-0.5"
      >
        {options.map((opt) => {
          const active = brain === opt.value;
          return (
            <button
              key={opt.value}
              role="tab"
              aria-selected={active}
              onClick={() => setBrain(opt.value)}
              className={`rounded-full px-3 py-1 text-xs font-medium transition-colors duration-fast ${
                active ? 'bg-bg-inset text-fg' : 'text-fg-muted hover:text-fg'
              }`}
            >
              {opt.label}
            </button>
          );
        })}
      </div>
      {brain === 'ollama' && <ModelPicker models={models} />}
    </div>
  );
}
