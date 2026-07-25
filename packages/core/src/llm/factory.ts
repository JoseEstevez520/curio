import { OllamaProvider } from './ollama-provider';
import { OpenAICompatibleProvider } from './openai-provider';
import type { LlmProvider } from './provider';

/** Which brain a surface uses. 'openai' covers Groq and any OpenAI-compatible endpoint. */
export type BrainKind = 'ollama' | 'openai';

export interface BrainConfig {
  kind: BrainKind;
  /** Model id / Ollama tag. */
  model: string;
  /** Bearer key for the cloud brain (ignored by Ollama). */
  apiKey?: string;
  /** API base for the cloud brain (ignored by Ollama). */
  baseUrl?: string;
  /** Extra request headers for the cloud brain (e.g. the dynamic-proxy upstream URL). */
  headers?: Record<string, string>;
  /** Ollama keep-alive window (ignored by the cloud brain). */
  keepAlive?: string;
  /** Short id for logs. */
  name?: string;
}

/**
 * Build an {@link LlmProvider} from a plain config — the one place a surface decides which brain
 * to talk to. Keeps the describe/generate pipeline provider-agnostic: hand it whatever this
 * returns. Ollama stays the local default; 'openai' is the cloud escape hatch (Groq et al.).
 */
export function createBrain(cfg: BrainConfig): LlmProvider {
  if (cfg.kind === 'openai') {
    return new OpenAICompatibleProvider({
      model: cfg.model,
      apiKey: cfg.apiKey,
      baseUrl: cfg.baseUrl,
      headers: cfg.headers,
      name: cfg.name ?? 'openai',
    });
  }
  return new OllamaProvider(cfg.model, cfg.keepAlive);
}
