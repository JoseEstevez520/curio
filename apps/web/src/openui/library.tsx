import { z } from 'zod';
import { defineComponent, createLibrary } from '@openuidev/react-lang';
import { toClickable } from '../reading/toClickable';

/**
 * SPIKE (exp/openui) — Curio's catalog re-expressed as an OpenUI component library.
 *
 * The whole point of OpenUI (openui.com): the model NEVER writes HTML or runs code — it only
 * *composes* the components we register here, each a vetted, monochrome Curio piece. That keeps
 * Curio's sacred rule ("el modelo nunca escribe interfaz a mano") intact while giving the
 * level-2.5 feel (the model assembles our pieces into a layout made for the term).
 *
 * Styling stays in OUR components (Tailwind tokens: border-border, text-fg, text-fg-muted…),
 * so anything the model builds already looks like Curio. Leaf components only for the first
 * spike — the model composes them as a top-level sequence; nesting/refs come later.
 */

const Heading = defineComponent({
  name: 'Heading',
  description: 'A short section title for the panel. Use at most once, at the top.',
  props: z.object({ text: z.string() }),
  component: ({ props }) => (
    <h2 className="text-base font-semibold tracking-tight text-fg">{toClickable(props.text)}</h2>
  ),
});

const Prose = defineComponent({
  name: 'Prose',
  description: 'A paragraph of explanatory text. The workhorse for prose.',
  props: z.object({ text: z.string() }),
  component: ({ props }) => (
    <p className="text-sm leading-relaxed text-fg-secondary">{toClickable(props.text)}</p>
  ),
});

const DefinitionCard = defineComponent({
  name: 'DefinitionCard',
  description: 'A concise definition of a term. Use for the core meaning of a word/concept.',
  props: z.object({
    term: z.string(),
    definition: z.string(),
    partOfSpeech: z.string().optional(),
  }),
  component: ({ props }) => (
    <div className="rounded-lg border border-border p-3">
      <div className="flex items-baseline gap-2">
        <span className="text-sm font-semibold text-fg">{toClickable(props.term)}</span>
        {props.partOfSpeech && (
          <span className="text-xs italic text-fg-muted">{toClickable(props.partOfSpeech)}</span>
        )}
      </div>
      <p className="mt-1 text-sm leading-relaxed text-fg-secondary">
        {toClickable(props.definition)}
      </p>
    </div>
  ),
});

const KeyStat = defineComponent({
  name: 'KeyStat',
  description: 'One prominent number/value with a label. Use for a single striking fact.',
  props: z.object({ value: z.string(), label: z.string() }),
  component: ({ props }) => (
    <div className="rounded-lg border border-border p-3">
      <div className="text-xl font-semibold tracking-tight text-fg">{toClickable(props.value)}</div>
      <div className="mt-0.5 text-xs text-fg-muted">{toClickable(props.label)}</div>
    </div>
  ),
});

const FactTable = defineComponent({
  name: 'FactTable',
  description: 'A list of label/value facts. Use for structured attributes (e.g. key data).',
  props: z.object({
    title: z.string().optional(),
    rows: z.array(z.object({ label: z.string(), value: z.string() })),
  }),
  component: ({ props }) => (
    <div className="rounded-lg border border-border">
      {props.title && (
        <div className="border-b border-border px-3 py-2 text-xs font-medium text-fg-muted">
          {toClickable(props.title)}
        </div>
      )}
      <dl className="divide-y divide-border">
        {props.rows.map((r, i) => (
          <div key={i} className="flex items-baseline justify-between gap-4 px-3 py-2">
            <dt className="text-xs text-fg-muted">{toClickable(r.label)}</dt>
            <dd className="text-sm text-fg">{toClickable(r.value)}</dd>
          </div>
        ))}
      </dl>
    </div>
  ),
});

const Timeline = defineComponent({
  name: 'Timeline',
  description: 'Ordered events (a life, a process, a history). Use when order/time matters.',
  props: z.object({
    title: z.string().optional(),
    events: z.array(
      z.object({ date: z.string(), label: z.string(), detail: z.string().optional() }),
    ),
  }),
  component: ({ props }) => (
    <div>
      {props.title && (
        <div className="mb-2 text-xs font-medium text-fg-muted">{toClickable(props.title)}</div>
      )}
      <ol className="border-l border-border">
        {props.events.map((e, i) => (
          <li key={i} className="relative pb-3 pl-4 last:pb-0">
            <span className="absolute -left-[3px] top-1.5 h-1.5 w-1.5 rounded-full bg-fg-muted" />
            <div className="flex items-baseline gap-2">
              <span className="text-xs tabular-nums text-fg-muted">{toClickable(e.date)}</span>
              <span className="text-sm text-fg">{toClickable(e.label)}</span>
            </div>
            {e.detail && <p className="mt-0.5 text-xs text-fg-secondary">{toClickable(e.detail)}</p>}
          </li>
        ))}
      </ol>
    </div>
  ),
});

