import ModelPicker from './ModelPicker';
import type { OllamaModel } from '../ollama/types';

interface HeaderProps {
  models: OllamaModel[];
}

/** Slim top bar: the product name and the model picker. Hairline separator, no shadow. */
export default function Header({ models }: HeaderProps) {
  return (
    <header className="border-b border-border bg-bg px-6 py-3">
      <div className="mx-auto flex max-w-measure items-center justify-between gap-3">
        <span className="text-sm font-semibold tracking-tight text-fg">Curio</span>
        <ModelPicker models={models} />
      </div>
    </header>
  );
}
