/**
 * Overpass Provider
 * OpenStreetMap Overpass API integration for park data
 */

/// <reference types="vite/client" />

import type { Park, ParkType, OverpassResponse, OverpassElement, Coordinates } from '@/types';
import { calculateDistance, formatDistance } from '@/utils/distance';

// Debug mode
const DEBUG = import.meta.env.DEV;

// Overpass API endpoint
const OVERPASS_API_URL = 'https://overpass-api.de/api/interpreter';

/**
 * Overpass Provider
 * Handles Overpass API queries and response transformation
 */
export class OverpassProvider {
  /**
   * Build Overpass query for parks near coordinates
   * @param lat - Latitude
   * @param lon - Longitude
   * @param radiusMeters - Search radius in meters
   * @returns Overpass QL query string
   */
  private static buildQuery(lat: number, lon: number, radiusMeters: number): string {
    return `
      [out:json][timeout:25];
      (
        node["leisure"="park"](around:${radiusMeters},${lat},${lon});
        way["leisure"="park"](around:${radiusMeters},${lat},${lon});
        node["leisure"="nature_reserve"](around:${radiusMeters},${lat},${lon});
        way["leisure"="nature_reserve"](around:${radiusMeters},${lat},${lon});
        node["leisure"="garden"](around:${radiusMeters},${lat},${lon});
        way["leisure"="garden"](around:${radiusMeters},${lat},${lon});
      );
      out center;
    `;
  }

  /**
   * Transform Overpass element to Park object
   * @param element - Overpass API element
   * @param userLocation - User's coordinates for distance calculation
   * @returns Park object or null if invalid
   */
  private static transformElement(
    element: OverpassElement,
    userLocation: Coordinates
  ): Park | null {
    // Extract coordinates (handle both node and way types)
    const lat = element.lat ?? element.center?.lat;
    const lon = element.lon ?? element.center?.lon;

    // Validate coordinates exist (use == null to allow valid 0 values at equator/prime meridian)
    if (lat == null || lon == null) {
      if (DEBUG) console.warn('Element missing coordinates:', element);
      return null;
    }

    // Extract and validate tags
    const name = element.tags?.name ?? `Unnamed ${element.tags?.leisure || 'Park'}`;
    const leisureTag = element.tags?.leisure;

    // Validate park type
    const validTypes: ParkType[] = ['park', 'nature_reserve', 'garden'];
    const parkType: ParkType = validTypes.includes(leisureTag as ParkType)
      ? (leisureTag as ParkType)
      : 'park';

    // Calculate distance
    const parkCoords: Coordinates = { latitude: lat, longitude: lon };
    const distance = calculateDistance(userLocation, parkCoords);

    return {
      id: `${element.type}-${element.id}`,
      name,
      type: parkType,
      coordinates: parkCoords,
      distance,
      distanceFormatted: formatDistance(distance),
    };
  }

  /**
   * Search for parks near coordinates
   * @param lat - Latitude
   * @param lon - Longitude
   * @param radiusMeters - Search radius in meters (default: 3000)
   * @returns Promise with array of parks
   */
  static async searchNearby(
    lat: number,
    lon: number,
    radiusMeters = 3000
  ): Promise<Park[]> {
    const query = this.buildQuery(lat, lon, radiusMeters);

    if (DEBUG) {
      console.log('🌐 Querying Overpass API:', { lat, lon, radiusMeters });
    }

    try {
      const response = await fetch(OVERPASS_API_URL, {
        method: 'POST',
        body: `data=${encodeURIComponent(query)}`,
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        signal: AbortSignal.timeout(30000), // 30 second timeout
      });

      if (!response.ok) {
        throw new Error(`Overpass API error: ${response.status} ${response.statusText}`);
      }

      const data = (await response.json()) as OverpassResponse;

      if (DEBUG) {
        console.log(`✅ Overpass API returned ${data.elements.length} elements`);
      }

      // Transform and filter elements
      const userLocation: Coordinates = { latitude: lat, longitude: lon };
      const parks = data.elements
        .map((element) => this.transformElement(element, userLocation))
        .filter((park): park is Park => park !== null);

      if (DEBUG) {
        console.log(`✅ Transformed to ${parks.length} valid parks`);
      }

      return parks;
    } catch (error) {
      if (DEBUG) console.error('❌ Overpass API error:', error);
      throw new Error(
        error instanceof Error
          ? `Failed to fetch parks: ${error.message}`
          : 'Failed to fetch parks from Overpass API'
      );
    }
  }
}
