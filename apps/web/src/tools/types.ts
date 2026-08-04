import type { LlmTool, LlmToolCall } from '@curio/core';

/**
 * An effect a tool leaves on the message once it runs — the chat renders it inline after the
 * reply. `kind` selects the renderer; `data` is the renderer's payload.
 */
export interface ToolEffect {
  kind: string;
  data: unknown;
}

/**
 * A pluggable tool module. Register one per capability (Excalidraw, ...): the chat merges every
 * enabled module's `tools`, lets the model call them, and renders any `collectEffect()` result on
 * the message. To add a new tool later: implement this, register it, done — no chat changes.
 */
export interface ToolModule {
  /** Short id, e.g. 'excalidraw'. */
  id: string;
  /** Whether this module participates in the current turn (e.g. from an env flag). */
  enabled: boolean;
  /** The tools the model may call, e.g. read_me + create_view. */
  tools: LlmTool[];
  /** Optional extra system-prompt text describing how/when to use the tools. */
  systemPrompt?: string;
  /** Run one tool call. Throws → the loop reports the error to the model (graceful). */
  execute(call: LlmToolCall): Promise<string>;
  /**
   * Called after the tool loop finishes. Return an effect to render on the assistant message
   * (e.g. the drawn diagram), or null if this turn produced nothing visual.
   */
  collectEffect(): ToolEffect | null;
}
