import { describe, it, expect } from 'vitest';
import { envelope } from '../schemas';

describe('envelope.safeParse — casos válidos', () => {
  it('acepta un definition-card', () => {
    const ok = envelope.safeParse({
      type: 'definition-card',
      confidence: 0.9,
      data: { term: 'ápice', definition: 'punto más alto' },
    });
    expect(ok.success).toBe(true);
  });

  it('acepta un timeline con 2 eventos (mínimo)', () => {
    const ok = envelope.safeParse({
      type: 'timeline',
      confidence: 0.6,
      data: {
        events: [
          { date: '1914', label: 'Empieza la guerra' },
          { date: '1918', label: 'Termina la guerra' },
        ],
      },
    });
    expect(ok.success).toBe(true);
  });

  it('acepta una comparison con 2 columnas (mínimo)', () => {
    const ok = envelope.safeParse({
      type: 'comparison',
      confidence: 0.5,
      data: {
        columns: ['CPU', 'GPU'],
        rows: [{ label: 'Uso', cells: ['general', 'paralelo'] }],
      },
    });
    expect(ok.success).toBe(true);
  });

  it('acepta unos steps con 2 pasos (mínimo)', () => {
    const ok = envelope.safeParse({
      type: 'steps',
      confidence: 0.7,
      data: {
        steps: [{ text: 'Hervir agua' }, { text: 'Añadir pasta' }],
      },
    });
    expect(ok.success).toBe(true);
  });

  it('acepta una fact-table', () => {
    const ok = envelope.safeParse({
      type: 'fact-table',
      confidence: 0.8,
      data: { facts: [{ label: 'Diámetro', value: '12742 km' }] },
    });
    expect(ok.success).toBe(true);
  });

  it('acepta un plain-text', () => {
    const ok = envelope.safeParse({
      type: 'plain-text',
      confidence: 0,
      data: { text: 'algo' },
    });
    expect(ok.success).toBe(true);
  });
});

describe('envelope.safeParse — casos rechazados', () => {
  it('rechaza timeline con 1 solo evento (min 2)', () => {
    const bad = envelope.safeParse({
      type: 'timeline',
      confidence: 0.6,
      data: { events: [{ date: '1914', label: 'único' }] },
    });
    expect(bad.success).toBe(false);
  });

  it('rechaza comparison con 1 columna (min 2)', () => {
    const bad = envelope.safeParse({
      type: 'comparison',
      confidence: 0.5,
      data: {
        columns: ['solo-una'],
        rows: [{ label: 'x', cells: ['y'] }],
      },
    });
    expect(bad.success).toBe(false);
  });

  it('rechaza confidence fuera de [0,1]', () => {
    const bad = envelope.safeParse({
      type: 'plain-text',
      confidence: 1.5,
      data: { text: 'algo' },
    });
    expect(bad.success).toBe(false);
  });

  it('rechaza un tipo fuera del catálogo', () => {
    const bad = envelope.safeParse({
      type: 'no-existe',
      confidence: 0.5,
      data: {},
    });
    expect(bad.success).toBe(false);
  });
});
