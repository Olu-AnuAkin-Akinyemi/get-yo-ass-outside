import { ParkService } from './park-service';
import { OverpassProvider } from './overpass-provider';
import { StorageService } from './storage-service';
import type { Park } from '@/types';

vi.mock('./overpass-provider');
vi.mock('./storage-service');

const mockLocation = {
  latitude: 33.749,
  longitude: -84.388,
  accuracy: 10,
  timestamp: Date.now(),
};

const mockParks: Park[] = [
  {
    id: 'way-1',
    name: 'Far Park',
    type: 'park',
    coordinates: { latitude: 33.76, longitude: -84.40 },
    distance: 1.5,
    distanceFormatted: '1.5 miles',
  },
  {
    id: 'way-2',
    name: 'Close Park',
    type: 'park',
    coordinates: { latitude: 33.751, longitude: -84.389 },
    distance: 0.3,
    distanceFormatted: '0.3 miles',
  },
];

beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(StorageService.get).mockReturnValue(null);
  vi.mocked(StorageService.set).mockImplementation(() => {});
  vi.mocked(OverpassProvider.searchNearby).mockResolvedValue([...mockParks]);
});

describe('ParkService.findNearbyParks', () => {
  it('returns parks sorted by distance, closest first', async () => {
    const { parks } = await ParkService.findNearbyParks(mockLocation);
    expect(parks[0]?.name).toBe('Close Park');
    expect(parks[1]?.name).toBe('Far Park');
  });

  it('returns fromCache: false on a fresh API fetch', async () => {
    const { fromCache } = await ParkService.findNearbyParks(mockLocation);
    expect(fromCache).toBe(false);
  });

  it('returns cached results without calling the API', async () => {
    vi.mocked(StorageService.get).mockReturnValue(mockParks);
    const { parks, fromCache } = await ParkService.findNearbyParks(mockLocation);
    expect(fromCache).toBe(true);
    expect(OverpassProvider.searchNearby).not.toHaveBeenCalled();
    expect(parks.length).toBeGreaterThan(0);
  });

  it('respects the limit option', async () => {
    const manyParks: Park[] = Array.from({ length: 10 }, (_, i) => ({
      ...mockParks[0]!,
      id: `way-${i}`,
      distance: i * 0.1,
    }));
    vi.mocked(OverpassProvider.searchNearby).mockResolvedValue(manyParks);
    const { parks } = await ParkService.findNearbyParks(mockLocation, { limit: 3 });
    expect(parks).toHaveLength(3);
  });

  it('caches results after a fresh fetch', async () => {
    await ParkService.findNearbyParks(mockLocation);
    expect(StorageService.set).toHaveBeenCalledOnce();
  });

  it('throws a descriptive error when the provider fails', async () => {
    vi.mocked(OverpassProvider.searchNearby).mockRejectedValue(new Error('Network error'));
    await expect(ParkService.findNearbyParks(mockLocation))
      .rejects.toThrow('Park discovery failed');
  });
});
