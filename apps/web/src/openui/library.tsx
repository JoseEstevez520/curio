import { z } from 'zod';
import { defineComponent, createLibrary } from '@openuidev/react-lang';

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
    <h2 className="text-base font-semibold tracking-tight text-fg">{props.text}</h2>
  ),
});

const Prose = defineComponent({
  name: 'Prose',
  description: 'A paragraph of explanatory text. The workhorse for prose.',
  props: z.object({ text: z.string() }),
  component: ({ props }) => (
    <p className="text-sm leading-relaxed text-fg-secondary">{props.text}</p>
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
        <span className="text-sm font-semibold text-fg">{props.term}</span>
        {props.partOfSpeech && (
          <span className="text-xs italic text-fg-muted">{props.partOfSpeech}</span>
        )}
      </div>
      <p className="mt-1 text-sm leading-relaxed text-fg-secondary">{props.definition}</p>
    </div>
  ),
});

const KeyStat = defineComponent({
  name: 'KeyStat',
  description: 'One prominent number/value with a label. Use for a single striking fact.',
  props: z.object({ value: z.string(), label: z.string() }),
  component: ({ props }) => (
    <div className="rounded-lg border border-border p-3">
      <div className="text-xl font-semibold tracking-tight text-fg">{props.value}</div>
      <div className="mt-0.5 text-xs text-fg-muted">{props.label}</div>
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
          {props.title}
        </div>
      )}
      <dl className="divide-y divide-border">
        {props.rows.map((r, i) => (
          <div key={i} className="flex items-baseline justify-between gap-4 px-3 py-2">
            <dt className="text-xs text-fg-muted">{r.label}</dt>
            <dd className="text-sm text-fg">{r.value}</dd>
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
        <div className="mb-2 text-xs font-medium text-fg-muted">{props.title}</div>
      )}
      <ol className="border-l border-border">
        {props.events.map((e, i) => (
          <li key={i} className="relative pb-3 pl-4 last:pb-0">
            <span className="absolute -left-[3px] top-1.5 h-1.5 w-1.5 rounded-full bg-fg-muted" />
            <div className="flex items-baseline gap-2">
              <span className="text-xs tabular-nums text-fg-muted">{e.date}</span>
              <span className="text-sm text-fg">{e.label}</span>
            </div>
            {e.detail && <p className="mt-0.5 text-xs text-fg-secondary">{e.detail}</p>}
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
    <div className="rounded-lg bg-bg-muted px-3 py-2 text-sm text-fg-secondary">{props.text}</div>
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
  components: [Panel, Heading, Prose, DefinitionCard, KeyStat, FactTable, Timeline, Callout],
});
