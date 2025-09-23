import { describe, expect, it } from 'vitest';
import { calculateCropBox, isWithinAspectRatio } from './photo.js';

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

describe('calculateCropBox', () => {
  it('centers crop horizontally for wide images', () => {
    const box = calculateCropBox(1200, 1200);
    expect(box).toEqual({ sx: 150, sy: 0, sw: 900, sh: 1200 });
  });

  it('centers crop vertically for tall images', () => {
    const box = calculateCropBox(600, 1200);
    expect(box).toEqual({ sx: 0, sy: 200, sw: 600, sh: 800 });
  });

  it('returns zeroed box for invalid input', () => {
    expect(calculateCropBox(NaN, 100)).toEqual({ sx: 0, sy: 0, sw: 0, sh: 0 });
  });
});
