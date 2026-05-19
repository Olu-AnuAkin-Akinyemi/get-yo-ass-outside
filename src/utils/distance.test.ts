import { calculateDistance, formatDistance } from './distance';

describe('calculateDistance', () => {
  it('returns 0 for identical coordinates', () => {
    const coord = { latitude: 33.749, longitude: -84.388 };
    expect(calculateDistance(coord, coord)).toBeCloseTo(0, 5);
  });

  it('calculates a known distance (Atlanta → NYC ≈ 746 miles)', () => {
    const atlanta = { latitude: 33.749, longitude: -84.388 };
    const nyc = { latitude: 40.713, longitude: -74.006 };
    // Haversine straight-line distance; assert within ±5 miles of known value
    const dist = calculateDistance(atlanta, nyc);
    expect(dist).toBeGreaterThan(740);
    expect(dist).toBeLessThan(750);
  });

  it('is symmetric — A→B equals B→A', () => {
    const a = { latitude: 33.749, longitude: -84.388 };
    const b = { latitude: 34.0, longitude: -84.0 };
    expect(calculateDistance(a, b)).toBeCloseTo(calculateDistance(b, a), 10);
  });
});

describe('formatDistance', () => {
  it('returns "<0.1 miles" for very short distances', () => {
    expect(formatDistance(0.05)).toBe('<0.1 miles');
    expect(formatDistance(0)).toBe('<0.1 miles');
  });

  it('uses singular "mile" for exactly 1.0', () => {
    expect(formatDistance(1.0)).toBe('1.0 mile');
  });

  it('uses plural "miles" for non-1.0 distances', () => {
    expect(formatDistance(0.3)).toBe('0.3 miles');
    expect(formatDistance(2.5)).toBe('2.5 miles');
  });

  it('rounds to 1 decimal place', () => {
    expect(formatDistance(1.234)).toBe('1.2 miles');
    expect(formatDistance(0.999)).toBe('1.0 mile');
  });
});
