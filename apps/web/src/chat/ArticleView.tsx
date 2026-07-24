import { useMemo, useState } from 'react';
import { Renderer } from '@openuidev/react-lang';
import { useChatStore } from '../app/store';
import MarkdownMessage from '../reading/MarkdownMessage';
import ClickableSurface from '../reading/clickable';
import { curioLibrary } from '../openui/library';
import { openUIArticleSystemPrompt } from '../openui/chatPrompt';
import { useGenUI } from '../openui/useGenUI';

/**
 * The article reader. Paste any text or article, hit "Leer", and it becomes a reading surface:
 * every word is clickable and any phrase is selectable, exactly like an assistant reply.
 *
 * Two views of the same text, toggled with Original / Gen UI:
 *   • Original — the pasted text as Markdown.
 *   • Gen UI — the SAME text re-expressed by composing Curio's components (via OpenUI + the
 *     active brain) so it reads livelier and more skimmable. Words stay click-to-explain.
 */
export default function ArticleView() {
  const article = useChatStore((s) => s.article);
  const setArticle = useChatStore((s) => s.setArticle);
  const [draft, setDraft] = useState('');
  const [genui, setGenui] = useState(false);

  // Stable across renders so it doesn't re-trigger the stream (library.prompt() is rebuilt).
  const systemPrompt = useMemo(() => openUIArticleSystemPrompt(), []);
  const gen = useGenUI(!!article && genui, systemPrompt, article?.content ?? '');

  if (article) {
    return (
      <div className="mx-auto w-full max-w-2xl px-4 py-10">
        <div className="mb-6 flex items-center justify-between gap-3">
          {/* Original vs. Gen UI — same monochrome pill as the other toggles. */}
          <div
            role="tablist"
            aria-label="Vista"
            className="inline-flex items-center gap-0.5 rounded-full border border-border p-0.5"
          >
            {[
              { value: false, label: 'Original' },
              { value: true, label: 'Gen UI' },
            ].map((opt) => {
              const active = genui === opt.value;
              return (
                <button
                  key={opt.label}
                  role="tab"
                  aria-selected={active}
                  onClick={() => setGenui(opt.value)}
                  className={`rounded-full px-3 py-1 text-xs font-medium transition-colors duration-fast ${
                    active ? 'bg-bg-inset text-fg' : 'text-fg-muted hover:text-fg'
                  }`}
                >
                  {opt.label}
                </button>
              );
            })}
          </div>
          <button
            type="button"
            onClick={() => {
              setArticle(null);
              setGenui(false);
            }}
            className="text-xs font-medium text-fg-muted transition-colors duration-fast hover:text-fg"
          >
            Pegar otro
          </button>
        </div>

        {genui ? (
          gen.error ? (
            <p className="rounded-2xl bg-bg-muted px-4 py-3 text-sm text-fg-secondary">
              {gen.error}
            </p>
          ) : gen.response ? (
            // The transformed reading: composed components, words still clickable.
            <div className="text-base leading-relaxed text-fg">
              <ClickableSurface messageId={article.id} streaming={gen.isStreaming}>
                <Renderer
                  response={gen.response}
                  library={curioLibrary}
                  isStreaming={gen.isStreaming}
                />
              </ClickableSurface>
            </div>
          ) : (
            <div className="curio-dots" role="status" aria-label="Transformando">
              <span aria-hidden="true" />
              <span aria-hidden="true" />
              <span aria-hidden="true" />
            </div>
          )
        ) : (
          // Markdown is honored, so pasted articles with headings/lists read well; every
          // word stays clickable and phrases selectable.
          <div className="text-base leading-relaxed text-fg">
            <MarkdownMessage messageId={article.id} content={article.content} />
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-2xl px-4 py-10">
      <h1 className="text-2xl font-bold tracking-tight text-fg">Leer</h1>
      <p className="mt-2 text-base text-fg-muted">
        Pega un artículo o cualquier texto. Luego haz clic en una palabra o selecciona una frase
        para verla explicada ahí mismo — o pásalo a Gen UI para leerlo más ameno.
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
