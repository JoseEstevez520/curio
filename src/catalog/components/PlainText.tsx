import type { PlainTextData } from '../schemas';
import type { CatalogComponentProps } from './kit';

/**
 * The safe default: the model's prose, rendered as-is. No label, no chrome — it should
 * read exactly like the popover gloss, just with room to breathe. This is also the
 * fallback the renderer drops to whenever a richer component fails to validate.
 */
export default function PlainText({ data }: CatalogComponentProps<PlainTextData>) {
  return <p className="whitespace-pre-wrap">{data.text}</p>;
}
