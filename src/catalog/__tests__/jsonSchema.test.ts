import { describe, it, expect } from 'vitest';
import { dataJsonSchema, typeChoiceJsonSchema } from '../jsonSchema';

describe('dataJsonSchema', () => {
  it('devuelve un objeto sin la clave $schema y con type:object', () => {
    const schema = dataJsonSchema('definition-card') as Record<string, unknown>;

    expect(schema).not.toHaveProperty('$schema');
    expect(schema.type).toBe('object');
    expect(schema).toHaveProperty('properties');
  });
});

describe('typeChoiceJsonSchema', () => {
  it('devuelve un objeto con propiedades type (enum) y confidence, sin $schema', () => {
    const schema = typeChoiceJsonSchema() as Record<string, unknown>;

    expect(schema).not.toHaveProperty('$schema');

    const properties = schema.properties as Record<string, Record<string, unknown>>;
    expect(properties).toHaveProperty('type');
    expect(properties).toHaveProperty('confidence');
    expect(Array.isArray(properties.type.enum)).toBe(true);
  });
});
