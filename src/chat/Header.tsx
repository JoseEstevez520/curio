import CurioLogo from '../branding/CurioLogo';
import ModelPicker from './ModelPicker';
import type { OllamaModel } from '../ollama/types';

interface HeaderProps {
  models: OllamaModel[];
  /** Show the mascot + wordmark. Hidden on the empty state, where the hero owns the
   *  brand; it morphs up into this slot once the conversation starts. */
  showBrand: boolean;
}

/** Slim, borderless top bar: the mascot + wordmark, and the model picker. */
export default function Header({ models, showBrand }: HeaderProps) {
  return (
    <header className="bg-bg px-4 py-3">
      <div className="mx-auto flex w-full max-w-2xl items-center justify-between gap-3">
        {showBrand ? (
          <div className="flex items-center gap-2">
            <CurioLogo size={26} decorative className="vt-mascot" />
            <span className="vt-wordmark text-sm font-semibold tracking-tight text-fg">Curio</span>
          </div>
        ) : (
          <span aria-hidden="true" />
        )}
        <ModelPicker models={models} />
      </div>
    </header>
  );
}
