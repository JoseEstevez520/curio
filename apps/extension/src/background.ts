// Curio extension — background service worker.
//
// The single place that runs the model. In 'auto' mode it prefers the browser's built-in AI
// (Gemini Nano) so the user needs zero setup, then falls back to a local Ollama daemon. In
// 'cloud' mode it talks to any OpenAI-compatible endpoint (bring-your-own-key) the user configured
// in the popup. Routing everything through the background keeps the calls in the extension origin
// (covered by host_permissions / the granted optional origin), so a page's CSP/CORS never blocks
// them — the cloud endpoint is reached DIRECTLY (no dev proxy, unlike the web app).
//
// If it falls back to Ollama, the daemon must allow the extension origin:
//   OLLAMA_ORIGINS=chrome-extension://* ollama serve   (see docs/extension.md)

import {
  configureOllama,
  createBrain,
  describeWith,
  describeImageWith,
  generateEnvelopeWith,
  listModels,
  pingOllama,
  isChromeAIAvailable,
  ChromeAIProvider,
  OllamaProvider,
  STRINGS,
  toLocale,
  type Locale,
  type LlmProvider,
} from '@curio/core';
import { STORAGE, type Brain, type BrainPref, type CurioRequest } from './messages';

// The Ollama fallback calls the daemon directly (no dev proxy in the extension).
configureOllama('http://localhost:11434');

async function storedModel(): Promise<string | undefined> {
  const s = await chrome.storage.local.get([STORAGE.model, STORAGE.describeModel]);
  return s[STORAGE.model] ?? s[STORAGE.describeModel];
}

/** The configured language (defaults to English when unset), for prompts + error messages. */
async function storedLocale(): Promise<Locale> {
  const s = await chrome.storage.local.get(STORAGE.locale);
  return toLocale(s[STORAGE.locale]);
}

interface CloudConfig {
  baseUrl: string;
  apiKey: string;
  model: string;
}

/** The cloud endpoint config, or null when it isn't fully set (base URL + model required). */
async function storedCloud(): Promise<CloudConfig | null> {
  const s = await chrome.storage.local.get([
    STORAGE.cloudBaseUrl,
    STORAGE.cloudApiKey,
    STORAGE.cloudModel,
  ]);
  const baseUrl = (s[STORAGE.cloudBaseUrl] ?? '').trim().replace(/\/$/, '');
  const model = (s[STORAGE.cloudModel] ?? '').trim();
  const apiKey = (s[STORAGE.cloudApiKey] ?? '').trim();
  if (!baseUrl || !model) return null;
  return { baseUrl, apiKey, model };
}

/** The brain preference ('auto' unless the user explicitly chose 'cloud'). */
async function storedBrainPref(): Promise<BrainPref> {
  const s = await chrome.storage.local.get(STORAGE.brain);
  return s[STORAGE.brain] === 'cloud' ? 'cloud' : 'auto';
}

/** A cloud provider reaching the configured endpoint DIRECTLY (real base URL, no proxy). */
function cloudProvider(cfg: CloudConfig): LlmProvider {
  return createBrain({
    kind: 'openai',
    name: 'cloud',
    model: cfg.model,
    apiKey: cfg.apiKey,
    baseUrl: cfg.baseUrl,
  });
}

/**
 * Pick the brain. 'cloud' preference wins when configured; otherwise built-in AI first, then
 * Ollama. Returns null if nothing is ready.
 */
async function pickProvider(): Promise<LlmProvider | null> {
  if ((await storedBrainPref()) === 'cloud') {
    const cloud = await storedCloud();
    if (cloud) return cloudProvider(cloud);
  }
  if (await isChromeAIAvailable()) return new ChromeAIProvider();
  const model = await storedModel();
  if (model && (await pingOllama())) return new OllamaProvider(model);
  return null;
}

chrome.runtime.onMessage.addListener((msg: CurioRequest, _sender, sendResponse) => {
  (async () => {
    try {
      if (msg.kind === 'status') {
        let brain: Brain = 'none';
        let models = [] as Awaited<ReturnType<typeof listModels>>;
        // 'cloud' preference reports cloud when it's fully configured; otherwise probe the local
        // brains (built-in AI, then Ollama) exactly as before.
        if ((await storedBrainPref()) === 'cloud' && (await storedCloud())) {
          brain = 'cloud';
        } else if (await isChromeAIAvailable()) {
          brain = 'chrome-ai';
        } else if (await pingOllama()) {
          brain = 'ollama';
          models = await listModels();
        }
        sendResponse({ ok: true, data: { brain, models } });
        return;
      }

      const provider = await pickProvider();
      const locale = await storedLocale();
      if (!provider) throw new Error(STRINGS[locale].noBrain);

      if (msg.kind === 'describe') {
        const text = await describeWith(provider, msg.term, msg.context, msg.conversation, locale);
        sendResponse({ ok: true, data: text });
        return;
      }

      if (msg.kind === 'describeImage') {
        const text = await describeImageWith(provider, msg.image, msg.context, locale);
        sendResponse({ ok: true, data: text });
        return;
      }

      if (msg.kind === 'generate') {
        const envelope = await generateEnvelopeWith(provider, {
          term: msg.term,
          context: msg.context,
          conversation: msg.conversation,
          fallbackText: msg.fallbackText?.trim() || msg.term,
          locale,
        });
        sendResponse({ ok: true, data: envelope });
        return;
      }
    } catch (e) {
      sendResponse({ ok: false, error: e instanceof Error ? e.message : String(e) });
    }
  })();
  // Keep the message channel open for the async response.
  return true;
});

// Keyboard shortcut (Alt+C): flip the on/off flag; the content script reacts via storage.
chrome.commands?.onCommand.addListener(async (command) => {
  if (command !== 'toggle-curio') return;
  const s = await chrome.storage.local.get(STORAGE.enabled);
  await chrome.storage.local.set({ [STORAGE.enabled]: !s[STORAGE.enabled] });
});
