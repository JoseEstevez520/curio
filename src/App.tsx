// Placeholder shell. The real chat layout (message list + composer) lands in the
// next v0 slice; this just proves the scaffold builds and runs.
export default function App() {
  return (
    <main className="mx-auto flex min-h-screen max-w-[720px] flex-col justify-center px-6 py-12">
      <h1 className="text-2xl font-bold tracking-tight">Curio</h1>
      <p className="mt-2 text-neutral-500">
        Read a message, click or hover a word, get an inline description. Local-first via Ollama.
      </p>
      <p className="mt-6 text-sm text-neutral-400">Scaffold ready — chat UI coming next.</p>
    </main>
  );
}
