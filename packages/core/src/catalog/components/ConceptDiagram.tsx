import type { ConceptDiagramData } from '../schemas';
import { SectionLabel, CatalogBlock, type CatalogComponentProps } from './kit';

/** Viewbox size the radial layout is computed in; nodes are positioned as % of this. */
const VIEW_W = 300;
const VIEW_H = 260;
const CENTER_X = 150;
const CENTER_Y = 130;
const RADIUS = 95;

/** A single spoke's computed position, shared by the SVG edge and the HTML pill above it. */
interface NodePosition {
  x: number;
  y: number;
  leftPct: number;
  topPct: number;
}

/** Places `count` nodes evenly around the center, starting straight up (12 o'clock). */
function layoutNodes(count: number): NodePosition[] {
  return Array.from({ length: count }, (_, i) => {
    const angle = -Math.PI / 2 + i * ((2 * Math.PI) / count);
    const x = CENTER_X + RADIUS * Math.cos(angle);
    const y = CENTER_Y + RADIUS * Math.sin(angle);
    return {
      x,
      y,
      leftPct: (x / VIEW_W) * 100,
      topPct: (y / VIEW_H) * 100,
    };
  });
}

interface ConceptDiagramProps extends CatalogComponentProps<ConceptDiagramData> {
  /** When set, the outer nodes become buttons — click one to explore that concept. */
  onSelect?: (label: string) => void;
  /** Section heading above the map. */
  heading?: string;
}

/**
 * A term shown as the hub of a small radial map: the concept in the middle, its related
 * ideas spread evenly around it, and a hairline edge (with an optional relation label)
 * connecting each one back to the center. DESIGN.md §6 "concept-diagram": hairline pills,
 * 1px edges, flat and schematic — no gradients, no shadows. The single accent is reserved
 * for the center node. With `onSelect`, the spokes are clickable — the modal uses it to turn
 * the reader's related links into an explorable graph.
 */
export default function ConceptDiagram({
  data,
  onSelect,
  heading = 'Mapa de conceptos',
}: ConceptDiagramProps) {
  const positions = layoutNodes(data.nodes.length);
  const centerLeftPct = (CENTER_X / VIEW_W) * 100;
  const centerTopPct = (CENTER_Y / VIEW_H) * 100;

  return (
    <CatalogBlock>
      <SectionLabel>{heading}</SectionLabel>

      <div className="relative h-[260px] w-full">
        <svg
          className="absolute inset-0 h-full w-full"
          viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
          preserveAspectRatio="none"
          aria-hidden="true"
        >
          {data.nodes.map((node, index) => {
            const pos = positions[index];
            return (
              <g key={`edge-${index}`}>
                <line
                  x1={CENTER_X}
                  y1={CENTER_Y}
                  x2={pos.x}
                  y2={pos.y}
                  stroke="var(--color-border-strong)"
                  strokeWidth={1}
                />
                {node.relation && (
                  <text
                    x={(CENTER_X + pos.x) / 2}
                    y={(CENTER_Y + pos.y) / 2}
                    fill="var(--color-fg-muted)"
                    fontSize={9}
                    textAnchor="middle"
                    dy={-4}
                  >
                    {node.relation}
                  </text>
                )}
              </g>
            );
          })}
        </svg>

        <div
          className="absolute rounded-full border border-accent bg-bg-inset px-3 py-1 text-sm font-semibold text-accent"
          style={{
            left: `${centerLeftPct}%`,
            top: `${centerTopPct}%`,
            transform: 'translate(-50%, -50%)',
          }}
        >
          {data.center}
        </div>

        {data.nodes.map((node, index) => {
          const pos = positions[index];
          const style = {
            left: `${pos.leftPct}%`,
            top: `${pos.topPct}%`,
            transform: 'translate(-50%, -50%)',
          } as const;
          const base =
            'absolute max-w-[110px] truncate whitespace-nowrap rounded-full border border-border-strong bg-bg px-2.5 py-1 text-xs text-fg-secondary';
          return onSelect ? (
            <button
              key={`node-${index}`}
              type="button"
              onClick={() => onSelect(node.label)}
              className={`${base} transition-colors hover:border-accent hover:text-accent`}
              style={style}
              title={node.label}
            >
              {node.label}
            </button>
          ) : (
            <div key={`node-${index}`} className={base} style={style} title={node.label}>
              {node.label}
            </div>
          );
        })}
      </div>
    </CatalogBlock>
  );
}
