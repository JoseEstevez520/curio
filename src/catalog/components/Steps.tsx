import type { StepsData } from '../schemas';
import { SectionLabel, CatalogBlock, type CatalogComponentProps } from './kit';

/**
 * An ordered how-to or a plain bulleted list (DESIGN.md §6). Numbered steps use a
 * quiet outlined circle marker; unordered items use a small solid dot. Rows are
 * separated by whitespace only — no shadows, no boxes, no hairline dividers between
 * steps.
 */
export default function Steps({ data }: CatalogComponentProps<StepsData>) {
  return (
    <CatalogBlock>
      {data.title && <SectionLabel>{data.title}</SectionLabel>}

      <ol className="flex flex-col space-y-3">
        {data.steps.map((step, index) => (
          <li key={index} className="flex gap-3">
            {data.ordered ? (
              <span
                aria-hidden="true"
                className="mt-0.5 flex h-[20px] w-[20px] shrink-0 items-center justify-center rounded-full border border-border-strong text-xs font-semibold text-fg-muted"
              >
                {index + 1}
              </span>
            ) : (
              <span className="mt-2 flex h-[20px] w-[20px] shrink-0 items-center justify-center">
                <span aria-hidden="true" className="h-[5px] w-[5px] rounded-full bg-fg-muted" />
              </span>
            )}
            <div>
              <p className="text-sm text-fg">{step.text}</p>
              {step.detail && <p className="mt-1 text-sm text-fg-secondary">{step.detail}</p>}
            </div>
          </li>
        ))}
      </ol>
    </CatalogBlock>
  );
}
