import { useChatStore, type Brain } from '../../app/store';
import Segmented from '../Segmented';
import type { OllamaModel } from '@curio/core';

const BRAIN_OPTIONS: { value: Brain; label: string }[] = [
  { value: 'ollama', label: 'Local' },
  { value: 'groq', label: 'Nube' },
];

const FORMAT_OPTIONS: { value: boolean; label: string }[] = [
  { value: false, label: 'Texto' },
  { value: true, label: 'Gen UI' },
];

function Section({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="mb-1.5 text-[11px] font-medium uppercase tracking-wide text-fg-faint">
        {label}
      </div>
      {children}
    </div>
  );
}

/**
 * The settings body — Respuesta (Texto/Gen UI), Cerebro (Local/Nube) and Modelo. Local lists the
 * installed Ollama models; the cloud brain is read-only here (endpoint/key/model live in
 * `.env.local`, the usual place for a deploy), showing just what's configured.
 */
export default function SettingsContent({ models }: { models: OllamaModel[] }) {
  const genUI = useChatStore((s) => s.genUI);
  const setGenUI = useChatStore((s) => s.setGenUI);
  const brain = useChatStore((s) => s.brain);
  const setBrain = useChatStore((s) => s.setBrain);
  const model = useChatStore((s) => s.model);
  const setModel = useChatStore((s) => s.setModel);
  const groqModel = useChatStore((s) => s.groqModel);
  const cloudBaseUrl = useChatStore((s) => s.cloudBaseUrl);

  return (
    <div className="flex flex-col gap-3">
      <Section label="Respuesta">
        <Segmented
          id="settings-format"
          ariaLabel="Formato de respuesta"
          options={FORMAT_OPTIONS}
          value={genUI}
          onChange={setGenUI}
        />
      </Section>

      <Section label="Cerebro">
        <Segmented
          id="settings-brain"
          ariaLabel="Cerebro"
          options={BRAIN_OPTIONS}
          value={brain}
          onChange={setBrain}
        />
      </Section>

      <Section label="Modelo">
        {brain === 'ollama' ? (
          models.length === 0 ? (
            <p className="text-xs leading-relaxed text-fg-muted">
              No hay modelos locales. Instala uno con <code>ollama pull llama3.2:3b</code>.
            </p>
          ) : (
            <div className="flex flex-col">
              {models.map((m) => {
                const active = m.name === model;
                return (
                  <button
                    key={m.name}
                    type="button"
                    role="menuitemradio"
                    aria-checked={active}
                    onClick={() => setModel(m.name)}
                    className={`flex items-center justify-between gap-2 rounded-md px-2 py-1.5 text-left text-xs transition-colors duration-fast ${
                      active ? 'text-fg' : 'text-fg-muted hover:text-fg'
                    }`}
                  >
                    <span className="truncate">{m.name}</span>
                    {active && (
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                        <path
                          d="M5 12.5l4.5 4.5L19 7"
                          stroke="currentColor"
                          strokeWidth="2.4"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    )}
                  </button>
                );
              })}
            </div>
          )
        ) : (
          <>
            <p className="truncate text-xs text-fg">{groqModel || '—'}</p>
            <p className="mt-1 truncate text-[11px] text-fg-faint">{cloudBaseUrl}</p>
            <p className="mt-1 leading-relaxed text-[11px] text-fg-faint">
              Endpoint, clave y modelo se configuran en <code>.env.local</code>.
            </p>
          </>
        )}
      </Section>
    </div>
  );
}
