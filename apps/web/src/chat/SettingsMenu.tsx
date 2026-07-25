import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion, type Transition } from 'framer-motion';
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

// Shared-element transition (Material Design's "shared element", the technique srD4vo demos with
// GSAP): the trigger and the panel share ONE id, so opening MORPHS the little settings button into
// the full panel — the surface literally grows out of the button rather than popping next to it.
// Framer's layoutId is our GSAP-FLIP; it's the same move Curio already uses for the mascot and the
// describe popover (§7, "todo fluye a un lugar"). The box morphs; its contents fade in on top so
// they never squash mid-morph (register 2 + content fade).
const SURFACE_ID = 'curio-settings-surface';
const MORPH: Transition = { type: 'spring', bounce: 0, duration: 0.42 };

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
      {/* Reserve the trigger's 28px footprint so the header row doesn't reflow while the button
          morphs away into the panel (they're the same shared element, never both mounted). */}
      <div className="h-7 w-7">
        <AnimatePresence initial={false}>
          {!open && (
            <motion.button
              layoutId={SURFACE_ID}
              key="trigger"
              type="button"
              aria-haspopup="menu"
              aria-expanded={open}
              aria-label="Ajustes"
              title="Ajustes"
              onClick={() => setOpen(true)}
              transition={MORPH}
              style={{ borderRadius: 9999 }}
              className="grid h-7 w-7 place-items-center text-fg-muted transition-colors duration-fast hover:text-fg"
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
            </motion.button>
          )}
        </AnimatePresence>
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            layoutId={SURFACE_ID}
            key="panel"
            role="menu"
            transition={MORPH}
            style={{ borderRadius: 12, transformOrigin: 'top right' }}
            className="absolute right-0 top-full z-30 mt-2 w-56 overflow-hidden border border-border bg-bg"
          >
            {/* Contents fade (and unblur) in ON TOP of the morphing box, a touch after it starts,
                so they never stretch with the box as it grows from the button. */}
            <motion.div
              initial={{ opacity: 0, filter: 'blur(6px)' }}
              animate={{ opacity: 1, filter: 'blur(0px)', transition: { duration: 0.22, delay: 0.06 } }}
              exit={{ opacity: 0, transition: { duration: 0.1 } }}
              className="flex flex-col gap-3 p-3"
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
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
