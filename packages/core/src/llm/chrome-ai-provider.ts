import type { CompletionRequest, LlmProvider } from './provider';

/**
 * Chrome's built-in AI provider (Gemini Nano, "Prompt API").
 *
 * Runs fully on-device inside a Chrome MV3 extension (service worker or extension pages),
 * with no daemon and no API key — the extension's counterpart to {@link OllamaProvider}.
 *
 * The Prompt API changed shape across Chrome versions, so we feature-detect two flavors and
 * use whichever exists:
 *  - Modern: the global `LanguageModel` (`availability()` + `create()`).
 *  - Legacy: `self.ai.languageModel` / `self.ai.assistant` (`capabilities()` + `create()`).
 */

/** Error surfaced by {@link ChromeAIProvider.complete} when no usable engine is present. */
const UNAVAILABLE_MESSAGE = 'El navegador no tiene IA integrada (Gemini Nano) disponible.';

/**
 * Default `topK` used whenever a `temperature` is requested. The Prompt API couples the two:
 * passing `temperature` without `topK` (or vice versa) throws, so they travel together.
 */
const DEFAULT_TOP_K = 3;

/** Modern availability states returned by `LanguageModel.availability()`. */
type ModernAvailability = 'unavailable' | 'downloadable' | 'downloading' | 'available';

/** Legacy availability states returned by `ai.languageModel.capabilities()`. */
type LegacyAvailable = 'no' | 'after-download' | 'readily';

/** One entry of the system/priming context handed to `create()`. */
interface InitialPrompt {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

/** Options accepted by both API flavors' `create()`. */
interface CreateOptions {
  initialPrompts?: InitialPrompt[];
  temperature?: number;
  topK?: number;
  signal?: AbortSignal;
}

/** Options accepted by a session's `prompt()`. */
interface PromptOptions {
  /** JSON Schema that forces valid structured JSON output (Ollama's `format` equivalent). */
  responseConstraint?: Record<string, unknown>;
  signal?: AbortSignal;
}

/** A live model session; the shape is identical across both API flavors. */
interface LanguageModelSession {
  prompt(input: string, options?: PromptOptions): Promise<string>;
  destroy(): void;
}

/** The modern global `LanguageModel`. */
interface ModernLanguageModel {
  availability(): Promise<ModernAvailability>;
  create(options?: CreateOptions): Promise<LanguageModelSession>;
}

/** The legacy `ai.languageModel` / `ai.assistant` namespace. */
interface LegacyLanguageModel {
  capabilities(): Promise<{ available: LegacyAvailable }>;
  create(options?: CreateOptions): Promise<LanguageModelSession>;
}

/** Return the modern `LanguageModel` global if it exposes the expected methods. */
function getModern(): ModernLanguageModel | undefined {
  const candidate = (globalThis as { LanguageModel?: unknown }).LanguageModel;
  if (
    candidate &&
    typeof (candidate as ModernLanguageModel).availability === 'function' &&
    typeof (candidate as ModernLanguageModel).create === 'function'
  ) {
    return candidate as ModernLanguageModel;
  }
  return undefined;
}

/** Return the legacy `ai.languageModel` (or `ai.assistant`) namespace if usable. */
function getLegacy(): LegacyLanguageModel | undefined {
  const ai = (globalThis as { ai?: { languageModel?: unknown; assistant?: unknown } }).ai;
  if (!ai) return undefined;
  const candidate = ai.languageModel ?? ai.assistant;
  if (
    candidate &&
    typeof (candidate as LegacyLanguageModel).capabilities === 'function' &&
    typeof (candidate as LegacyLanguageModel).create === 'function'
  ) {
    return candidate as LegacyLanguageModel;
  }
  return undefined;
}

/**
 * Feature-detect Chrome's built-in AI. Never throws — any error resolves to `false`.
 *
 * Returns `true` only when the model is ready to use right now ('available' / 'readily').
 * Note: 'downloadable' / 'after-download' mean the engine *could* be used once its weights
 * are downloaded; for the MVP we treat those as not-yet-ready and report `false`.
 */
export async function isChromeAIAvailable(): Promise<boolean> {
  try {
    const modern = getModern();
    if (modern) {
      return (await modern.availability()) === 'available';
    }
    const legacy = getLegacy();
    if (legacy) {
      return (await legacy.capabilities()).available === 'readily';
    }
    return false;
  } catch {
    return false;
  }
}

/**
 * The built-in-AI brain: completes via on-device Gemini Nano, optionally under a JSON-Schema
 * constraint. Preferred inside the extension; callers fall back to {@link OllamaProvider} when
 * {@link isChromeAIAvailable} is `false`.
 */
export class ChromeAIProvider implements LlmProvider {
  readonly name = 'chrome-ai';

  /**
   * Run one completion. `system` messages become the session's priming context; the rest
   * (`user` / `assistant`) are concatenated into the prompt text. An object `format` maps to
   * `responseConstraint` (structured JSON); the bare `'json'` string is ignored because Nano
   * needs a schema, not a mode. `maxTokens` has no Prompt API equivalent and is ignored.
   *
   * @throws Error (Spanish) when no built-in AI engine is present.
   */
  async complete(req: CompletionRequest): Promise<string> {
    const factory: ModernLanguageModel | LegacyLanguageModel | undefined =
      getModern() ?? getLegacy();
    if (!factory) {
      throw new Error(UNAVAILABLE_MESSAGE);
    }

    const systemText = joinContents(req.messages.filter((m) => m.role === 'system'));
    const userText = joinContents(req.messages.filter((m) => m.role !== 'system'));

    const createOptions: CreateOptions = {};
    if (systemText) {
      createOptions.initialPrompts = [{ role: 'system', content: systemText }];
    }
    if (typeof req.temperature === 'number') {
      // temperature and topK are all-or-nothing for the Prompt API.
      createOptions.temperature = req.temperature;
      createOptions.topK = DEFAULT_TOP_K;
    }
    if (req.signal) {
      createOptions.signal = req.signal;
    }

    const promptOptions: PromptOptions = {};
    if (typeof req.format === 'object' && req.format !== null) {
      promptOptions.responseConstraint = req.format;
    }
    if (req.signal) {
      promptOptions.signal = req.signal;
    }

    let session: LanguageModelSession | undefined;
    try {
      session = await factory.create(createOptions);
      return await session.prompt(userText, promptOptions);
    } finally {
      session?.destroy();
    }
  }
}

/** Concatenate message contents with blank-line separators, trimming the result. */
function joinContents(messages: CompletionRequest['messages']): string {
  return messages
    .map((m) => m.content)
    .join('\n\n')
    .trim();
}
