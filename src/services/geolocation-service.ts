/**
 * Geolocation Service
 * Browser geolocation API wrapper with caching
 */

/// <reference types="vite/client" />

import type { UserLocation, GeolocationConfig, GeolocationError } from '@/types';
import { StorageService } from '@/services/storage-service';

// Debug mode
const DEBUG = import.meta.env.DEV;

// Default geolocation configuration
const DEFAULT_CONFIG: GeolocationConfig = {
  enableHighAccuracy: true,
  timeout: 10000, // 10 seconds
  maximumAge: 300000, // 5 minutes (browser-level cache)
};

/**
 * Geolocation Service
 * Static methods for browser geolocation with caching
 */
export class GeolocationService {
  /**
   * Request current position from browser
   * @param config - Optional geolocation configuration
   * @returns Promise with user location
   * @throws GeolocationError
   */
  private static requestPosition(
    config: Partial<GeolocationConfig> = {}
  ): Promise<UserLocation> {
    return new Promise((resolve, reject) => {
      // Check if geolocation is supported
      if (!navigator.geolocation) {
        const error: GeolocationError = {
          code: 2, // POSITION_UNAVAILABLE
          message: 'Geolocation is not supported by this browser',
          userFriendlyMessage:
            "Your browser doesn't support location services. Try using a different browser.",
        };
        reject(error);
        return;
      }

      const options = { ...DEFAULT_CONFIG, ...config };

      if (DEBUG) console.log('📍 Requesting location with options:', options);

      navigator.geolocation.getCurrentPosition(
        (position) => {
          const location: UserLocation = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy,
            timestamp: Date.now(),
          };

          // Save to cache
          StorageService.setLocation(location);

          if (DEBUG) console.log('✅ Location obtained:', location);
          resolve(location);
        },
        (error) => {
          const geoError = this.handleError(error);
          if (DEBUG) console.error('❌ Geolocation error:', geoError);
          reject(geoError);
        },
        options
      );
    });
  }

  /**
   * Get current position (from cache or fresh request)
   * @param forceRefresh - If true, always request fresh location
   * @returns Promise with user location
   * @throws GeolocationError
   */
  static async getCurrentPosition(forceRefresh = false): Promise<UserLocation> {
    if (!forceRefresh) {
      const cachedLocation = StorageService.getLocation();
      if (cachedLocation) {
        if (DEBUG) console.log('📍 Using cached location:', cachedLocation);
        return cachedLocation;
      }
    }

    return this.requestPosition();
  }

  /**
   * Get cached position without requesting new one
   * @returns Cached location or null
   */
  static getCachedPosition(): UserLocation | null {
    return StorageService.getLocation();
  }

  /**
   * Check actual browser permission state for geolocation
   * Falls back to null if Permissions API is unavailable
   * @returns Permission state or null if API unavailable
   */
  static async checkPermission(): Promise<'granted' | 'denied' | 'prompt' | null> {
    try {
      if (!navigator.permissions) {
        return null;
      }
      const result = await navigator.permissions.query({ name: 'geolocation' });
      return result.state;
    } catch {
      return null;
    }
  }

  /**
   * Check if user has cached location data
   * @returns Whether cached location exists
   */
  static hasCachedLocation(): boolean {
    return StorageService.getLocation() !== null;
  }

  /**
   * Handle geolocation errors and convert to user-friendly messages
   * @param error - GeolocationPositionError from browser
   * @returns Formatted error object
   */
  private static handleError(error: GeolocationPositionError): GeolocationError {
    switch (error.code) {
      case error.PERMISSION_DENIED:
        return {
          code: 1,
          message: 'User denied the request for Geolocation',
          userFriendlyMessage:
            'Location access denied. We need your location to find parks nearby.',
        };

      case error.POSITION_UNAVAILABLE:
        return {
          code: 2,
          message: 'Location information is unavailable',
          userFriendlyMessage: 'Unable to get your location. Check your device settings.',
        };

      case error.TIMEOUT:
        return {
          code: 3,
          message: 'The request to get user location timed out',
          userFriendlyMessage: 'Location request timed out. Please try again.',
        };

      default:
        return {
          code: 2,
          message: 'An unknown error occurred',
          userFriendlyMessage: 'Something went wrong. Please try again.',
        };
    }
  }
}
