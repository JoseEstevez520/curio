import { useEffect, useRef, useState } from 'react';
import { AppBridge, PostMessageTransport } from '@modelcontextprotocol/ext-apps/app-bridge';
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StreamableHTTPClientTransport } from '@modelcontextprotocol/sdk/client/streamableHttp.js';
import type { CallToolResult } from '@modelcontextprotocol/sdk/types.js';
import type { ChatMessage } from '@curio/core';
import { getBrain } from '../llm/brain';

const MCP_PATH = '/excalidraw-mcp';
const RESOURCE_URI = 'ui://excalidraw/mcp-app.html';

const DIAGRAM_FORMAT = {
  type: 'object',
  properties: {
    elements: { type: 'array', items: { type: 'object' } },
  },
  required: ['elements'],
  additionalProperties: false,
};

function extractJson(value: string): unknown[] {
  const withoutFence = value.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '').trim();
  const parsed: unknown = JSON.parse(withoutFence);
  const elements = Array.isArray(parsed)
    ? parsed
    : parsed && typeof parsed === 'object' && 'elements' in parsed && Array.isArray(parsed.elements)
      ? parsed.elements
      : null;
  if (!elements?.length) throw new Error('La IA no generó un diagrama válido.');
  return elements;
}

interface Props {
  explanation: string;
}

export default function ExcalidrawExplanation({ explanation }: Props) {
  const [elements, setElements] = useState<unknown[] | null>(null);
  const [html, setHtml] = useState<string>();
  const [status, setStatus] = useState<'idle' | 'generating' | 'loading' | 'ready' | 'error'>('idle');
  const [error, setError] = useState('');
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const clientRef = useRef<Client | null>(null);
  const bridgeRef = useRef<AppBridge | null>(null);

  const generate = async () => {
    const brain = getBrain('chat');
    if (!brain.ready) {
      setError(brain.reason ?? 'No hay un cerebro disponible.');
      setStatus('error');
      return;
    }

    setStatus('generating');
    setError('');
    try {
      const messages: ChatMessage[] = [
        {
          role: 'system',
          content:
            'You create Excalidraw diagrams to explain a concept. Return ONLY a JSON object with an "elements" array. Start with one cameraUpdate using an exact 4:3 size. Use large labeled rectangles, arrows, and short text. Every drawn element needs a unique id. No markdown, no comments.',
        },
        {
          role: 'user',
          content: `Turn this explanation into one clear visual diagram:\n\n${explanation.slice(0, 6000)}`,
        },
      ];
      const result = await brain.provider.complete({ messages, format: DIAGRAM_FORMAT, temperature: 0.2 });
      setElements(extractJson(result));
      setStatus('loading');
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'No se pudo generar el diagrama.');
      setStatus('error');
    }
  };

  useEffect(() => {
    if (!elements) return;
    let cancelled = false;
    const client = new Client({ name: 'curio-chat', version: '0.1.0' });
    clientRef.current = client;
    const transport = new StreamableHTTPClientTransport(
      new URL(MCP_PATH, window.location.origin),
    );

    void (async () => {
      try {
        await client.connect(transport);
        const tools = await client.listTools();
        const createView = tools.tools.find((tool) => tool.name === 'create_view');
        const uri = (createView as { _meta?: { ui?: { resourceUri?: string } } } | undefined)?._meta?.ui
          ?.resourceUri;
        const resource = await client.readResource({ uri: uri ?? RESOURCE_URI });
        const resourceHtml = resource.contents.find((content) => 'text' in content)?.text;
        if (!resourceHtml || cancelled) throw new Error('Excalidraw no devolvió su interfaz.');
        setHtml(resourceHtml);
      } catch (reason) {
        if (!cancelled) {
          setError(reason instanceof Error ? reason.message : 'No se pudo conectar con Excalidraw.');
          setStatus('error');
        }
      }
    })();

    return () => {
      cancelled = true;
      bridgeRef.current?.close();
      bridgeRef.current = null;
      client.close();
      clientRef.current = null;
    };
  }, [elements]);

  const connectView = async () => {
    const iframe = iframeRef.current;
    const client = clientRef.current;
    if (!iframe || !client || bridgeRef.current || !elements) return;

    const bridge = new AppBridge(
      client,
      { name: 'Curio Chat', version: '0.1.0' },
      { openLinks: {}, serverTools: {}, logging: {} },
    );
    bridgeRef.current = bridge;
    bridge.oninitialized = () => {
      const args = { elements: JSON.stringify(elements) };
      void (async () => {
        try {
          bridge.sendToolInput({ arguments: args });
          const result = await client.callTool({ name: 'create_view', arguments: args });
          if (!('content' in result)) throw new Error('Excalidraw no devolvió el resultado del dibujo.');
          await bridge.sendToolResult(result as CallToolResult);
          setStatus('ready');
        } catch (reason) {
          setError(reason instanceof Error ? reason.message : 'No se pudo dibujar.');
          setStatus('error');
        }
      })();
    };
    await bridge.connect(new PostMessageTransport(iframe.contentWindow!, iframe.contentWindow!));
  };

  return (
    <div className="mt-3">
      {status === 'idle' && (
        <button
          type="button"
          onClick={() => void generate()}
          className="rounded-full border border-border px-3 py-1.5 text-xs text-fg-secondary transition-colors hover:border-fg-muted hover:text-fg"
        >
          Visualizar con Excalidraw
        </button>
      )}
      {status === 'generating' && <span className="text-xs text-fg-muted">preparando diagrama...</span>}
      {status === 'loading' && !html && <span className="text-xs text-fg-muted">cargando Excalidraw...</span>}
      {html && (
        <iframe
          ref={iframeRef}
          title="Explicación visual de Curio"
          sandbox="allow-scripts"
          srcDoc={html}
          onLoad={() => void connectView()}
          className="mt-2 h-[520px] w-full rounded-xl border border-border bg-white"
        />
      )}
      {error && (
        <div className="mt-2 flex items-center gap-2 text-xs text-fg-muted">
          <span>{error}</span>
          <button type="button" onClick={() => void generate()} className="underline underline-offset-2">
            reintentar
          </button>
        </div>
      )}
    </div>
  );
}
