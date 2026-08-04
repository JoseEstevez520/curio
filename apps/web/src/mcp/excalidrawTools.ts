// Excalidraw as a modular tool layer on top of Curio's tool-calling.
//
// The provider only knows generic tools (name + description + inputSchema). This module is where
// Excalidraw becomes ONE of those tools: it declares `read_me` (the format cheat-sheet the repo
// wants the model to call first) and `create_view` (the UI tool that renders the diagram), and
// provides an executor that runs them against the MCP server via the same-origin `/excalidraw-mcp`
// proxy. The chat loop (`useChat`) registers these tools and calls `executeExcalidrawTool` when the
// model requests one.

import type { LlmTool, LlmToolCall } from '@curio/core';
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StreamableHTTPClientTransport } from '@modelcontextprotocol/sdk/client/streamableHttp.js';
import type { CallToolResult } from '@modelcontextprotocol/sdk/types.js';

const MCP_PATH = '/excalidraw-mcp';
const RESOURCE_URI = 'ui://excalidraw/mcp-app.html';

/** The Excalidraw element format, distilled so even a small model follows it without the full 27KB sheet. */
export const DIAGRAM_REFERENCE = [
  'Excalidraw element format:',
  '- cameraUpdate: { type: "cameraUpdate", width, height, x, y } — use 4:3 sizes only (400x300, 600x450, 800x600, 1200x900, 1600x1200). Put it FIRST.',
  '- rectangle: { type: "rectangle", id, x, y, width, height, roundness:{type:3}, backgroundColor, fillStyle:"solid" }',
  '- ellipse: { type: "ellipse", id, x, y, width, height, backgroundColor, fillStyle:"solid" }',
  '- diamond: { type: "diamond", id, x, y, width, height, backgroundColor, fillStyle:"solid" }',
  '- text: { type: "text", id, x, y, text, fontSize } — x is the LEFT edge; estimate width as text.length * fontSize * 0.5.',
  '- arrow: { type: "arrow", id, x, y, width, height, points:[[0,0],[dx,dy]], endArrowhead:"arrow", startBinding:{elementId,fixedPoint}, endBinding:{elementId,fixedPoint} }',
  '- Every drawn element needs a unique id and x, y, width, height.',
  '- Emit progressively: background, then per node shape -> its label text -> its arrows.',
  '- Font sizes: minimum 16 for labels, 20 for headings, never below 14.',
  '- Minimum shape size: 120x60. Leave 20-30px gaps. Prefer fewer, larger elements.',
  '- Canvas background is white; use pastel fills (#a5d8ff, #b2f2bb, #ffd8a8, #d0bfff, #ffc9c9, #fff3bf).',
  '- Do not use emoji in text.',
].join('\n');

/**
 * The Excalidraw tools exposed to the model. `read_me` must be available first so the model can
 * learn the format; `create_view` is the UI tool that actually renders.
 */
export const excalidrawTools: LlmTool[] = [
  {
    name: 'read_me',
    description:
      'Returns the Excalidraw element format reference (color palettes, element types, examples, tips). Call this BEFORE create_view when explaining something visually.',
    inputSchema: { type: 'object', properties: {}, additionalProperties: false },
  },
  {
    name: 'create_view',
    description:
      'Renders a hand-drawn Excalidraw diagram from a JSON array string of elements. Elements stream in one by one with draw-on animations. Call read_me first to learn the element format.',
    inputSchema: {
      type: 'object',
      properties: {
        elements: {
          type: 'string',
          description:
            'JSON array string of Excalidraw elements. Must be valid JSON — no comments, no trailing commas. Keep compact. Call read_me first for format reference.',
        },
      },
      required: ['elements'],
      additionalProperties: false,
    },
  },
];

/** A connected MCP client + the fetched view HTML, shared across calls in one chat turn. */
export interface ExcalidrawSession {
  client: Client;
  viewHtml: string;
}

let session: ExcalidrawSession | null = null;

