/**
 * Park Service
 * Public API for park discovery (provider-agnostic)
 */

/// <reference types="vite/client" />

import type { Park, UserLocation } from '@/types';
import { OverpassProvider } from '@/services/overpass-provider';
import { StorageService } from '@/services/storage-service';

// Debug mode
const DEBUG = import.meta.env.DEV;

// Default search options
const DEFAULT_RADIUS_METERS = 3000; // ~1.86 miles
const DEFAULT_LIMIT = 5;

// Cache settings
const PARKS_CACHE_TTL = 5 * 60 * 1000; // 5 minutes
// Advisory only — not enforced as a hard gate. The coordinate-based cache (5-min TTL)
// and geolocation cache (1-hr TTL) already prevent redundant API calls in practice.
// TODO: Enforce as a hard cooldown before deployment if Overpass rate-limiting becomes an issue.
const MIN_QUERY_INTERVAL = 30_000; // 30 seconds

interface FindParksOptions {
  radiusMeters?: number;
  limit?: number;
}

export interface FindParksResult {
  parks: Park[];
  fromCache: boolean;
}

/**
 * Park Service
 * Orchestrates park discovery with sorting, limiting, and caching
 */
export class ParkService {
  /** Timestamp of the last successful API query */
  private static lastQueryTimestamp = 0;

  /**
   * Generate a cache key based on rounded coordinates
   * Rounds to ~100m precision to avoid cache misses from GPS jitter
   */
  private static getCacheKey(location: UserLocation, radiusMeters: number): string {
    const lat = location.latitude.toFixed(3);
    const lon = location.longitude.toFixed(3);
    return `gyao_parks_${lat}_${lon}_${radiusMeters}`;
  }

  /**
   * Find nearby parks sorted by distance
   * Results are cached for 5 minutes. Rapid repeated queries return cached data.
   * @param location - User location
   * @param options - Search options (radius, limit)
   * @returns Promise with parks and cache status
   */
  static async findNearbyParks(
    location: UserLocation,
    options: FindParksOptions = {}
  ): Promise<FindParksResult> {
    const { radiusMeters = DEFAULT_RADIUS_METERS, limit = DEFAULT_LIMIT } = options;
    const cacheKey = this.getCacheKey(location, radiusMeters);

    if (DEBUG) {
      console.log('🔍 Finding parks near location:', location);
    }

    // Check cache first (StorageService handles TTL expiry)
    const cached = StorageService.get<Park[]>(cacheKey);
    if (cached) {
      const withinCooldown = Date.now() - this.lastQueryTimestamp < MIN_QUERY_INTERVAL;
      if (DEBUG) {
        console.log(`📦 Returning ${cached.length} parks from cache${withinCooldown ? ' (cooldown active)' : ''}`);
      }
      return { parks: cached.slice(0, limit), fromCache: true };
    }

    try {
      // Query provider
      const parks = await OverpassProvider.searchNearby(
        location.latitude,
        location.longitude,
        radiusMeters
      );

      // Sort by distance (closest first) and limit results
      const sortedParks = parks.sort((a, b) => a.distance - b.distance).slice(0, limit);

      // Cache results with TTL
      StorageService.set(cacheKey, sortedParks, PARKS_CACHE_TTL);
      this.lastQueryTimestamp = Date.now();

      if (DEBUG) {
        console.log(`✅ Returning ${sortedParks.length} parks (fresh from API)`);
      }

      return { parks: sortedParks, fromCache: false };
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown park service error';
      if (DEBUG) console.error('❌ Park service error:', error);
      throw new Error(`Park discovery failed: ${message}`);
    }
  }
}
