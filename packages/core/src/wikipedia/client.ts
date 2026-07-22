// Open, key-free reference data from Wikipedia — the "living" side of the modal (a real photo,
// a reliable summary, a link to go deeper). CORS-enabled REST API, so the browser fetches it
// directly; no proxy, no key. This is the one place Curio reaches the open web (see CLAUDE.md).

/** A term's Wikipedia card: what powers the knowledge-panel look of the modal. */
export interface WikiSummary {
  title: string;
  /** Short one-liner Wikipedia shows under the title, e.g. "planeta del sistema solar". */
  description?: string;
  /** A reliable paragraph summarizing the term. */
  extract: string;
  /** A representative photo, when the article has one. */
  thumbnail?: { source: string; width: number; height: number };
  /** Link to the full article. */
  url: string;
}

interface RestSummary {
  type?: string;
  title?: string;
  description?: string;
  extract?: string;
  thumbnail?: { source?: string; width?: number; height?: number };
  content_urls?: { desktop?: { page?: string } };
}

/** REST summary for an exact title (follows redirects). Returns null if it isn't a real article. */
async function summaryOf(
  lang: string,
  title: string,
  signal?: AbortSignal,
): Promise<WikiSummary | null> {
  const url = `https://${lang}.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(title)}?redirect=true`;
  const res = await fetch(url, { signal, headers: { accept: 'application/json' } });
  if (!res.ok) return null;
  const j = (await res.json()) as RestSummary;
  // Skip disambiguation pages and empty stubs — they don't make a good panel.
  if (j.type === 'disambiguation' || !j.extract || !j.title) return null;
  const thumb =
    j.thumbnail?.source && j.thumbnail.width && j.thumbnail.height
      ? { source: j.thumbnail.source, width: j.thumbnail.width, height: j.thumbnail.height }
      : undefined;
  return {
    title: j.title,
    description: j.description,
    extract: j.extract,
    thumbnail: thumb,
    url:
      j.content_urls?.desktop?.page ??
      `https://${lang}.wikipedia.org/wiki/${encodeURIComponent(title)}`,
  };
}

/**
 * Candidate article titles for a free-text term, best first (used when the exact title misses
 * or is a disambiguation). A `hint` (a few context words) is appended so an ambiguous term like
 * "Júpiter" resolves to the article the reader means ("Júpiter (planeta)") instead of the god.
 */
async function searchTitles(
  lang: string,
  term: string,
  hint: string | undefined,
  signal?: AbortSignal,
): Promise<string[]> {
  const query = hint ? `${term} ${hint}` : term;
  const url = `https://${lang}.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(
    query,
  )}&srlimit=5&format=json&origin=*`;
  const res = await fetch(url, { signal });
  if (!res.ok) return [];
  const j = (await res.json()) as { query?: { search?: { title?: string }[] } };
  return (j.query?.search ?? []).map((s) => s.title).filter((t): t is string => !!t);
}

/**
 * Fetch a term's Wikipedia card: try the exact title first, then a hinted search that skips
 * disambiguation pages. Returns null when there's no good article (the modal then falls back to
 * the local description). Never throws except on cancellation — reference data is a bonus.
 *
 * `hint` is a short slice of the surrounding text; it disambiguates ambiguous titles.
 */
export async function fetchWikiSummary(
  term: string,
  lang = 'es',
  signal?: AbortSignal,
  hint?: string,
): Promise<WikiSummary | null> {
  const t = term.trim();
  if (!t) return null;
  try {
    const direct = await summaryOf(lang, t, signal);
    if (direct) return direct;
    // Exact title missed or was a disambiguation — walk the search hits, returning the first
    // that resolves to a real article. Rank so the term's own article wins: an exact match
    // ignoring any "(...)" qualifier first (so "Júpiter" picks "Júpiter (planeta)"), then titles
    // that merely contain the term, then the rest.
    const lower = t.toLowerCase();
    const bare = (title: string) =>
      title
        .toLowerCase()
        .replace(/\s*\([^)]*\)\s*$/, '')
        .trim();
    const score = (title: string) =>
      bare(title) === lower ? 2 : title.toLowerCase().includes(lower) ? 1 : 0;
    const candidates = (await searchTitles(lang, t, hint, signal)).sort(
      (a, b) => score(b) - score(a),
    );
    for (const title of candidates) {
      const hit = await summaryOf(lang, title, signal);
      if (hit) return hit;
    }
    return null;
  } catch (e) {
    if (e instanceof DOMException && e.name === 'AbortError') throw e;
    return null;
  }
}