export async function getSession(): Promise<ExcalidrawSession> {
  if (session) return session;
  const client = new Client({ name: 'curio-tools', version: '0.1.0' });
  const transport = new StreamableHTTPClientTransport(
    new URL(MCP_PATH, window.location.origin),
  );
  await client.connect(transport);
  const resource = await client.readResource({ uri: RESOURCE_URI });
  const viewHtml = resource.contents.find((content) => 'text' in content)?.text;
  if (!viewHtml) throw new Error('Excalidraw no devolvió su interfaz.');
  session = { client, viewHtml };
  return session;
}

/** Close the shared MCP session (e.g. when leaving the chat surface). */
export function closeExcalidrawSession(): void {
  void session?.client.close();
  session = null;
}

/** Snapshot of a rendered diagram so the chat can mount the view inside the message. */
export interface DrawnDiagram {
  viewHtml: string;
  elements: unknown[];
}

let lastDrawn: DrawnDiagram | null = null;

/** The last diagram drawn by `create_view` this session — read by Message to render it inline. */
export function consumeLastDrawn(): DrawnDiagram | null {
  const diagram = lastDrawn;
  lastDrawn = null;
  return diagram;
}

function textFromResult(result: CallToolResult): string {
  return result.content?.find((item) => item.type === 'text')?.text ?? '';
}

/**
 * Run one tool call from the model. Returns the tool result text fed back to the model; for
 * `create_view` it also records the rendered diagram (viewHtml + elements) for the chat UI.
 */
export async function executeExcalidrawTool(call: LlmToolCall): Promise<string> {
  const mcp = await getSession();

  if (call.name === 'read_me') {
    const result = await mcp.client.callTool({ name: 'read_me', arguments: {} });
    const instructions = textFromResult(result as CallToolResult);
    if (!instructions) throw new Error('Excalidraw devolvió instrucciones vacías.');
    // Return the FULL official sheet to the model (it's the authoritative reference), but the
    // prompt also carries the distilled version so a small model isn't lost.
    return instructions;
  }

  if (call.name === 'create_view') {
    const raw = call.arguments.elements;
    const elements =
      typeof raw === 'string' ? parseElements(raw) : Array.isArray(raw) ? raw : null;
    if (!elements?.length) {
      throw new Error('create_view necesita un array de elementos JSON válido.');
    }
    const args = { elements: JSON.stringify(elements) };
    const result = await mcp.client.callTool({ name: 'create_view', arguments: args });
    const text = textFromResult(result as CallToolResult);
    if (!text) throw new Error('Excalidraw no devolvió un resultado del dibujo.');
    lastDrawn = { viewHtml: mcp.viewHtml, elements };
    // The diagram is now rendered inline in the chat. Ask the model to close with a brief text
    // explanation instead of calling create_view again.
    return `${text}\n\n(The diagram is already displayed in the chat. Give the user a short 1-2 sentence explanation and STOP — do not call create_view again.)`;
  }

  throw new Error(`Tool desconocida: ${call.name}`);
}

/**
 * Accept the three shapes a model may return for `elements` (array, `{ elements: [...] }`, or the
 * pretty-printed JSON-Lines style DeepSeek emits) and return a flat array of elements.
 */
export function parseElements(value: string): unknown[] {
  const withoutFence = value.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '').trim();

  if (withoutFence.startsWith('[')) {
    const parsed: unknown = JSON.parse(withoutFence);
    if (Array.isArray(parsed)) return parsed;
  }

  if (withoutFence.startsWith('{')) {
    try {
      const parsed: unknown = JSON.parse(withoutFence);
      if (parsed && typeof parsed === 'object' && 'elements' in parsed && Array.isArray(parsed.elements)) {
        return parsed.elements;
      }
    } catch {
      // not a single object — try JSON-Lines below
    }
  }

  const lines = withoutFence
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
    .join('\n');
  if (lines) {
    try {
      const objects = lines.match(/\{.*?\}(?=\s*,?\s*(?:\{|$))/gs) ?? [];
      const parsed: unknown[] = objects.map((object) => JSON.parse(object));
      if (parsed.length > 0) return parsed;
    } catch {
      // not parseable — fall through
    }
  }

  throw new Error('La IA no generó un diagrama válido.');
}
