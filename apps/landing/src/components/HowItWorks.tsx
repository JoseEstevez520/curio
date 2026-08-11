import { Section } from './Section';
import { WordDemo } from './WordDemo';

export function HowItWorks() {
  return (
    <Section id="how">
      <div className="grid gap-6 md:grid-cols-2 md:items-center">
        <div>
          <h2 className="mb-4 text-2xl font-semibold tracking-tight text-fg">
            Click a word. Stay in place.
          </h2>
          <p className="max-w-measure text-fg-secondary">
            A word catches your eye. Click it, or select a whole phrase, and the explanation
            appears right there, reading the sentence around it first.
          </p>
          <p className="mt-4 max-w-measure text-fg">
            <strong>Rewarded on the click, never advertised.</strong> The text reads like plain
            prose. The moment a word makes you wonder, it lights up.
          </p>
        </div>
        <WordDemo />
      </div>
    </Section>
  );
}
