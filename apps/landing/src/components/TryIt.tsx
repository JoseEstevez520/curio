import { Section } from './Section';

export function TryIt() {
  return (
    <Section>
      <h2 className="mb-4 text-2xl font-semibold tracking-tight text-fg">Yours to run</h2>
      <p className="max-w-measure text-fg-secondary">
        No account required. Works with an API key, Ollama, or whatever you've got.
      </p>
      <pre className="mt-5 overflow-x-auto rounded-sm border border-border bg-bg-muted p-4 font-mono text-sm leading-relaxed text-fg">
        <span className="text-fg-muted"># requires Node 18+</span>
        {'\n'}
        git clone https://github.com/JoseEstevez520/curio.git{'\n'}
        cd curio{'\n'}
        npm install{'\n'}
        npm run dev <span className="text-fg-muted"># http://localhost:5173</span>
      </pre>
      <p className="mt-4 text-fg-secondary">
        Full setup, including the cloud (bring-your-own-key) option, in the{' '}
        <a
          href="https://github.com/JoseEstevez520/curio#quick-start"
          className="text-accent hover:text-accent-hover"
        >
          README
        </a>
        .
      </p>
    </Section>
  );
}
