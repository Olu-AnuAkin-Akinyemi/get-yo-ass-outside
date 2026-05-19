import { OverpassProvider } from './overpass-provider';

const mockFetch = vi.fn();
vi.stubGlobal('fetch', mockFetch);

const makeOkResponse = (elements: object[]) =>
  Promise.resolve({
    ok: true,
    json: () => Promise.resolve({ version: 0.6, generator: 'test', elements }),
  });

beforeEach(() => {
  mockFetch.mockReset();
});

describe('OverpassProvider.searchNearby', () => {
  it('returns transformed parks from way elements', async () => {
    mockFetch.mockReturnValueOnce(makeOkResponse([
      {
        type: 'way',
        id: 1,
        center: { lat: 33.75, lon: -84.39 },
        tags: { name: 'Piedmont Park', leisure: 'park' },
      },
    ]));

    const parks = await OverpassProvider.searchNearby(33.749, -84.388, 3000);
    expect(parks).toHaveLength(1);
    expect(parks[0]?.name).toBe('Piedmont Park');
    expect(parks[0]?.type).toBe('park');
    expect(parks[0]?.id).toBe('way-1');
  });

  it('returns transformed parks from node elements', async () => {
    mockFetch.mockReturnValueOnce(makeOkResponse([
      {
        type: 'node',
        id: 2,
        lat: 33.75,
        lon: -84.39,
        tags: { name: 'Community Garden', leisure: 'garden' },
      },
    ]));

    const parks = await OverpassProvider.searchNearby(33.749, -84.388, 3000);
    expect(parks[0]?.name).toBe('Community Garden');
    expect(parks[0]?.type).toBe('garden');
  });

  it('uses a fallback name for unnamed elements', async () => {
    mockFetch.mockReturnValueOnce(makeOkResponse([
      {
        type: 'node',
        id: 3,
        lat: 33.75,
        lon: -84.39,
        tags: { leisure: 'nature_reserve' },
      },
    ]));

    const parks = await OverpassProvider.searchNearby(33.749, -84.388, 3000);
    expect(parks[0]?.name).toMatch(/unnamed/i);
  });

  it('filters out elements with no coordinates', async () => {
    mockFetch.mockReturnValueOnce(makeOkResponse([
      {
        type: 'way',
        id: 4,
        tags: { name: 'Ghost Park', leisure: 'park' },
        // no lat/lon, no center
      },
    ]));

    const parks = await OverpassProvider.searchNearby(33.749, -84.388, 3000);
    expect(parks).toHaveLength(0);
  });

  it('defaults unknown leisure tag to "park" type', async () => {
    mockFetch.mockReturnValueOnce(makeOkResponse([
      {
        type: 'node',
        id: 5,
        lat: 33.75,
        lon: -84.39,
        tags: { name: 'Mystery Green', leisure: 'meadow' },
      },
    ]));

    const parks = await OverpassProvider.searchNearby(33.749, -84.388, 3000);
    expect(parks[0]?.type).toBe('park');
  });

  it('includes a calculated distance on each park', async () => {
    mockFetch.mockReturnValueOnce(makeOkResponse([
      {
        type: 'node',
        id: 6,
        lat: 33.75,
        lon: -84.39,
        tags: { name: 'Near Park', leisure: 'park' },
      },
    ]));

    const parks = await OverpassProvider.searchNearby(33.749, -84.388, 3000);
    expect(typeof parks[0]?.distance).toBe('number');
    expect(parks[0]?.distance).toBeGreaterThan(0);
    expect(typeof parks[0]?.distanceFormatted).toBe('string');
  });

  it('throws when the API returns a non-ok response', async () => {
    mockFetch.mockReturnValueOnce(
      Promise.resolve({ ok: false, status: 429, statusText: 'Too Many Requests' })
    );
    await expect(OverpassProvider.searchNearby(33.749, -84.388, 3000))
      .rejects.toThrow('Failed to fetch parks');
  });

  it('throws when fetch itself rejects (network error)', async () => {
    mockFetch.mockRejectedValueOnce(new Error('Network failure'));
    await expect(OverpassProvider.searchNearby(33.749, -84.388, 3000))
      .rejects.toThrow('Failed to fetch parks');
  });
});
