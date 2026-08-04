import { useEffect, useRef } from 'react';
import { AppBridge, PostMessageTransport } from '@modelcontextprotocol/ext-apps/app-bridge';
import type { CallToolResult } from '@modelcontextprotocol/sdk/types.js';
import { getSession, type DrawnDiagram } from './excalidrawTools';

/**
 * Mounts an already-drawn Excalidraw diagram inline in a chat message. Reuses the same MCP session
 * the tool loop opened, so it doesn't reconnect: it just bridges the View iframe to the session
 * client and replays `create_view` with the stored elements.
 */
export default function ExcalidrawView({ diagram }: { diagram: DrawnDiagram }) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const connectedRef = useRef(false);

  useEffect(() => {
    connectedRef.current = false;
  }, [diagram]);

  const connectView = async () => {
    if (connectedRef.current) return;
    const iframe = iframeRef.current;
    if (!iframe) return;

    try {
      const session = await getSession();
      connectedRef.current = true;
      const bridge = new AppBridge(
        session.client,
        { name: 'Curio Chat', version: '0.1.0' },
        { openLinks: {}, serverTools: {}, logging: {} },
      );
      bridge.oninitialized = () => {
        const args = { elements: JSON.stringify(diagram.elements) };
        void (async () => {
          try {
            bridge.sendToolInput({ arguments: args });
            const result = await session.client.callTool({ name: 'create_view', arguments: args });
            if (!('content' in result)) throw new Error('Excalidraw no devolvió el resultado del dibujo.');
            await bridge.sendToolResult(result as CallToolResult);
          } catch {
            // The diagram may already be rendered; a replay failure shouldn't crash the message.
          }
        })();
      };
      await bridge.connect(
        new PostMessageTransport(iframe.contentWindow!, iframe.contentWindow!),
      );
    } catch {
      connectedRef.current = false;
    }
  };

  return (
    <div className="mt-3 overflow-hidden rounded-xl border border-border bg-white">
      <iframe
        ref={iframeRef}
        title="Explicación visual"
        sandbox="allow-scripts"
        srcDoc={diagram.viewHtml}
        onLoad={() => void connectView()}
        className="h-[520px] w-full border-0"
      />
    </div>
  );
}
