import type { ReactNode } from 'react';
import { tokenize } from '@curio/core';

/**
 * Split text into inline word spans: content words get `.entity` (clickable), the rest are
 * plain spans (so text selection stays clean). Shared by the Markdown reply, the generative
 * (OpenUI) components, and the article reader — anywhere words must be click-to-explain.
 * Pairs with {@link ClickableSurface}, which turns clicks/drags on these spans into a lookup.
 */
export function toClickable(text: string): ReactNode[] {
  return tokenize(text).map((tok, i) =>
    tok.clickable ? (
      <span key={i} className="entity">
        {tok.text}
      </span>
    ) : (
      <span key={i}>{tok.text}</span>
    ),
  );
}
