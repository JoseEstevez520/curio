import { Children, type ReactNode } from 'react';
import Markdown, { type Components } from 'react-markdown';
import remarkGfm from 'remark-gfm';
import ClickableSurface from './clickable';
import { toClickable } from './toClickable';

/** Replace string children with clickable words; leave nested elements untouched. */
function clickify(children: ReactNode): ReactNode {
  return Children.map(children, (child) =>
    typeof child === 'string' ? toClickable(child) : child,
  );
}

const components: Components = {
  p: ({ children }) => <p className="mb-3 last:mb-0">{clickify(children)}</p>,
  strong: ({ children }) => <strong className="font-semibold text-fg">{clickify(children)}</strong>,
  em: ({ children }) => <em className="italic">{clickify(children)}</em>,
  del: ({ children }) => <del>{clickify(children)}</del>,
  a: ({ href, children }) => (
    <a href={href} target="_blank" rel="noreferrer" className="text-accent underline">
      {children}
    </a>
  ),
  ul: ({ children }) => <ul className="mb-3 list-disc space-y-1 pl-5 last:mb-0">{children}</ul>,
  ol: ({ children }) => <ol className="mb-3 list-decimal space-y-1 pl-5 last:mb-0">{children}</ol>,
  li: ({ children }) => <li>{clickify(children)}</li>,
  h1: ({ children }) => (
    <h3 className="mb-2 mt-4 text-lg font-semibold first:mt-0">{clickify(children)}</h3>
  ),
  h2: ({ children }) => (
    <h3 className="mb-2 mt-4 text-lg font-semibold first:mt-0">{clickify(children)}</h3>
  ),
  h3: ({ children }) => (
    <h4 className="mb-1 mt-3 text-base font-semibold first:mt-0">{clickify(children)}</h4>
  ),
  h4: ({ children }) => (
    <h5 className="mb-1 mt-3 font-semibold first:mt-0">{clickify(children)}</h5>
  ),
  h5: ({ children }) => (
    <h6 className="mb-1 mt-3 font-semibold first:mt-0">{clickify(children)}</h6>
  ),
  h6: ({ children }) => (
    <h6 className="mb-1 mt-3 font-semibold first:mt-0">{clickify(children)}</h6>
  ),
  blockquote: ({ children }) => (
    <blockquote className="mb-3 border-l-2 border-border pl-3 text-fg-secondary last:mb-0">
      {clickify(children)}
    </blockquote>
  ),
  code: ({ className, children }) => {
    const isBlock = /language-/.test(className ?? '');
    return isBlock ? (
      <code className="font-mono text-[0.85em]">{children}</code>
    ) : (
      <code className="rounded-md bg-bg-muted px-1.5 py-0.5 font-mono text-[0.85em]">
        {children}
      </code>
    );
  },
  pre: ({ children }) => (
    <pre className="mb-3 overflow-x-auto rounded-xl bg-bg-muted p-3 text-sm last:mb-0">
      {children}
    </pre>
  ),
  hr: () => <hr className="my-4 border-border" />,
  table: ({ children }) => (
    <div className="mb-3 overflow-x-auto last:mb-0">
      <table className="w-full border-collapse text-sm">{children}</table>
    </div>
  ),
  th: ({ children }) => (
    <th className="border-b border-border px-2 py-1 text-left font-semibold">
      {clickify(children)}
    </th>
  ),
  td: ({ children }) => <td className="border-b border-border px-2 py-1">{clickify(children)}</td>,
};

interface MarkdownMessageProps {
  messageId: string;
  content: string;
  streaming?: boolean;
}

/** Assistant reply rendered as Markdown, with word-click and phrase-selection to describe. */
export default function MarkdownMessage({ messageId, content, streaming }: MarkdownMessageProps) {
  return (
    <ClickableSurface messageId={messageId} streaming={streaming}>
      <Markdown remarkPlugins={[remarkGfm]} components={components}>
        {content}
      </Markdown>
    </ClickableSurface>
  );
}
