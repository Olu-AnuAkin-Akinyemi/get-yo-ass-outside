import { StorageService } from './storage-service';

beforeEach(() => {
  localStorage.clear();
});

describe('StorageService.get / .set', () => {
  it('stores and retrieves a value', () => {
    StorageService.set('key', { foo: 'bar' });
    expect(StorageService.get('key')).toEqual({ foo: 'bar' });
  });

  it('returns null for a missing key', () => {
    expect(StorageService.get('nonexistent')).toBeNull();
  });

  it('returns value within TTL', () => {
    StorageService.set('fresh', 'hello', 60_000);
    expect(StorageService.get('fresh')).toBe('hello');
  });

  it('returns null for an already-expired item', () => {
    StorageService.set('expired', 'value', -1);
    expect(StorageService.get('expired')).toBeNull();
  });

  it('handles corrupt JSON gracefully', () => {
    localStorage.setItem('corrupt', 'not-json{{{');
    expect(StorageService.get('corrupt')).toBeNull();
  });

  it('handles data stored without the expected structure', () => {
    localStorage.setItem('raw', JSON.stringify({ data: 'missing-value-field' }));
    expect(StorageService.get('raw')).toBeNull();
  });

  it('stores without TTL (persists indefinitely)', () => {
    StorageService.set('permanent', 42);
    expect(StorageService.get('permanent')).toBe(42);
  });
});

describe('StorageService.remove', () => {
  it('removes an existing item', () => {
    StorageService.set('removable', true);
    StorageService.remove('removable');
    expect(StorageService.get('removable')).toBeNull();
  });

  it('does not throw when key does not exist', () => {
    expect(() => StorageService.remove('ghost')).not.toThrow();
  });
});

describe('StorageService theme helpers', () => {
  it('sets and retrieves theme preference', () => {
    StorageService.setTheme('dark');
    expect(StorageService.getTheme()).toBe('dark');
  });

  it('returns null when no theme is saved', () => {
    expect(StorageService.getTheme()).toBeNull();
  });

  it('overwrites a previous theme', () => {
    StorageService.setTheme('dark');
    StorageService.setTheme('light');
    expect(StorageService.getTheme()).toBe('light');
  });
});

describe('StorageService location helpers', () => {
  const mockLocation = {
    latitude: 33.749,
    longitude: -84.388,
    accuracy: 10,
    timestamp: Date.now(),
  };

  it('sets and retrieves user location', () => {
    StorageService.setLocation(mockLocation);
    expect(StorageService.getLocation()).toEqual(mockLocation);
  });

  it('returns null when no location is saved', () => {
    expect(StorageService.getLocation()).toBeNull();
  });

  it('clears location', () => {
    StorageService.setLocation(mockLocation);
    StorageService.clearLocation();
    expect(StorageService.getLocation()).toBeNull();
  });
});
