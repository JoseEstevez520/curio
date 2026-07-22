import { useCallback } from 'react';
import { useChatStore, toChatMessages } from '../app/store';
import { chatStream, OllamaError } from '@curio/core';
import { CHAT_SYSTEM_PROMPT } from '@curio/core';

/** Turn an unknown thrown value into a short, user-facing message. */
export function describeError(e: unknown): string {
  if (e instanceof OllamaError) {
    if (e.kind === 'unreachable') {
      return 'Ollama is not running. Start it (ollama serve) and reload.';
    }
    return e.message;
  }
  return e instanceof Error ? e.message : 'Something went wrong.';
}

/** Returns a `send` that posts a user message and streams the assistant reply. */
export function useSendMessage() {
  return useCallback(async (text: string) => {
    const store = useChatStore.getState();
    store.addUserMessage(text);
    const history = useChatStore.getState().messages;
    const assistantId = store.startAssistantMessage();

    const model = useChatStore.getState().model;
    if (!model) {
      store.failMessage(
        assistantId,
        'No model available. Pull one with `ollama pull llama3.2:3b`.',
      );
      return;
    }

    try {
      const messages = toChatMessages(history, CHAT_SYSTEM_PROMPT);
      for await (const delta of chatStream({ model, messages, keepAlive: '10m' })) {
        useChatStore.getState().appendToMessage(assistantId, delta);
      }
      useChatStore.getState().finishMessage(assistantId);
    } catch (e) {
      useChatStore.getState().failMessage(assistantId, describeError(e));
    }
  }, []);
}
