/**
 * Does this model output actually compose our components? Our Gen UI system prompt mandates a
 * `root = Panel([...])`, so any renderable reply contains a `Panel(` call. A weak brain (a small
 * local Ollama model especially) often ignores the DSL and just answers in prose — which OpenUI
 * can't render ("parse-failed: produced no renderable root"), leaving a blank panel.
 *
 * We use that contract as the signal: no `Panel(` → treat the reply as plain text and show it as
 * Markdown instead of nothing. Cheap and robust; it degrades Gen UI to a normal answer exactly
 * when the model couldn't build one, rather than coupling us to OpenUI's internal parser.
 */
export function isRenderableLang(response: string | null | undefined): boolean {
  return !!response && /\bPanel\s*\(/.test(response);
}
