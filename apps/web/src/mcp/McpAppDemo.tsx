import { useEffect, useRef, useState } from 'react';
import { AppBridge, PostMessageTransport } from '@modelcontextprotocol/ext-apps/app-bridge';
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StreamableHTTPClientTransport } from '@modelcontextprotocol/sdk/client/streamableHttp.js';
import type { CallToolResult } from '@modelcontextprotocol/sdk/types.js';

const SERVER_URL = 'https://mcp.excalidraw.com/mcp';
const RESOURCE_URI = 'ui://excalidraw/mcp-app.html';

const DEMO_ELEMENTS = [
  { type: 'cameraUpdate', width: 800, height: 600, x: 0, y: 0 },
  {
    type: 'rectangle',
    id: 'curio-mcp',
    x: 180,
    y: 220,
    width: 440,
    height: 120,
    backgroundColor: '#f1f3f5',
    fillStyle: 'solid',
    label: { text: 'Curio + MCP Apps', fontSize: 28 },
  },
];

type Status = 'idle' | 'connecting' | 'ready' | 'drawing' | 'error';

function toolText(result: CallToolResult) {
  return result.content?.find((item) => item.type === 'text')?.text ?? '';
}

export default function McpAppDemo() {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const clientRef = useRef<Client | null>(null);
  const bridgeRef = useRef<AppBridge | null>(null);
  const [html, setHtml] = useState<string>();
  const [status, setStatus] = useState<Status>('idle');
  const [message, setMessage] = useState('');

  const drawDemo = async () => {
    const client = clientRef.current;
    const bridge = bridgeRef.current;
    if (!client || !bridge) return;

    setStatus('drawing');
    try {
      const arguments_ = { elements: JSON.stringify(DEMO_ELEMENTS) };
      bridge.sendToolInput({ arguments: arguments_ });
      const result = await client.callTool({ name: 'create_view', arguments: arguments_ });
      if (!('content' in result)) throw new Error('El servidor devolvió una tarea en vez del resultado');
      const toolResult = result as CallToolResult;
      await bridge.sendToolResult(toolResult);
      setMessage(toolText(toolResult));
      setStatus('ready');
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'No se pudo dibujar');
      setStatus('error');
    }
  };

  useEffect(() => {
    let cancelled = false;
    const client = new Client({ name: 'curio-mcp-app-host', version: '0.1.0' });
    const transport = new StreamableHTTPClientTransport(new URL(SERVER_URL));
    clientRef.current = client;
    setStatus('connecting');

    void (async () => {
      try {
        await client.connect(transport);
        const tools = await client.listTools();
        const createView = tools.tools.find((tool) => tool.name === 'create_view');
        const resourceUri = (createView as { _meta?: { ui?: { resourceUri?: string } } } | undefined)?._meta
          ?.ui?.resourceUri;
        const resource = await client.readResource({ uri: resourceUri ?? RESOURCE_URI });
        const resourceHtml = resource.contents.find((content) => 'text' in content)?.text;
        if (!resourceHtml || cancelled) throw new Error('El servidor no devolvió la UI de Excalidraw');
        setHtml(resourceHtml);
      } catch (error) {
        if (!cancelled) {
          setMessage(error instanceof Error ? error.message : 'No se pudo conectar con Excalidraw');
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
  }, []);

  const connectIframe = async () => {
    const iframe = iframeRef.current;
    const client = clientRef.current;
    if (!iframe || !client || bridgeRef.current) return;

    const bridge = new AppBridge(
      client,
      { name: 'Curio MCP App Host', version: '0.1.0' },
      { openLinks: {}, serverTools: {}, logging: {} },
    );
    bridgeRef.current = bridge;
    bridge.oninitialized = () => {
      setStatus('ready');
      void drawDemo();
    };
    await bridge.connect(new PostMessageTransport(iframe.contentWindow!, iframe.contentWindow!));
  };

  return (
    <main className="min-h-screen bg-bg px-4 py-6 text-fg">
      <div className="mx-auto flex w-full max-w-4xl flex-col gap-4">
        <header className="flex flex-wrap items-baseline justify-between gap-3 border-b border-border pb-4">
          <div>
            <p className="text-xs uppercase tracking-[0.14em] text-fg-muted">Curio experiment</p>
            <h1 className="mt-1 text-xl font-semibold tracking-tight">MCP App host</h1>
          </div>
          <span className="text-sm text-fg-secondary">{status}</span>
        </header>

        <p className="max-w-2xl text-sm leading-6 text-fg-secondary">
          Host mínimo para comprobar que Curio puede cargar y controlar la View de Excalidraw sin
          convertirla en una integración propia.
        </p>

        <div className="overflow-hidden rounded-xl border border-border bg-white">
          {html ? (
            <iframe
              ref={iframeRef}
              title="Excalidraw MCP App"
              sandbox="allow-scripts"
              srcDoc={html}
              onLoad={() => void connectIframe()}
              className="h-[640px] w-full border-0"
            />
          ) : (
            <div className="flex h-40 items-center justify-center text-sm text-fg-muted">
              Conectando con {SERVER_URL}...
            </div>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={() => void drawDemo()}
            disabled={status === 'connecting' || status === 'drawing'}
            className="rounded-full bg-fg px-4 py-2 text-sm text-bg disabled:opacity-40"
          >
            Dibujar prueba
          </button>
          <a
            href="https://github.com/excalidraw/excalidraw-mcp"
            target="_blank"
            rel="noreferrer"
            className="text-sm text-fg-secondary underline underline-offset-4"
          >
            Repositorio del servidor
          </a>
        </div>

        {message && <pre className="whitespace-pre-wrap text-xs text-fg-muted">{message}</pre>}
      </div>
    </main>
  );
}
