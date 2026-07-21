import ModelPicker from './ModelPicker';
import type { OllamaModel } from '../ollama/types';

interface HeaderProps {
  models: OllamaModel[];
}

/** Slim, borderless top bar: the product name and the model picker. */
export default function Header({ models }: HeaderProps) {
  return (
    <header className="bg-bg px-4 py-3">
      <div className="mx-auto flex w-full max-w-2xl items-center justify-between gap-3">
        <span className="text-sm font-semibold tracking-tight text-fg">Curio</span>
        <ModelPicker models={models} />
      </div>
    </header>
  );
}
