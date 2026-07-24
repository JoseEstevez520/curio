import { useState } from 'react';
import { useChatStore } from '../app/store';
import ModelPicker from './ModelPicker';
import type { OllamaModel } from '@curio/core';

interface BrainControlsProps {
  models: OllamaModel[];
}

const selectClass =
  'rounded-sm border border-border bg-bg px-2 py-1 text-xs text-fg outline-none focus-visible:border-border-focus';

/**
 * The brain switch: Ollama (local) or Groq (cloud, bring-your-own key). On Ollama it shows the
 * installed-model picker; on Groq it shows an API-key field + model id. The key lives only in
 * localStorage (persisted by the store) and travels through the same-origin `/groq` proxy —
 * it's never committed anywhere. See CLAUDE.md on the relaxed "local only" rule.
 */
export default function BrainControls({ models }: BrainControlsProps) {
  const brain = useChatStore((s) => s.brain);
  const setBrain = useChatStore((s) => s.setBrain);
  const groqApiKey = useChatStore((s) => s.groqApiKey);
  const setGroqApiKey = useChatStore((s) => s.setGroqApiKey);
  const groqModel = useChatStore((s) => s.groqModel);
  const setGroqModel = useChatStore((s) => s.setGroqModel);
  const [showKey, setShowKey] = useState(false);

  return (
    <div className="flex items-center gap-2 text-xs text-fg-muted">
      <label className="flex items-center gap-2">
        <span>Brain</span>
        <select
          value={brain}
          onChange={(e) => setBrain(e.target.value as 'ollama' | 'groq')}
          className={selectClass}
        >
          <option value="ollama">Ollama (local)</option>
          <option value="groq">Groq (cloud)</option>
        </select>
      </label>

      {brain === 'ollama' ? (
        <ModelPicker models={models} />
      ) : (
        <>
          <input
            type="text"
            value={groqModel}
            onChange={(e) => setGroqModel(e.target.value)}
            placeholder="model id"
            spellCheck={false}
            className={`${selectClass} w-44`}
            aria-label="Groq model id"
          />
          <input
            type={showKey ? 'text' : 'password'}
            value={groqApiKey}
            onChange={(e) => setGroqApiKey(e.target.value)}
            placeholder="Groq API key"
            spellCheck={false}
            autoComplete="off"
            className={`${selectClass} w-40`}
            aria-label="Groq API key"
          />
          <button
            type="button"
            onClick={() => setShowKey((v) => !v)}
            className="text-fg-muted transition-colors duration-fast hover:text-fg"
          >
            {showKey ? 'hide' : 'show'}
          </button>
        </>
      )}
    </div>
  );
}
