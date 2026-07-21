import { useChatStore } from '../app/store';
import type { OllamaModel } from '../ollama/types';

interface ModelPickerProps {
  models: OllamaModel[];
}

/** Dropdown of locally installed Ollama models, bound to the active model in the store. */
export default function ModelPicker({ models }: ModelPickerProps) {
  const model = useChatStore((s) => s.model);
  const setModel = useChatStore((s) => s.setModel);

  if (models.length === 0) return null;

  return (
    <label className="flex items-center gap-2 text-xs text-fg-muted">
      <span>Model</span>
      <select
        value={model ?? ''}
        onChange={(e) => setModel(e.target.value)}
        className="rounded-sm border border-border bg-bg px-2 py-1 text-xs text-fg outline-none focus-visible:border-border-focus"
      >
        {models.map((m) => (
          <option key={m.name} value={m.name}>
            {m.name}
          </option>
        ))}
      </select>
    </label>
  );
}
