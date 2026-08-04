// Tool-calling support — the provider-agnostic contract every surface uses.
//
// A "tool" is a capability the model can invoke mid-conversation (read_me, create_view, ...).
// Providers expose their own wire formats (OpenAI `tools` array, Ollama `tools` array), but the
// surface only ever deals with these plain types: describe the tool, let the model call it, get
// the arguments back, run it, and feed the result back in. ChromeAIProvider (Gemini Nano) has no
// tool loop yet, so surfaces must feature-detect with `provider.completeWithTools` before using.

/** A tool the model may call: its name, a description (used for choosing), and its JSON Schema. */
export interface LlmTool {
  name: string;
  description: string;
  /** JSON Schema (object) for the tool's arguments. */
  inputSchema: Record<string, unknown>;
}

/** The model asking the surface to run a tool. */
export interface LlmToolCall {
  /** Stable id used to match the result back to this call. */
  id: string;
  name: string;
  /** Parsed arguments (already validated by the model, but the surface re-checks). */
  arguments: Record<string, unknown>;
}

/** Result of running a tool call, fed back to the model as a `role: 'tool'` message. */
export interface LlmToolResult {
  /** Must match the `LlmToolCall.id` it answers. */
  toolCallId: string;
  content: string;
}

/** Mutable sink a streaming tool-calling request fills as it discovers the model's tool calls. */
export interface ToolStreamSink {
  toolCalls: LlmToolCall[];
}

/**
 * A completion request that exposes tools. When present, the provider should let the model
 * decide whether to answer directly or to call one or more tools.
 */
export interface ToolCompletionRequest {
  /** Full conversation so far, oldest first. */
  messages: ChatMessageLike[];
  /** The tools the model may call. */
  tools: LlmTool[];
  temperature?: number;
  /** Soft cap on generated tokens. */
  maxTokens?: number;
  signal?: AbortSignal;
}

/** The provider's reply to a tool-calling request: either text, tool calls, or both. */
export interface ToolCompletionResponse {
  /** Assistant text (may be empty when the model only calls tools). */
  content: string;
  /** Tools the model wants to run; feed each result back and call again. */
  toolCalls: LlmToolCall[];
}

/** Minimal message shape the tool loop needs (same fields as ChatMessage). */
export interface ChatMessageLike {
  role: 'system' | 'user' | 'assistant' | 'tool';
  content: string;
  /** Present on assistant messages that requested tool calls. */
  toolCalls?: LlmToolCall[];
  /** Present on `role: 'tool'` messages, matching the call they answer. */
  toolCallId?: string;
}

/**
 * Run a tool-calling loop against a provider that supports it: ask, run any requested tools,
 * feed results back, and repeat until the model answers without tool calls.
 */
export async function runToolLoop(
  request: (messages: ChatMessageLike[]) => Promise<ToolCompletionResponse>,
  options: {
    messages: ChatMessageLike[];
    executeTool: (call: LlmToolCall) => Promise<string>;
    /** Guard against a model that keeps calling tools forever. */
    maxIterations?: number;
    signal?: AbortSignal;
  },
): Promise<{ content: string; calls: LlmToolCall[] }> {
  const { messages, executeTool, maxIterations = 6, signal } = options;
  const history: ChatMessageLike[] = [...messages];
  const calls: LlmToolCall[] = [];

  for (let i = 0; i < maxIterations; i++) {
    if (signal?.aborted) throw signal.reason ?? new DOMException('Aborted', 'AbortError');

    const response = await request(history);
    calls.push(...response.toolCalls);
    history.push({ role: 'assistant', content: response.content, toolCalls: response.toolCalls });

    if (response.toolCalls.length === 0) {
      return { content: response.content, calls };
    }

    for (const call of response.toolCalls) {
      let content: string;
      try {
        content = await executeTool(call);
      } catch (e) {
        // A failing tool never kills the reply: report the error to the model as a tool result so
        // it can answer in text (or apologize and stop) instead of leaving the user with nothing.
        content = `Error executing tool "${call.name}": ${
          e instanceof Error ? e.message : String(e)
        }`;
      }
      history.push({ role: 'tool', content, toolCallId: call.id });
    }
  }

  throw new Error('El modelo pidió demasiadas tools seguidas. Se detiene el bucle.');
}
