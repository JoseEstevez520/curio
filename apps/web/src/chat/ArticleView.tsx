import { useMemo, useState } from 'react';
import { Renderer } from '@openuidev/react-lang';
import { useChatStore } from '../app/store';
import MarkdownMessage from '../reading/MarkdownMessage';
import ClickableSurface from '../reading/clickable';
import { curioLibrary } from '../openui/library';
import { isRenderableLang } from '../openui/renderable';
import { openUIArticleSystemPrompt } from '../openui/chatPrompt';
import { useGenUI } from '../openui/useGenUI';

/**
 * The article reader. Paste any text or article, hit "Read", and it becomes a reading surface:
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
  // Gen UI is the SAME global switch as the header's Texto/Gen UI — no separate toggle here,
  // so turning it on once applies to both the chat and the reader.
  const genUI = useChatStore((s) => s.genUI);
  const locale = useChatStore((s) => s.locale);
  const [draft, setDraft] = useState('');

  // Stable across renders so it doesn't re-trigger the stream (library.prompt() is rebuilt).
  // Rebuilt only when the language changes, so the reading is generated in the chosen language.
  const systemPrompt = useMemo(() => openUIArticleSystemPrompt(locale), [locale]);
  const gen = useGenUI(!!article && genUI, systemPrompt, article?.content ?? '');

  if (article) {
    return (
      <div className="mx-auto w-full max-w-2xl px-4 py-10">
        <div className="mb-6 flex justify-end">
          <button
            type="button"
            onClick={() => setArticle(null)}
            className="text-xs font-medium text-fg-muted transition-colors duration-fast hover:text-fg"
          >
            Paste another
          </button>
        </div>

        {genUI ? (
          gen.error ? (
            <p className="rounded-2xl bg-bg-muted px-4 py-3 text-sm text-fg-secondary">
              {gen.error}
            </p>
          ) : gen.isStreaming || !gen.response ? (
            // Dots for the whole transform: partial OpenUI Lang pops in out of order. Reveal the
            // finished reading at once, staggered (see Panel/Reveal).
            <div className="curio-dots" role="status" aria-label="Transforming">
              <span aria-hidden="true" />
              <span aria-hidden="true" />
              <span aria-hidden="true" />
            </div>
          ) : isRenderableLang(gen.response) ? (
            // The transformed reading: composed components, words still clickable.
            <div className="text-base leading-relaxed text-fg">
              <ClickableSurface messageId={article.id}>
                <Renderer response={gen.response} library={curioLibrary} isStreaming={false} />
              </ClickableSurface>
            </div>
          ) : (
            // The brain (often a small local model) didn't produce a valid Panel — fall back to
            // the original article as Markdown so the reading still works, words still clickable.
            <div className="text-base leading-relaxed text-fg">
              <MarkdownMessage messageId={article.id} content={article.content} />
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
      <h1 className="text-2xl font-bold tracking-tight text-fg">Read</h1>
      <p className="mt-2 text-base text-fg-muted">
        Paste an article or any text. Then click a word — or select a phrase — to see it explained
        right there, or turn on <strong>Gen UI</strong> (above) for a livelier read.
      </p>
      <textarea
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        rows={10}
        aria-label="Text to read"
        placeholder="Paste your text here…"
        className="mt-6 w-full resize-y rounded-2xl border border-border bg-bg-subtle px-4 py-3 text-base leading-relaxed text-fg outline-none transition-colors duration-fast placeholder:text-fg-faint focus:border-border-strong"
      />
      <div className="mt-4 flex justify-end">
        <button
          type="button"
          disabled={!draft.trim()}
          onClick={() => setArticle(draft.trim())}
          className="rounded-full bg-accent px-5 py-2 text-sm font-medium text-accent-fg transition-colors duration-fast hover:bg-accent-hover disabled:bg-bg-inset disabled:text-fg-faint"
        >
          Read
        </button>
      </div>
    </div>
  );
}
