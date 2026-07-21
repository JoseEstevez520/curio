import CurioLogo from '../branding/CurioLogo';
import ModelPicker from './ModelPicker';
import type { OllamaModel } from '../ollama/types';

interface HeaderProps {
  models: OllamaModel[];
}

/** Slim, borderless top bar: the mascot + wordmark, and the model picker. */
export default function Header({ models }: HeaderProps) {
  return (
    <header className="bg-bg px-4 py-3">
      <div className="mx-auto flex w-full max-w-2xl items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <CurioLogo size={26} decorative />
          <span className="text-sm font-semibold tracking-tight text-fg">Curio</span>
        </div>
        <ModelPicker models={models} />
      </div>
    </header>
  );
}
