import { useCallback } from 'react';
import { useChatStore, toChatMessages } from '../app/store';
import { OllamaError, OpenAIError } from '@curio/core';
import { CHAT_SYSTEM_PROMPT } from '@curio/core';
import { getBrain } from '../llm/brain';
import { openUIChatSystemPrompt } from '../openui/chatPrompt';

/** Turn an unknown thrown value into a short, user-facing message. */
export function describeError(e: unknown): string {
  if (e instanceof OllamaError) {
    if (e.kind === 'unreachable') {
      return 'Ollama is not running. Start it (ollama serve) and reload.';
    }
    return e.message;
  }
  if (e instanceof OpenAIError) return e.message;
  return e instanceof Error ? e.message : 'Something went wrong.';
}

/** Returns a `send` that posts a user message and streams the assistant reply. */
export function useSendMessage() {
  return useCallback(async (text: string) => {
    const store = useChatStore.getState();
    store.addUserMessage(text);
    const history = useChatStore.getState().messages;
    // Generative chat: the reply COMPOSES components (OpenUI Lang) instead of markdown text.
    const genChat = store.genChat;
    const assistantId = store.startAssistantMessage(genChat);

    const { provider, ready, reason } = getBrain('chat');
    if (!ready) {
      store.failMessage(assistantId, reason ?? 'No brain available.');
      return;
    }

    try {
      const messages = toChatMessages(
        history,
        genChat ? openUIChatSystemPrompt() : CHAT_SYSTEM_PROMPT,
      );
      // Stream when the brain supports it (Ollama, Groq both do); otherwise render at once.
      if (provider.completeStream) {
        for await (const delta of provider.completeStream({ messages })) {
          useChatStore.getState().appendToMessage(assistantId, delta);
        }
      } else {
        const text = await provider.complete({ messages });
        useChatStore.getState().appendToMessage(assistantId, text);
      }
      useChatStore.getState().finishMessage(assistantId);
    } catch (e) {
      useChatStore.getState().failMessage(assistantId, describeError(e));
    }
  }, []);
}
