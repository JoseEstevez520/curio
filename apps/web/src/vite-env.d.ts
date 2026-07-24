/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** Optional Groq (OpenAI-compatible) API key — set it in .env.local instead of the UI. */
  readonly VITE_GROQ_API_KEY?: string;
  /** Optional Groq model id override, e.g. 'llama-3.3-70b-versatile'. */
  readonly VITE_GROQ_MODEL?: string;
  /**
   * Optional comma-separated fallback Groq models, tried in order when the primary fails (e.g.
   * a 429 daily-limit). Defaults to 'llama-3.1-8b-instant'.
   */
  readonly VITE_GROQ_FALLBACK_MODELS?: string;
  /** Optional starting brain: 'groq' or 'ollama'. */
  readonly VITE_BRAIN?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
