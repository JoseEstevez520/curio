import { useState } from 'react';
import { useChatStore } from '../app/store';
import MarkdownMessage from '../reading/MarkdownMessage';

/**
 * The article reader. Paste any text or article, hit "Leer", and it becomes a reading
 * surface: every word is clickable and any phrase is selectable, exactly like an assistant
 * reply — the same engine (MarkdownMessage → popover → "ver más" modal → generative UI),
 * just fed arbitrary pasted text instead of a chat turn.
 */
export default function ArticleView() {
  const article = useChatStore((s) => s.article);
  const setArticle = useChatStore((s) => s.setArticle);
  const [draft, setDraft] = useState('');

  if (article) {
    return (
      <div className="mx-auto w-full max-w-2xl px-4 py-10">
        <div className="mb-6 flex justify-end">
          <button
            type="button"
            onClick={() => setArticle(null)}
            className="text-xs font-medium text-fg-muted transition-colors duration-fast hover:text-fg"
          >
            Pegar otro
          </button>
        </div>
        {/* Markdown is honored, so pasted articles with headings/lists read well; every
            word stays clickable and phrases selectable. */}
        <div className="text-base leading-relaxed text-fg">
          <MarkdownMessage messageId={article.id} content={article.content} />
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-2xl px-4 py-10">
      <h1 className="text-2xl font-bold tracking-tight text-fg">Leer</h1>
      <p className="mt-2 text-base text-fg-muted">
        Pega un artículo o cualquier texto. Luego haz clic en una palabra o selecciona una frase
        para verla explicada ahí mismo.
      </p>
      <textarea
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        rows={10}
        aria-label="Texto a leer"
        placeholder="Pega aquí el texto…"
        className="mt-6 w-full resize-y rounded-2xl border border-border bg-bg-subtle px-4 py-3 text-base leading-relaxed text-fg outline-none transition-colors duration-fast placeholder:text-fg-faint focus:border-border-strong"
      />
      <div className="mt-4 flex justify-end">
        <button
          type="button"
          disabled={!draft.trim()}
          onClick={() => setArticle(draft.trim())}
          className="rounded-full bg-accent px-5 py-2 text-sm font-medium text-accent-fg transition-colors duration-fast hover:bg-accent-hover disabled:bg-bg-inset disabled:text-fg-faint"
        >
          Leer
        </button>
      </div>
    </div>
  );
}
