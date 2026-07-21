// Safety net for small-model prompt leakage. Even with a label-free prompt, a 1–3B model
// occasionally opens its answer by echoing a field label ("Briefly:", "Critical:",
// "Sentence:", "Term:", "Conversation so far:"). We strip such a leading label — repeatedly,
// since they sometimes stack ("Critical: Briefly: …"). Only a label FOLLOWED BY A COLON/DASH
// at the very start is removed, so ordinary prose that merely begins with one of these words
// is never touched.

const LEADING_LABEL =
  /^[\s>*_"'-]*(?:briefly|critical|important|note|answer|respuesta|explanation|explicaci[oó]n|definition|definici[oó]n|meaning|significado|sentence|frase|oraci[oó]n|term|t[eé]rmino|termino|word|palabra|context|contexto|conversation(?:\s+so\s+far)?|conversaci[oó]n(?:\s+(?:hasta\s+ahora|previa))?)\s*[:\-–—]\s*/i;

/** Strip leaked prompt-scaffolding labels from the start of a description. Never returns
 *  empty (falls back to the trimmed input) so a stubborn leak can't blank the popover. */
export function cleanDescription(text: string): string {
  let t = text.replace(/^\s+/, '');
  for (let i = 0; i < 6 && LEADING_LABEL.test(t); i++) {
    t = t.replace(LEADING_LABEL, '').replace(/^\s+/, '');
  }
  return t.length > 0 ? t : text.trim();
}
