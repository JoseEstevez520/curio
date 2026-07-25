import type { ReactNode } from 'react';
import { tokenize } from '@curio/core';

/**
 * Split text into inline word spans: content words get `.entity` (clickable), the rest are
 * plain spans (so text selection stays clean). Shared by the Markdown reply, the generative
 * (OpenUI) components, and the article reader — anywhere words must be click-to-explain.
 * Pairs with {@link ClickableSurface}, which turns clicks/drags on these spans into a lookup.
 *
 * Defensive on input: a model (especially a small fallback one) can leave a text field null or
 * hand us a number, so we coerce anything non-string before tokenizing — a bad prop must never
 * crash the panel.
 */
export function toClickable(text: unknown): ReactNode[] {
  const str = typeof text === 'string' ? text : text == null ? '' : String(text);
  return tokenize(str).map((tok, i) =>
    tok.clickable ? (
      <span key={i} className="entity">
        {tok.text}
      </span>
    ) : (
      <span key={i}>{tok.text}</span>
    ),
  );
}
