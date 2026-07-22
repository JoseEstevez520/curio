import type { TimelineData } from '../schemas';
import { SectionLabel, CatalogBlock, type CatalogComponentProps } from './kit';

/**
 * Ordered events (a life, a process, a history) shown as a vertical rail.
 * DESIGN.md §6 "timeline": a 1px left rail, each event a small dot node on it,
 * rows separated by whitespace only — no shadows, no boxes, no horizontal rules.
 */
export default function Timeline({ data }: CatalogComponentProps<TimelineData>) {
  return (
    <CatalogBlock>
      {data.title && <SectionLabel>{data.title}</SectionLabel>}

      <ol className="flex flex-col space-y-4 border-l border-border-strong pl-4">
        {data.events.map((event, index) => (
          <li key={index} className="relative">
            <span
              aria-hidden="true"
              className="absolute left-[-20px] top-1 h-[7px] w-[7px] rounded-full bg-fg"
            />
            <p className="text-xs text-fg-muted">{event.date}</p>
            <p className="text-sm font-medium text-fg">{event.label}</p>
            {event.detail && <p className="mt-1 text-sm text-fg-secondary">{event.detail}</p>}
          </li>
        ))}
      </ol>
    </CatalogBlock>
  );
}