const Callout = defineComponent({
  name: 'Callout',
  description: 'A subtle highlighted note for a caveat, tip, or "did you know".',
  props: z.object({ text: z.string() }),
  component: ({ props }) => (
    <div className="rounded-lg bg-bg-muted px-3 py-2 text-sm text-fg-secondary">
      {toClickable(props.text)}
    </div>
  ),
});

const BulletList = defineComponent({
  name: 'BulletList',
  description:
    'A short list of points. Set ordered=true for a ranked or sequential list, otherwise bullets.',
  props: z.object({
    title: z.string().optional(),
    ordered: z.boolean().optional(),
    items: z.array(z.string()),
  }),
  component: ({ props }) => {
    const List = props.ordered ? 'ol' : 'ul';
    return (
      <div>
        {props.title && (
          <div className="mb-1.5 text-xs font-medium text-fg-muted">{toClickable(props.title)}</div>
        )}
        <List
          className={`space-y-1 pl-5 text-sm text-fg-secondary ${
            props.ordered ? 'list-decimal' : 'list-disc'
          }`}
        >
          {props.items.map((it, i) => (
            <li key={i}>{toClickable(it)}</li>
          ))}
        </List>
      </div>
    );
  },
});

const Quote = defineComponent({
  name: 'Quote',
  description: 'A notable quotation, optionally attributed to someone. Use for a memorable line.',
  props: z.object({ text: z.string(), author: z.string().optional() }),
  component: ({ props }) => (
    <blockquote className="border-l-2 border-border pl-3 text-sm italic leading-relaxed text-fg-secondary">
      {toClickable(props.text)}
      {props.author && (
        <footer className="mt-1 text-xs not-italic text-fg-muted">— {toClickable(props.author)}</footer>
      )}
    </blockquote>
  ),
});

