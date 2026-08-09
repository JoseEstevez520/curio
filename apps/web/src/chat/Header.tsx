import { motion } from 'framer-motion';
import CurioLogo from '../branding/CurioLogo';
import Wordmark from '../branding/Wordmark';
import { MASCOT_MORPH } from '@curio/core';
import GenToggle from './GenToggle';
import ModeToggle from './ModeToggle';
import LanguagePicker from './LanguagePicker';
import ThemeToggle from '../theme/ThemeToggle';

interface HeaderProps {
  /** Show the mascot + wordmark. Hidden on the empty state, where the hero owns the
   *  brand; the mascot morphs up into this slot once the conversation starts. */
  showBrand: boolean;
  /** The assistant is generating — the header mascot wobbles while true. */
  thinking: boolean;
  /** A description is open — the mascot puts on its monocle and inspects. */
  inspecting: boolean;
}

/** Slim, borderless top bar: the mascot + wordmark, the reading-surface toggle and the format
 *  toggle. Brain/model are deploy config (env), not header controls. */
export default function Header({ showBrand, thinking, inspecting }: HeaderProps) {
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
              <CurioLogo size={30} thinking={thinking} inspecting={inspecting} decorative />
            </motion.div>
            {/* El wordmark también morphea: comparte layoutId con el del hero y VIAJA
                entre las dos superficies. Nítido porque animamos fontSize (no scale) —
                ver Wordmark.tsx. Sin fade con delay: pelearía con el morph. */}
            <Wordmark variant="header" />
          </div>
        ) : (
          <span aria-hidden="true" />
        )}
        <div className="flex items-center gap-3">
          <GenToggle />
          <ModeToggle />
          <LanguagePicker />
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
