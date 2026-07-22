// Curio extension — background service worker.
//
// The single place that runs the model. It prefers the browser's built-in AI (Gemini Nano) so
// the user needs zero setup; if that isn't available, it falls back to a local Ollama daemon.
// Routing everything through here keeps localhost calls in the extension origin (covered by
// host_permissions), so a page's CSP/CORS never blocks them.
//
// If it falls back to Ollama, the daemon must allow the extension origin:
//   OLLAMA_ORIGINS=chrome-extension://* ollama serve   (see docs/extension.md)

import {
  configureOllama,
  describeWith,
  generateEnvelopeWith,
  listModels,
  pingOllama,
  isChromeAIAvailable,
  ChromeAIProvider,
  OllamaProvider,
  type LlmProvider,
} from '@curio/core';
import { STORAGE, type Brain, type CurioRequest } from './messages';

// The Ollama fallback calls the daemon directly (no dev proxy in the extension).
configureOllama('http://localhost:11434');

async function storedModel(): Promise<string | undefined> {
  const s = await chrome.storage.local.get([STORAGE.model, STORAGE.describeModel]);
  return s[STORAGE.model] ?? s[STORAGE.describeModel];
}

/** Pick the brain: built-in AI first, then Ollama; null if neither is ready. */
async function pickProvider(): Promise<LlmProvider | null> {
  if (await isChromeAIAvailable()) return new ChromeAIProvider();
  const model = await storedModel();
  if (model && (await pingOllama())) return new OllamaProvider(model);
  return null;
}

const NO_BRAIN =
  'No hay IA disponible: activa Gemini Nano en Chrome, o arranca Ollama (con OLLAMA_ORIGINS).';

chrome.runtime.onMessage.addListener((msg: CurioRequest, _sender, sendResponse) => {
  (async () => {
    try {
      if (msg.kind === 'status') {
        let brain: Brain = 'none';
        let models = [] as Awaited<ReturnType<typeof listModels>>;
        if (await isChromeAIAvailable()) {
          brain = 'chrome-ai';
        } else if (await pingOllama()) {
          brain = 'ollama';
          models = await listModels();
        }
        sendResponse({ ok: true, data: { brain, models } });
        return;
      }

      const provider = await pickProvider();
      if (!provider) throw new Error(NO_BRAIN);

      if (msg.kind === 'describe') {
        const text = await describeWith(provider, msg.term, msg.context, msg.conversation);
        sendResponse({ ok: true, data: text });
        return;
      }

      if (msg.kind === 'generate') {
        const envelope = await generateEnvelopeWith(provider, {
          term: msg.term,
          context: msg.context,
          conversation: msg.conversation,
          fallbackText: msg.fallbackText?.trim() || msg.term,
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
