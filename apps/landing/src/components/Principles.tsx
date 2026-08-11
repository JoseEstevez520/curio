import { Section } from './Section';
import { Reveal } from './Reveal';
import { GitHubIcon } from './GitHubIcon';

/** Minimal line icons, currentColor, matching the hairline/monochrome vocabulary. */
function KeyIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
      <circle cx="8" cy="15" r="4" />
      <path d="M11 12 20 3M16 8l3 3M20 3l1 1" strokeLinecap="round" />
    </svg>
  );
}

function LayersIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
      <path d="M12 3 3 8l9 5 9-5-9-5Z" strokeLinejoin="round" />
      <path d="M3 13l9 5 9-5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function FileIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
      <path d="M6 3h8l4 4v14H6V3Z" strokeLinejoin="round" />
      <path d="M14 3v4h4" strokeLinejoin="round" />
    </svg>
  );
}

const PRINCIPLES = [
  {
    title: 'Local, no API key',
    body: 'Runs on Ollama by default: small models, on your machine. A fast cloud brain (Groq, OpenRouter, etc.) is opt-in, bring-your-own-key.',
    icon: <KeyIcon />,
  },
  {
    title: 'Monochrome, no shadows',
    body: 'Hierarchy comes from whitespace and 1px hairlines. Depth from movement, never from a blur.',
    icon: <LayersIcon />,
  },
  {
    title: 'Document-first',
    body: 'Your knowledge lives in your files, not locked in an app. The engine is a portable core, not a walled product.',
    icon: <FileIcon />,
  },
  {
    title: 'Open source',
    body: 'The whole thing (engine, web app, browser extension) is on GitHub, MIT-leaning, free to read and run.',
    icon: <GitHubIcon />,
  },
];

export function Principles() {
  return (
    <Section>
      <h2 className="mb-6 text-2xl font-semibold tracking-tight text-fg">Principles</h2>
      <div className="grid gap-8 sm:grid-cols-2">
        {PRINCIPLES.map((p, i) => (
          <Reveal key={p.title} index={i}>
            <div className="sm:pr-6">
              <div className="mb-3 h-5 w-5 text-fg-muted">{p.icon}</div>
              <h3 className="mb-2 font-semibold text-fg">{p.title}</h3>
              <p className="text-[0.9375rem] text-fg-secondary">{p.body}</p>
            </div>
          </Reveal>
        ))}
      </div>
    </Section>
  );
}
