import { describe, it, expect } from 'vitest';
import { ollamaModelSupportsVision, ollamaModelNameSuggestsVision } from '../vision';
import { dataUrlToBase64 } from '../../ollama/types';

describe('ollamaModelSupportsVision', () => {
  it('detects vision via the reported families', () => {
    expect(
      ollamaModelSupportsVision({ name: 'x:latest', details: { families: ['llama', 'clip'] } }),
    ).toBe(true);
    expect(ollamaModelSupportsVision({ name: 'y', details: { families: ['mllama'] } })).toBe(true);
  });

  it('detects vision via the model name when families are absent', () => {
    expect(ollamaModelSupportsVision({ name: 'llava:13b' })).toBe(true);
    expect(ollamaModelSupportsVision({ name: 'llama3.2-vision:11b' })).toBe(true);
    expect(ollamaModelSupportsVision({ name: 'moondream:latest' })).toBe(true);
  });

  it('returns false for text-only models and missing input', () => {
    expect(ollamaModelSupportsVision({ name: 'llama3.2:3b' })).toBe(false);
    expect(ollamaModelSupportsVision(null)).toBe(false);
    expect(ollamaModelSupportsVision(undefined)).toBe(false);
  });

  it('name-only check mirrors the tag heuristic', () => {
    expect(ollamaModelNameSuggestsVision('qwen2-vl:7b')).toBe(true);
    expect(ollamaModelNameSuggestsVision('mistral:7b')).toBe(false);
  });
});

describe('dataUrlToBase64', () => {
  it('strips a data-URL prefix down to bare base64', () => {
    expect(dataUrlToBase64('data:image/png;base64,AAAB')).toBe('AAAB');
    expect(dataUrlToBase64('data:image/jpeg;base64,Zm9v')).toBe('Zm9v');
  });

  it('passes bare base64 through unchanged', () => {
    expect(dataUrlToBase64('AAAB')).toBe('AAAB');
  });
});