const Comparison = defineComponent({
  name: 'Comparison',
  description:
    'Two or three things side by side (X vs Y, pros vs cons). Each column has a heading and bullet points.',
  props: z.object({
    title: z.string().optional(),
    columns: z.array(z.object({ heading: z.string(), points: z.array(z.string()) })),
  }),
  component: ({ props }) => (
    <div>
      {props.title && (
        <div className="mb-2 text-xs font-medium text-fg-muted">{toClickable(props.title)}</div>
      )}
      <div
        className="grid gap-3"
        style={{
          gridTemplateColumns: `repeat(${Math.max(1, props.columns.length)}, minmax(0, 1fr))`,
        }}
      >
        {props.columns.map((c, i) => (
          <div key={i} className="rounded-lg border border-border p-3">
            <div className="mb-1.5 text-sm font-semibold text-fg">{toClickable(c.heading)}</div>
            <ul className="list-disc space-y-1 pl-4 text-xs text-fg-secondary">
              {c.points.map((p, j) => (
                <li key={j}>{toClickable(p)}</li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  ),
});

const Steps = defineComponent({
  name: 'Steps',
  description:
    'A numbered how-to / process — sequential instructions. Use this for steps, not Timeline (which is for dated events).',
  props: z.object({
    title: z.string().optional(),
    steps: z.array(z.object({ title: z.string(), detail: z.string().optional() })),
  }),
  component: ({ props }) => (
    <div>
      {props.title && (
        <div className="mb-2 text-xs font-medium text-fg-muted">{toClickable(props.title)}</div>
      )}
      <ol className="space-y-2">
        {props.steps.map((s, i) => (
          <li key={i} className="flex gap-3">
            <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-border text-xs tabular-nums text-fg-muted">
              {i + 1}
            </span>
            <div>
              <div className="text-sm text-fg">{toClickable(s.title)}</div>
              {s.detail && <p className="mt-0.5 text-xs text-fg-secondary">{toClickable(s.detail)}</p>}
            </div>
          </li>
        ))}
      </ol>
    </div>
  ),
});

const CodeBlock = defineComponent({
  name: 'CodeBlock',
  description:
    'A block of source code for a programming answer/snippet. Keep the code faithful; set language when known.',
  props: z.object({ language: z.string().optional(), code: z.string() }),
  // Code is shown verbatim (monospace) — NOT tokenized into clickable words.
  component: ({ props }) => (
    <div className="overflow-hidden rounded-lg border border-border">
      {props.language && (
        <div className="border-b border-border bg-bg-muted px-3 py-1 text-xs text-fg-muted">
          {props.language}
        </div>
      )}
      <pre className="overflow-x-auto bg-bg-muted p-3 text-xs leading-relaxed">
        <code className="font-mono text-fg">{props.code}</code>
      </pre>
    </div>
  ),
});

const StatRow = defineComponent({
  name: 'StatRow',
  description:
    'A row of 2-4 headline figures side by side. Use for a few striking numbers at a glance (more impactful than separate KeyStats).',
  props: z.object({
    stats: z.array(z.object({ value: z.string(), label: z.string() })),
  }),
  component: ({ props }) => (
    <div
      className="grid gap-3"
      style={{ gridTemplateColumns: `repeat(${Math.max(1, props.stats.length)}, minmax(0, 1fr))` }}
    >
      {props.stats.map((s, i) => (
        <div key={i} className="rounded-lg border border-border p-3">
          <div className="text-xl font-semibold tracking-tight text-fg">{toClickable(s.value)}</div>
          <div className="mt-0.5 text-xs text-fg-muted">{toClickable(s.label)}</div>
        </div>
      ))}
    </div>
  ),
});

const BarList = defineComponent({
  name: 'BarList',
  description:
    'A small quantitative comparison as horizontal bars (population, share, counts…). Values are numbers on the same scale.',
  props: z.object({
    title: z.string().optional(),
    items: z.array(z.object({ label: z.string(), value: z.number() })),
  }),
  component: ({ props }) => {
    const max = Math.max(1, ...props.items.map((it) => it.value || 0));
    return (
      <div>
        {props.title && (
          <div className="mb-2 text-xs font-medium text-fg-muted">{toClickable(props.title)}</div>
        )}
        <div className="space-y-1.5">
          {props.items.map((it, i) => (
            <div key={i} className="flex items-center gap-2">
              <span className="w-28 shrink-0 truncate text-xs text-fg-secondary">
                {toClickable(it.label)}
              </span>
              <span className="h-2 flex-1 overflow-hidden rounded-full bg-bg-inset">
                <span
                  className="block h-full rounded-full bg-fg-muted"
                  style={{ width: `${Math.round(((it.value || 0) / max) * 100)}%` }}
                />
              </span>
              <span className="w-14 shrink-0 text-right text-xs tabular-nums text-fg-muted">
                {it.value}
              </span>
            </div>
          ))}
        </div>
      </div>
    );
  },
});

const Tags = defineComponent({
  name: 'Tags',
  description: 'A row of short keyword chips — related terms, topics or labels to skim or click.',
  props: z.object({ items: z.array(z.string()) }),
  component: ({ props }) => (
    <div className="flex flex-wrap gap-2">
      {props.items.map((t, i) => (
        <span
          key={i}
          className="rounded-full border border-border px-2.5 py-0.5 text-xs text-fg-secondary"
        >
          {toClickable(t)}
        </span>
      ))}
    </div>
  ),
});

const Divider = defineComponent({
  name: 'Divider',
  description: 'A thin separator between sections, with an optional short label. Use to structure a long panel.',
  props: z.object({ label: z.string().optional() }),
  component: ({ props }) =>
    props.label ? (
      <div className="flex items-center gap-3 py-1">
        <span className="h-px flex-1 bg-border" />
        <span className="text-xs uppercase tracking-[0.03em] text-fg-muted">
          {toClickable(props.label)}
        </span>
        <span className="h-px flex-1 bg-border" />
      </div>
    ) : (
      <hr className="border-border" />
    ),
});

/**
 * The root the model must enter through: a vertical stack holding any of our pieces. OpenUI
 * requires a single root component (`root = Panel(...)`); children compose via each piece's
 * `.ref` in a union, rendered with `renderNode`. This is where "the model composes our
 * components" actually happens — the layout is ours, the assembly is the model's.
 */
const Panel = defineComponent({
  name: 'Panel',
  description:
    'The container for the whole answer — a vertical stack. Put every other piece inside its children, in reading order.',
  props: z.object({
    children: z.array(
      z.union([
        Heading.ref,
        Prose.ref,
        DefinitionCard.ref,
        KeyStat.ref,
        FactTable.ref,
        Timeline.ref,
        Callout.ref,
        BulletList.ref,
        Quote.ref,
        Comparison.ref,
        Steps.ref,
        CodeBlock.ref,
        StatRow.ref,
        BarList.ref,
        Tags.ref,
        Divider.ref,
      ]),
    ),
  }),
  component: ({ props, renderNode }) => (
    <div className="flex flex-col gap-3">{renderNode(props.children)}</div>
  ),
});

/** The Curio library handed to OpenUI: the exact vocabulary the model may compose. */
export const curioLibrary = createLibrary({
  root: 'Panel',
  components: [
    Panel,
    Heading,
    Prose,
    DefinitionCard,
    KeyStat,
    FactTable,
    Timeline,
    Callout,
    BulletList,
    Quote,
    Comparison,
    Steps,
    CodeBlock,
    StatRow,
    BarList,
    Tags,
    Divider,
  ],
});
