import { describe, it, expect } from 'vitest';
import { coerceEnvelope, coerceFromParts } from '../coerce';

const FALLBACK = 'texto de reserva';

describe('coerceEnvelope', () => {
  it('deja intacto un envelope definition-card válido', () => {
    const input = {
      type: 'definition-card',
      confidence: 0.8,
      data: { term: 'entropía', definition: 'medida del desorden de un sistema' },
    };

    const result = coerceEnvelope(input, FALLBACK);

    expect(result.type).toBe('definition-card');
    expect(result.confidence).toBe(0.8);
    expect(result.data).toEqual({
      term: 'entropía',
      definition: 'medida del desorden de un sistema',
    });
  });

  it('cae a plain-text cuando el tipo es desconocido', () => {
    const result = coerceEnvelope({ type: 'no-existe', confidence: 0.5, data: {} }, FALLBACK);

    expect(result.type).toBe('plain-text');
    expect(result.confidence).toBe(0);
    expect(result.data).toEqual({ text: FALLBACK });
  });

  it('cae a plain-text cuando faltan campos requeridos (definition-card sin definition)', () => {
    const result = coerceEnvelope(
      { type: 'definition-card', confidence: 0.9, data: { term: 'sólo el término' } },
      FALLBACK,
    );

    expect(result.type).toBe('plain-text');
    expect(result.data).toEqual({ text: FALLBACK });
  });

  it.each([
    ['null', null],
    ['string', 'hola'],
    ['número', 42],
    ['objeto vacío', {}],
    ['array', []],
    ['undefined', undefined],
  ])('cae a plain-text ante basura: %s', (_label, garbage) => {
    const result = coerceEnvelope(garbage, FALLBACK);

    expect(result.type).toBe('plain-text');
    expect(result.confidence).toBe(0);
    expect(result.data).toEqual({ text: FALLBACK });
  });

  it('cae a plain-text cuando confidence está fuera de rango (2)', () => {
    const result = coerceEnvelope(
      {
        type: 'definition-card',
        confidence: 2,
        data: { term: 'x', definition: 'y' },
      },
      FALLBACK,
    );

    expect(result.type).toBe('plain-text');
    expect(result.data).toEqual({ text: FALLBACK });
  });

  it('cae a plain-text cuando confidence es negativo (-0.1)', () => {
    const result = coerceEnvelope(
      {
        type: 'definition-card',
        confidence: -0.1,
        data: { term: 'x', definition: 'y' },
      },
      FALLBACK,
    );

    expect(result.type).toBe('plain-text');
    expect(result.data).toEqual({ text: FALLBACK });
  });
});

describe('coerceFromParts', () => {
  it('arma un envelope fact-table a partir de partes válidas', () => {
    const result = coerceFromParts(
      'fact-table',
      0.7,
      { facts: [{ label: 'Capital', value: 'Madrid' }] },
      FALLBACK,
    );

    expect(result.type).toBe('fact-table');
    expect(result.confidence).toBe(0.7);
    expect(result.data).toEqual({ facts: [{ label: 'Capital', value: 'Madrid' }] });
  });

  it('cae a plain-text cuando el tipo es malo', () => {
    const result = coerceFromParts(
      'tabla-inventada',
      0.5,
      { facts: [{ label: 'Capital', value: 'Madrid' }] },
      FALLBACK,
    );

    expect(result.type).toBe('plain-text');
    expect(result.data).toEqual({ text: FALLBACK });
  });

  it('cae a plain-text cuando la data no cumple el esquema (fact sin value)', () => {
    const result = coerceFromParts('fact-table', 0.5, { facts: [{ label: 'Capital' }] }, FALLBACK);

    expect(result.type).toBe('plain-text');
    expect(result.data).toEqual({ text: FALLBACK });
  });
});
