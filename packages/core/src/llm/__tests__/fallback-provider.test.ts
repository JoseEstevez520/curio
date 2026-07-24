import { describe, expect, it } from 'vitest';
import { FallbackProvider } from '../fallback-provider';
import { OpenAIError } from '../openai-provider';
import type { CompletionRequest, LlmProvider } from '../provider';

const req: CompletionRequest = { messages: [{ role: 'user', content: 'hi' }] };

/** A tiny stub brain that either returns text or throws a preset error. */
function stub(name: string, behavior: { text?: string; throws?: unknown }): LlmProvider {
  return {
    name,
    async complete() {
      if (behavior.throws) throw behavior.throws;
      return behavior.text ?? '';
    },
    async *completeStream() {
      if (behavior.throws) throw behavior.throws;
      yield behavior.text ?? '';
    },
  };
}

/** A stream stub that yields some chunks and THEN throws — to prove mid-stream never falls back. */
function midStreamFailer(name: string, chunks: string[], err: unknown): LlmProvider {
  return {
    name,
    async complete() {
      throw err;
    },
    async *completeStream() {
      for (const c of chunks) yield c;
      throw err;
    },
  };
}

describe('FallbackProvider', () => {
  it('uses the first provider when it succeeds', async () => {
    const p = new FallbackProvider([stub('a', { text: 'first' }), stub('b', { text: 'second' })]);
    expect(await p.complete(req)).toBe('first');
  });

  it('falls back to the next provider on a 429', async () => {
    const p = new FallbackProvider([
      stub('a', { throws: new OpenAIError('rate limited', { status: 429 }) }),
      stub('b', { text: 'from-fallback' }),
    ]);
    expect(await p.complete(req)).toBe('from-fallback');
  });

  it('falls back on a 5xx server error', async () => {
    const p = new FallbackProvider([
      stub('a', { throws: new OpenAIError('server', { status: 503 }) }),
      stub('b', { text: 'ok' }),
    ]);
    expect(await p.complete(req)).toBe('ok');
  });

  it('does NOT fall back on a non-retriable error (e.g. 401 bad key)', async () => {
    const p = new FallbackProvider([
      stub('a', { throws: new OpenAIError('unauthorized', { status: 401 }) }),
      stub('b', { text: 'never' }),
    ]);
    await expect(p.complete(req)).rejects.toThrow('unauthorized');
  });

  it('propagates the last error when every provider is rate-limited', async () => {
    const p = new FallbackProvider([
      stub('a', { throws: new OpenAIError('a-limit', { status: 429 }) }),
      stub('b', { throws: new OpenAIError('b-limit', { status: 429 }) }),
    ]);
    await expect(p.complete(req)).rejects.toThrow('b-limit');
  });

  it('never aborts-then-falls-back: AbortError propagates immediately', async () => {
    const abort = new DOMException('aborted', 'AbortError');
    const p = new FallbackProvider([stub('a', { throws: abort }), stub('b', { text: 'never' })]);
    await expect(p.complete(req)).rejects.toBe(abort);
  });

  it('streams from the first provider, falling back only before any token is yielded', async () => {
    const p = new FallbackProvider([
      stub('a', { throws: new OpenAIError('limit', { status: 429 }) }),
      stub('b', { text: 'streamed' }),
    ]);
    const out: string[] = [];
    for await (const d of p.completeStream(req)) out.push(d);
    expect(out.join('')).toBe('streamed');
  });

  it('does NOT fall back once streaming has started (partial output cannot be undone)', async () => {
    const p = new FallbackProvider([
      midStreamFailer('a', ['par', 'tial'], new OpenAIError('limit', { status: 429 })),
      stub('b', { text: 'should-not-be-used' }),
    ]);
    const out: string[] = [];
    await expect(async () => {
      for await (const d of p.completeStream(req)) out.push(d);
    }).rejects.toThrow('limit');
    // The partial tokens were emitted, and the fallback was NOT spliced on.
    expect(out.join('')).toBe('partial');
  });
});
