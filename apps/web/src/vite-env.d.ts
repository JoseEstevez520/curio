/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** Optional Groq (OpenAI-compatible) API key — set it in .env.local instead of the UI. */
  readonly VITE_GROQ_API_KEY?: string;
  /** Optional Groq model id override, e.g. 'llama-3.3-70b-versatile'. */
  readonly VITE_GROQ_MODEL?: string;
  /** Optional starting brain: 'groq' or 'ollama'. */
  readonly VITE_BRAIN?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
