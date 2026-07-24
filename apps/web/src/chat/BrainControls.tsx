import { useChatStore, type Brain } from '../app/store';
import ModelPicker from './ModelPicker';
import Segmented from './Segmented';
import type { OllamaModel } from '@curio/core';

interface BrainControlsProps {
  models: OllamaModel[];
}

const OPTIONS: { value: Brain; label: string }[] = [
  { value: 'ollama', label: 'Local' },
  { value: 'groq', label: 'Groq' },
];

/**
 * Minimal brain switch: Local (Ollama) or Groq (cloud). Key + model come from `.env.local`
 * (VITE_GROQ_*), so the header stays clean. On Local it shows the installed-model picker; on
 * Groq nothing (config lives in the env file).
 */
export default function BrainControls({ models }: BrainControlsProps) {
  const brain = useChatStore((s) => s.brain);
  const setBrain = useChatStore((s) => s.setBrain);

  return (
    <div className="flex items-center gap-2">
      <Segmented
        id="seg-brain"
        ariaLabel="Cerebro"
        options={OPTIONS}
        value={brain}
        onChange={setBrain}
      />
      {brain === 'ollama' && <ModelPicker models={models} />}
    </div>
  );
}
