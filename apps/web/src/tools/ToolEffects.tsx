import type { ToolEffect } from './types';
import ExcalidrawView from '../mcp/ExcalidrawView';
import type { DrawnDiagram } from '../mcp/excalidrawTools';

/**
 * Render the visual effects a tool module left on a message. Add a case per `kind` when you
 * register a new tool module that produces visual output.
 */
export default function ToolEffects({ effects }: { effects: ToolEffect[] }) {
  return (
    <>
      {effects.map((effect, index) => {
        if (effect.kind === 'excalidraw-diagram') {
          return <ExcalidrawView key={index} diagram={effect.data as DrawnDiagram} />;
        }
        return null;
      })}
    </>
  );
}
