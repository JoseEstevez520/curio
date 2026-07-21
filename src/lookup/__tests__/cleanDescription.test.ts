import { describe, it, expect } from 'vitest';
import { cleanDescription } from '../cleanDescription';

describe('cleanDescription', () => {
  it('leaves clean prose untouched', () => {
    expect(cleanDescription('Un planeta gaseoso grande.')).toBe('Un planeta gaseoso grande.');
  });

  it('strips a single leaked label', () => {
    expect(cleanDescription('BRIEFLY: Un planeta gaseoso grande.')).toBe(
      'Un planeta gaseoso grande.',
    );
    expect(cleanDescription('CRITICAL: responde en español.')).toBe('responde en español.');
  });

  it('strips stacked labels', () => {
    expect(cleanDescription('CRITICAL: BRIEFLY: la gravedad atrae.')).toBe('la gravedad atrae.');
  });

  it('strips Spanish labels and dashes', () => {
    expect(cleanDescription('Respuesta — La célula es la unidad de la vida.')).toBe(
      'La célula es la unidad de la vida.',
    );
  });

  it('does NOT touch a word that merely starts the sentence (no colon)', () => {
    expect(cleanDescription('Palabra que designa un cuerpo celeste.')).toBe(
      'Palabra que designa un cuerpo celeste.',
    );
  });

  it('never returns empty', () => {
    // A bare label with nothing after it falls back to the trimmed original.
    expect(cleanDescription('TERM:')).toBe('TERM:');
  });
});
