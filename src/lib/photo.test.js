import { describe, expect, it } from 'vitest';
import { isWithinAspectRatio } from './photo.js';

describe('isWithinAspectRatio', () => {
  it('returns true for exact 3:4 ratio', () => {
    expect(isWithinAspectRatio(300, 400)).toBe(true);
  });

  it('returns true when ratio is within tolerance', () => {
    expect(isWithinAspectRatio(303, 400)).toBe(true);
  });

  it('returns false when ratio is outside tolerance', () => {
    expect(isWithinAspectRatio(280, 400)).toBe(false);
  });

  it('returns false for invalid dimensions', () => {
    expect(isWithinAspectRatio(0, 400)).toBe(false);
    expect(isWithinAspectRatio(300, 0)).toBe(false);
  });
});
