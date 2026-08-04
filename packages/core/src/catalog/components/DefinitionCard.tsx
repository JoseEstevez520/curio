import type { DefinitionCardData } from '../schemas';
import { SectionLabel, CatalogBlock, type CatalogComponentProps } from './kit';

/**
 * A term / word meaning. The modal already shows the clicked word as its large title, so
 * this component never repeats `term` — it starts straight from the part-of-speech kicker
 * (if any) and the definition body, then optional examples and synonyms below.
 * DESIGN.md §6 "definition-card": no shadows, no nested boxes; hierarchy via whitespace
 * and hairlines only.
 */
export default function DefinitionCard({ data }: CatalogComponentProps<DefinitionCardData>) {
  const examples = data.examples?.filter((example) => example.trim().length > 0) ?? [];
  const synonyms = data.synonyms?.filter((synonym) => synonym.trim().length > 0) ?? [];

  return (
    <CatalogBlock>
      <div>
        {data.partOfSpeech && (
          <p className="mb-1 text-xs italic text-fg-muted">{data.partOfSpeech}</p>
        )}
        <p className="text-base leading-relaxed text-fg-secondary">{data.definition}</p>
      </div>

      {examples.length > 0 && (
        <div className="flex flex-col gap-2">
          {examples.map((example, index) => (
            <p
              key={index}
              className="border-l border-border-strong pl-3 text-sm italic text-fg-secondary"
            >
              {example}
            </p>
          ))}
        </div>
      )}

      {synonyms.length > 0 && (
        <div>
          <SectionLabel>Synonyms</SectionLabel>
          <p className="text-sm text-fg-secondary">{synonyms.join(', ')}</p>
        </div>
      )}
    </CatalogBlock>
  );
}
