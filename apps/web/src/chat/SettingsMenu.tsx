import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion, type Variants } from 'framer-motion';
import { useChatStore, type Brain } from '../app/store';
import Segmented from './Segmented';
import type { OllamaModel } from '@curio/core';

interface SettingsMenuProps {
  models: OllamaModel[];
}

const BRAIN_OPTIONS: { value: Brain; label: string }[] = [
  { value: 'ollama', label: 'Local' },
  { value: 'groq', label: 'Groq' },
];

const FORMAT_OPTIONS: { value: boolean; label: string }[] = [
  { value: false, label: 'Texto' },
  { value: true, label: 'Gen UI' },
];

// The whole panel GROWS out of the settings icon: it scales up as ONE piece from its top-right
// corner (right under the button) on the iOS decelerating curve — no bounce, no inner stagger — so
// it reads as the box unfolding from the button ("todo fluye a un lugar", DESIGN §9). The scale is
// pronounced enough (0.86 → 1) to actually feel like growth, not a subtle settle.
const PANEL_VARIANTS: Variants = {
  hidden: { opacity: 0, scale: 0.86 },
  show: { opacity: 1, scale: 1, transition: { duration: 0.24, ease: [0.32, 0.72, 0, 1] } },
  exit: { opacity: 0, scale: 0.9, transition: { duration: 0.14, ease: [0.32, 0.72, 0, 1] } },
};

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
 * The preferences that don't belong in the top line — how the model answers (Texto / Gen UI) and
 * which brain runs it (Local / Groq, plus the local model) — tucked behind one settings icon so
 * the header stays a clean row. Local shows the installed models as a tidy checklist (not a naked
 * <select>); Groq's key/model come from `.env.local`. Hairline popover, no shadow — same restraint
 * as the rest.
 */
export default function SettingsMenu({ models }: SettingsMenuProps) {
  const genUI = useChatStore((s) => s.genUI);
  const setGenUI = useChatStore((s) => s.setGenUI);
  const brain = useChatStore((s) => s.brain);
  const setBrain = useChatStore((s) => s.setBrain);
  const model = useChatStore((s) => s.model);
  const setModel = useChatStore((s) => s.setModel);
  const groqModel = useChatStore((s) => s.groqModel);

  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Close on outside click or Escape — standard menu behaviour.
  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('mousedown', onDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label="Ajustes"
        title="Ajustes"
        onClick={() => setOpen((o) => !o)}
        className={`grid h-7 w-7 place-items-center rounded-full transition-colors duration-fast ${
          open ? 'text-fg' : 'text-fg-muted hover:text-fg'
        }`}
      >
        {/* sliders icon (settings) — monochrome strokes */}
        <svg width="17" height="17" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <g stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <line x1="21" x2="14" y1="6" y2="6" />
            <line x1="10" x2="3" y1="6" y2="6" />
            <line x1="21" x2="12" y1="18" y2="18" />
            <line x1="8" x2="3" y1="18" y2="18" />
            <line x1="14" x2="14" y1="4" y2="8" />
            <line x1="8" x2="8" y1="16" y2="20" />
          </g>
        </svg>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            role="menu"
            variants={PANEL_VARIANTS}
            initial="hidden"
            animate="show"
            exit="exit"
            style={{ transformOrigin: 'top right' }}
            className="absolute right-0 top-full z-30 mt-2 flex w-56 flex-col gap-3 rounded-xl border border-border bg-bg p-3"
          >
            <Section label="Respuesta">
              <Segmented
                id="menu-format"
                ariaLabel="Formato de respuesta"
                options={FORMAT_OPTIONS}
                value={genUI}
                onChange={setGenUI}
              />
            </Section>

            <Section label="Cerebro">
              <Segmented
                id="menu-brain"
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
                            <svg
                              width="14"
                              height="14"
                              viewBox="0 0 24 24"
                              fill="none"
                              aria-hidden="true"
                            >
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
                  <p className="truncate text-xs text-fg">{groqModel}</p>
                  <p className="mt-1 text-[11px] leading-relaxed text-fg-faint">
                    Clave y modelo se configuran en <code>.env.local</code>.
                  </p>
                </>
              )}
            </Section>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
