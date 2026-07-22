// Curio extension — background service worker.
//
// The single place that talks to Ollama. It points @curio/core at the local daemon and
// answers the content script's requests (describe / generate / models / ping). Routing all
// localhost calls through here keeps them in the extension origin (covered by
// host_permissions), so page CSP/CORS never blocks them.
//
// ⚠️ Ollama must allow the extension origin: run it with
//   OLLAMA_ORIGINS=chrome-extension://* ollama serve   (see docs/extension.md)

import {
  configureOllama,
  chat,
  buildDescribeMessages,
  cleanDescription,
  generateEnvelope,
  listModels,
  pingOllama,
} from '@curio/core';
import { STORAGE, type CurioRequest } from './messages';

// The extension calls the daemon directly (no dev proxy here).
configureOllama('http://localhost:11434');

async function resolveModels(): Promise<{ model?: string; describeModel?: string }> {
  const s = await chrome.storage.local.get([STORAGE.model, STORAGE.describeModel]);
  return { model: s[STORAGE.model], describeModel: s[STORAGE.describeModel] };
}

chrome.runtime.onMessage.addListener((msg: CurioRequest, _sender, sendResponse) => {
  (async () => {
    try {
      if (msg.kind === 'ping') {
        sendResponse({ ok: true, data: await pingOllama() });
        return;
      }
      if (msg.kind === 'models') {
        sendResponse({ ok: true, data: await listModels() });
        return;
      }

      const { model, describeModel } = await resolveModels();

      if (msg.kind === 'describe') {
        const m = describeModel ?? model;
        if (!m) throw new Error('No hay modelo seleccionado. Ábrelo en el popup de Curio.');
        const text = await chat({
          model: m,
          messages: buildDescribeMessages(msg.term, msg.context, msg.conversation),
          temperature: 0.2,
          numPredict: 120,
          keepAlive: '10m',
        });
        sendResponse({ ok: true, data: cleanDescription(text) });
        return;
      }

      if (msg.kind === 'generate') {
        const m = model ?? describeModel;
        if (!m) throw new Error('No hay modelo seleccionado. Ábrelo en el popup de Curio.');
        const envelope = await generateEnvelope({
          model: m,
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
