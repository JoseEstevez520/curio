import { useCallback } from 'react';
import { useChatStore, toChatMessages } from '../app/store';
import { OllamaError, OpenAIError, runToolLoop } from '@curio/core';
import type { ChatMessageLike, LlmToolCall } from '@curio/core';
import { CHAT_SYSTEM_PROMPT } from '@curio/core';
import { getBrain } from '../llm/brain';
import { openUIChatSystemPrompt } from '../openui/chatPrompt';
import { excalidrawTools, executeExcalidrawTool, consumeLastDrawn, DIAGRAM_REFERENCE } from '../mcp/excalidrawTools';

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
    // Gen UI mode: the reply COMPOSES components (OpenUI Lang) instead of markdown text.
    const genUI = store.genUI;
    const assistantId = store.startAssistantMessage(genUI);

    const { provider, ready, reason } = getBrain('chat');
    if (!ready) {
      store.failMessage(assistantId, reason ?? 'No brain available.');
      return;
    }

    // System prompt: the base prompt, plus the distilled Excalidraw format so the model knows how
    // to emit elements if it decides to draw. The full sheet still comes from `read_me` at call time.
    const systemPrompt = `${genUI ? openUIChatSystemPrompt() : CHAT_SYSTEM_PROMPT}

## Excalidraw (optional visualization)
When asked to explain something visually, you may call the Excalidraw tools. Call read_me first, then create_view with the elements. Element format:
${DIAGRAM_REFERENCE}`;

    try {
      const messages = toChatMessages(history, systemPrompt);

      // Tool-calling path: the provider exposes tools (Groq, DeepSeek, Ollama). The model decides
      // itself whether to draw. Excalidraw is one modular layer on top of the generic loop.
      if (provider.completeWithTools) {
        const base: ChatMessageLike[] = messages.map((m) => ({ role: m.role, content: m.content }));
        const { content } = await runToolLoop(
          (loopMessages) =>
            provider.completeWithTools!({ messages: loopMessages, tools: excalidrawTools, temperature: 0.2 }),
          {
            messages: base,
            executeTool: async (call: LlmToolCall) => executeExcalidrawTool(call),
          },
        );
        const diagram = consumeLastDrawn();
        useChatStore.getState().appendToMessage(assistantId, content);
        if (diagram) useChatStore.getState().setMessageDiagram(assistantId, diagram);
        useChatStore.getState().finishMessage(assistantId);
        return;
      }

      // Legacy streaming path (providers without tools): stream tokens like before.
      if (provider.completeStream) {
        for await (const delta of provider.completeStream({ messages })) {
          useChatStore.getState().appendToMessage(assistantId, delta);
        }
      } else {
        const out = await provider.complete({ messages });
        useChatStore.getState().appendToMessage(assistantId, out);
      }
      useChatStore.getState().finishMessage(assistantId);
    } catch (e) {
      useChatStore.getState().failMessage(assistantId, describeError(e));
    }
  }, []);
}
