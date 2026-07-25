import { useChatStore, type Brain } from '../../app/store';
import Segmented from '../Segmented';
import type { OllamaModel } from '@curio/core';

const BRAIN_OPTIONS: { value: Brain; label: string }[] = [
  { value: 'ollama', label: 'Local' },
  { value: 'groq', label: 'Groq' },
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
 * The settings body — Respuesta (Texto/Gen UI), Cerebro (Local/Groq) and Modelo — shared by both
 * candidate shells (anchored popover vs. centered modal) so the comparison is only about the
 * open/close motion, not the contents.
 */
export default function SettingsContent({ models }: { models: OllamaModel[] }) {
  const genUI = useChatStore((s) => s.genUI);
  const setGenUI = useChatStore((s) => s.setGenUI);
  const brain = useChatStore((s) => s.brain);
  const setBrain = useChatStore((s) => s.setBrain);
  const model = useChatStore((s) => s.model);
  const setModel = useChatStore((s) => s.setModel);
  const groqModel = useChatStore((s) => s.groqModel);
  const setGroqModel = useChatStore((s) => s.setGroqModel);
  const groqApiKey = useChatStore((s) => s.groqApiKey);
  const setGroqApiKey = useChatStore((s) => s.setGroqApiKey);

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
          <div className="flex flex-col gap-2">
            <input
              type="password"
              value={groqApiKey}
              onChange={(e) => setGroqApiKey(e.target.value)}
              autoComplete="off"
              spellCheck={false}
              aria-label="API key de Groq"
              placeholder="API key (gsk_…)"
              className="rounded-md border border-border bg-bg-subtle px-2 py-1.5 text-xs text-fg outline-none transition-colors duration-fast placeholder:text-fg-faint focus:border-border-strong"
            />
            <input
              type="text"
              value={groqModel}
              onChange={(e) => setGroqModel(e.target.value)}
              autoComplete="off"
              spellCheck={false}
              aria-label="Modelo de Groq"
              placeholder="Modelo (p. ej. llama-3.3-70b-versatile)"
              className="rounded-md border border-border bg-bg-subtle px-2 py-1.5 text-xs text-fg outline-none transition-colors duration-fast placeholder:text-fg-faint focus:border-border-strong"
            />
            <p className="text-[11px] leading-relaxed text-fg-faint">
              Se guarda solo en tu navegador. Consigue una clave en console.groq.com.
            </p>
          </div>
        )}
      </Section>
    </div>
  );
}
