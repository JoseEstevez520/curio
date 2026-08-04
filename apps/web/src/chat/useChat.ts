import { useCallback } from 'react';
import { useChatStore, toChatMessages } from '../app/store';
import { OllamaError, OpenAIError, runToolLoop } from '@curio/core';
import type { ChatMessageLike, LlmToolCall, ToolStreamSink } from '@curio/core';
import { CHAT_SYSTEM_PROMPT } from '@curio/core';
import { getBrain } from '../llm/brain';
import { openUIChatSystemPrompt } from '../openui/chatPrompt';
import { getEnabledTools, getToolsSystemPrompt, executeEnabledTool, collectToolEffects } from '../tools/registry';

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

    // Enabled tool modules contribute their system-prompt block (e.g. the Excalidraw format).
    const toolsSystemPrompt = getToolsSystemPrompt();
    const systemPrompt = `${genUI ? openUIChatSystemPrompt() : CHAT_SYSTEM_PROMPT}${
      toolsSystemPrompt ? `\n\n${toolsSystemPrompt}` : ''
    }`;

    try {
      const messages = toChatMessages(history, systemPrompt);
      const enabledTools = getEnabledTools();
      const toolLoop = enabledTools.length > 0;

      // Tool-calling path (when any module is enabled): the provider exposes tools and the model
      // decides itself whether to call them. Streaming variant first — text deltas render into the
      // message as they arrive, so tool calls don't leave a blank "thinking" pause for the turn.
      if (toolLoop && provider.completeWithToolsStream) {
        const base: ChatMessageLike[] = messages.map((m) => ({ role: m.role, content: m.content }));
        await runToolLoop(
          async (loopMessages) => {
            const sink: ToolStreamSink = { toolCalls: [] };
            let text = '';
            for await (const delta of provider.completeWithToolsStream!(
              { messages: loopMessages, tools: enabledTools, temperature: 0.2 },
              sink,
            )) {
              text += delta;
              // Render as it arrives, so tool-calling turns don't leave a blank "thinking" pause.
              useChatStore.getState().appendToMessage(assistantId, delta);
            }
            return { content: text, toolCalls: sink.toolCalls };
          },
          {
            messages: base,
            executeTool: async (call: LlmToolCall) => executeEnabledTool(call),
          },
        );
        const effects = collectToolEffects();
        if (effects.length) useChatStore.getState().setMessageEffects(assistantId, effects);
        useChatStore.getState().finishMessage(assistantId);
        return;
      }

      // Non-streaming tool-calling path (providers that implement only completeWithTools).
      if (toolLoop && provider.completeWithTools) {
        const base: ChatMessageLike[] = messages.map((m) => ({ role: m.role, content: m.content }));
        const { content } = await runToolLoop(
          (loopMessages) =>
            provider.completeWithTools!({ messages: loopMessages, tools: enabledTools, temperature: 0.2 }),
          {
            messages: base,
            executeTool: async (call: LlmToolCall) => executeEnabledTool(call),
          },
        );
        const effects = collectToolEffects();
        useChatStore.getState().appendToMessage(assistantId, content);
        if (effects.length) useChatStore.getState().setMessageEffects(assistantId, effects);
        useChatStore.getState().finishMessage(assistantId);
        return;
      }

      // Legacy streaming path (no enabled tools / provider without tool support): stream like before.
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
