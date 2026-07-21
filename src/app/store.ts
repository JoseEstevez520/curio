import { create } from 'zustand';
import type { ChatMessage } from '../ollama/types';
import type { Envelope } from '../catalog/schemas';

export type Role = 'user' | 'assistant';

export interface Message {
  id: string;
  role: Role;
  content: string;
  /** True while assistant tokens are still streaming in. */
  streaming?: boolean;
  /** Set if generating this reply failed. */
  error?: string;
}

/** A cached / in-flight term description, keyed by `${messageId} ${term}`. */
export interface DescriptionEntry {
  status: 'loading' | 'done' | 'error';
  text: string;
  error?: string;
}

export function descriptionKey(messageId: string, term: string): string {
  return `${messageId} ${term.trim().toLowerCase()}`;
}

/** A cached / in-flight generative-UI result for the modal, keyed like descriptions. */
export interface GenerativeEntry {
  status: 'loading' | 'done' | 'error';
  /** The validated component envelope, once generation succeeds. */
  envelope?: Envelope;
  error?: string;
}

/**
 * The word or phrase whose description is open. Anchored to the LIVE DOM (an element
 * for a word, a Range for a phrase) so the popover follows the text on scroll.
 */
export interface Selection {
  messageId: string;
  text: string;
  /** Surrounding text (the block/paragraph) sent to the model as context. */
  context: string;
  /** The clicked word element — anchored to and highlighted while open (word click). */
  el: HTMLElement | null;
  /** The selected range (phrase select). */
  range: Range | null;
  /** Nearest block element, so Floating UI can track scroll for a range. */
  block: HTMLElement | null;
}

interface ChatState {
  messages: Message[];
  /** Active Ollama model tag for chat replies, or null until one is chosen. */
  model: string | null;
  /** Model tag used by the (separate, fast) describer; falls back to `model`. */
  describeModel: string | null;
  /** The word/phrase whose description popover is open, or null. */
  selection: Selection | null;
  /** True when the description has been expanded from the small popover into the modal. */
  expanded: boolean;
  /** Description cache + in-flight state, keyed by descriptionKey(). */
  descriptions: Record<string, DescriptionEntry>;
  /** Generative-UI (modal) cache + in-flight state, keyed by descriptionKey(). */
  generatives: Record<string, GenerativeEntry>;

  setModel: (model: string | null) => void;
  setDescribeModel: (model: string | null) => void;

  addUserMessage: (content: string) => void;
  /** Create an empty assistant message and return its id, for streaming into. */
  startAssistantMessage: () => string;
  appendToMessage: (id: string, delta: string) => void;
  finishMessage: (id: string) => void;
  failMessage: (id: string, error: string) => void;

  setSelection: (selection: Selection | null) => void;
  /** Grow the popover into the modal, or shrink it back to the popover. */
  setExpanded: (expanded: boolean) => void;

  setDescription: (key: string, entry: DescriptionEntry) => void;
  setGenerative: (key: string, entry: GenerativeEntry) => void;
}

function newId(): string {
  return crypto.randomUUID();
}

export const useChatStore = create<ChatState>((set) => ({
  messages: [],
  model: null,
  describeModel: null,
  selection: null,
  expanded: false,
  descriptions: {},
  generatives: {},

  setModel: (model) => set({ model }),
  setDescribeModel: (describeModel) => set({ describeModel }),

  addUserMessage: (content) =>
    set((s) => ({ messages: [...s.messages, { id: newId(), role: 'user', content }] })),

  startAssistantMessage: () => {
    const id = newId();
    set((s) => ({
      messages: [...s.messages, { id, role: 'assistant', content: '', streaming: true }],
    }));
    return id;
  },

  appendToMessage: (id, delta) =>
    set((s) => ({
      messages: s.messages.map((m) => (m.id === id ? { ...m, content: m.content + delta } : m)),
    })),

  finishMessage: (id) =>
    set((s) => ({
      messages: s.messages.map((m) => (m.id === id ? { ...m, streaming: false } : m)),
    })),

  failMessage: (id, error) =>
    set((s) => ({
      messages: s.messages.map((m) => (m.id === id ? { ...m, streaming: false, error } : m)),
    })),

  // A new (or cleared) selection always starts collapsed — the modal never survives
  // a change of the described word.
  setSelection: (selection) => set({ selection, expanded: false }),
  setExpanded: (expanded) => set({ expanded }),

  setDescription: (key, entry) =>
    set((s) => ({ descriptions: { ...s.descriptions, [key]: entry } })),

  setGenerative: (key, entry) => set((s) => ({ generatives: { ...s.generatives, [key]: entry } })),
}));

/** Build the message list to send to Ollama for the chat completion. */
export function toChatMessages(messages: Message[], systemPrompt: string): ChatMessage[] {
  return [
    { role: 'system', content: systemPrompt },
    ...messages.filter((m) => !m.error).map((m) => ({ role: m.role, content: m.content })),
  ];
}
