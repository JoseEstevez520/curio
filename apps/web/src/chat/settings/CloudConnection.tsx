import { useState } from 'react';
import { listOpenAIModels } from '@curio/core';
import { useChatStore } from '../../app/store';

/** One-click bases for the common OpenAI-compatible endpoints; "Personalizado" leaves it editable. */
const PRESETS: { label: string; baseUrl: string }[] = [
  { label: 'Groq', baseUrl: 'https://api.groq.com/openai/v1' },
  { label: 'OpenRouter', baseUrl: 'https://openrouter.ai/api/v1' },
  { label: 'LocalAI / LM Studio', baseUrl: 'http://localhost:8080/v1' },
  { label: 'Personalizado', baseUrl: '' },
];

const INPUT_CLS =
  'w-full rounded-md border border-border bg-bg-subtle px-2 py-1.5 text-xs text-fg outline-none transition-colors duration-fast placeholder:text-fg-faint focus:border-border-strong';

/**
 * The "bring your own key" form for the cloud brain — the standard from Open WebUI / LibreChat:
 * pick a preset (or a custom Base URL), paste your API key, and either type the model or auto-detect
 * it from the endpoint's `/v1/models`. All of it lives only in localStorage. Requests reach the
 * endpoint through the dev `/llm` proxy (see vite.config.ts), so any provider works despite CORS.
 */
export default function CloudConnection() {
  const cloudBaseUrl = useChatStore((s) => s.cloudBaseUrl);
  const setCloudBaseUrl = useChatStore((s) => s.setCloudBaseUrl);
  const apiKey = useChatStore((s) => s.groqApiKey);
  const setApiKey = useChatStore((s) => s.setGroqApiKey);
  const model = useChatStore((s) => s.groqModel);
  const setModel = useChatStore((s) => s.setGroqModel);

  const [detected, setDetected] = useState<string[] | null>(null);
  const [detecting, setDetecting] = useState(false);
  const [detectError, setDetectError] = useState<string | null>(null);

  const activePreset =
    PRESETS.find((p) => p.baseUrl && p.baseUrl === cloudBaseUrl.trim())?.label ?? 'Personalizado';

  const detect = async () => {
    setDetecting(true);
    setDetectError(null);
    setDetected(null);
    try {
      const ids = await listOpenAIModels({
        baseUrl: '/llm',
        apiKey: apiKey.trim(),
        headers: { 'x-llm-base-url': cloudBaseUrl.trim().replace(/\/$/, '') },
      });
      setDetected(ids);
      if (ids.length === 0) setDetectError('El endpoint no devolvió modelos. Escríbelo a mano.');
    } catch {
      setDetectError('No se pudieron detectar (clave / URL / sin /models). Escríbelo a mano.');
    } finally {
      setDetecting(false);
    }
  };

  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-wrap gap-1">
        {PRESETS.map((p) => {
          const active = p.label === activePreset;
          return (
            <button
              key={p.label}
              type="button"
              onClick={() => {
                if (p.baseUrl) setCloudBaseUrl(p.baseUrl);
                setDetected(null);
                setDetectError(null);
              }}
              className={`rounded-full border px-2 py-0.5 text-[11px] transition-colors duration-fast ${
                active ? 'border-border-strong text-fg' : 'border-border text-fg-muted hover:text-fg'
              }`}
            >
              {p.label}
            </button>
          );
        })}
      </div>

      <input
        type="text"
        value={cloudBaseUrl}
        onChange={(e) => setCloudBaseUrl(e.target.value)}
        placeholder="Base URL (…/v1)"
        spellCheck={false}
        autoComplete="off"
        aria-label="URL base del endpoint"
        className={INPUT_CLS}
      />
      <input
        type="password"
        value={apiKey}
        onChange={(e) => setApiKey(e.target.value)}
        placeholder="API key (opcional en local)"
        spellCheck={false}
        autoComplete="off"
        aria-label="API key"
        className={INPUT_CLS}
      />

      <div className="flex items-center gap-1.5">
        <input
          type="text"
          value={model}
          onChange={(e) => setModel(e.target.value)}
          placeholder="Modelo"
          spellCheck={false}
          autoComplete="off"
          aria-label="Modelo"
          className={INPUT_CLS}
        />
        <button
          type="button"
          onClick={() => void detect()}
          disabled={detecting || !cloudBaseUrl.trim()}
          className="shrink-0 rounded-md border border-border px-2 py-1.5 text-[11px] text-fg-muted transition-colors duration-fast hover:text-fg disabled:opacity-50"
        >
          {detecting ? '…' : 'Detectar'}
        </button>
      </div>

      {detected && detected.length > 0 && (
        <div className="flex max-h-28 flex-col gap-0.5 overflow-y-auto rounded-md border border-border p-1">
          {detected.map((id) => (
            <button
              key={id}
              type="button"
              onClick={() => setModel(id)}
              className={`truncate rounded px-2 py-1 text-left text-[11px] transition-colors duration-fast ${
                id === model ? 'text-fg' : 'text-fg-muted hover:text-fg'
              }`}
            >
              {id}
            </button>
          ))}
        </div>
      )}
      {detectError && <p className="text-[11px] leading-relaxed text-fg-faint">{detectError}</p>}

      <p className="text-[11px] leading-relaxed text-fg-faint">
        Se guarda solo en tu navegador. Cualquier endpoint compatible con OpenAI (Groq, OpenRouter,
        LocalAI…) o el tuyo propio.
      </p>
    </div>
  );
}
