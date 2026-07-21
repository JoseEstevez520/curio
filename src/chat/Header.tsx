import { motion } from 'framer-motion';
import CurioLogo from '../branding/CurioLogo';
import { MASCOT_MORPH } from '../app/motion';
import ModelPicker from './ModelPicker';
import type { OllamaModel } from '../ollama/types';

interface HeaderProps {
  models: OllamaModel[];
  /** Show the mascot + wordmark. Hidden on the empty state, where the hero owns the
   *  brand; the mascot morphs up into this slot once the conversation starts. */
  showBrand: boolean;
}

/** Slim, borderless top bar: the mascot + wordmark, and the model picker. */
export default function Header({ models, showBrand }: HeaderProps) {
  return (
    <header className="bg-bg px-4 py-3">
      <div className="mx-auto flex w-full max-w-2xl items-center justify-between gap-3">
        {showBrand ? (
          <div className="flex items-center gap-2">
            {/* Shared layoutId with the hero mascot — Framer glides it up into place. */}
            <motion.div
              layoutId="curio-mascot"
              transition={MASCOT_MORPH}
              style={{ width: 30, height: 30 }}
            >
              <CurioLogo size={30} decorative />
            </motion.div>
            {/* The wordmark isn't morphed (scaling text reads badly); it just fades in
                once the mascot has settled. */}
            <motion.span
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.25, delay: 0.25 }}
              className="text-sm font-semibold tracking-tight text-fg"
            >
              Curio
            </motion.span>
          </div>
        ) : (
          <span aria-hidden="true" />
        )}
        <ModelPicker models={models} />
      </div>
    </header>
  );
}
