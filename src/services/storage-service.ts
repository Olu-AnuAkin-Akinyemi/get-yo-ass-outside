/**
 * Storage Service
 * Typed localStorage wrapper with TTL support
 */

/// <reference types="vite/client" />

import type { UserLocation } from '@/types';

// Debug mode
const DEBUG = import.meta.env.DEV;

// Storage keys
const STORAGE_KEYS = {
  USER_LOCATION: 'gyao_user_location',
  LAST_PROMPT_INDEX: 'gyao_last_prompt',
  THEME_PREFERENCE: 'gyao_theme',
  PARKS_CACHE: 'gyao_parks_cache',
  PARKS_CACHE_TIMESTAMP: 'gyao_parks_cache_ts',
} as const;

// Default TTL: 1 hour
const DEFAULT_LOCATION_TTL = 60 * 60 * 1000;

interface StorageItem<T> {
  value: T;
  expiresAt: number | null;
}

/**
 * Storage Service
 * Static methods for typed localStorage operations
 */
export class StorageService {
  /**
   * Get item from localStorage with type safety
   * @param key - Storage key
   * @returns Value or null if not found/expired
   */
  static get<T>(key: string): T | null {
    try {
      const stored = localStorage.getItem(key);
      if (!stored) return null;

      const parsed: unknown = JSON.parse(stored);

      // Validate structure before casting
      if (!parsed || typeof parsed !== 'object' || !('value' in parsed)) {
        this.remove(key);
        return null;
      }

      const item = parsed as StorageItem<T>;

      // Check if expired
      if (item.expiresAt && Date.now() > item.expiresAt) {
        this.remove(key);
        return null;
      }

      return item.value;
    } catch (error) {
      if (DEBUG) console.error(`Failed to get ${key} from localStorage:`, error);
      return null;
    }
  }

  /**
   * Set item in localStorage with optional TTL
   * @param key - Storage key
   * @param value - Value to store
   * @param ttlMs - Time to live in milliseconds (optional)
   */
  static set<T>(key: string, value: T, ttlMs?: number): void {
    try {
      const item: StorageItem<T> = {
        value,
        expiresAt: ttlMs ? Date.now() + ttlMs : null,
      };
      localStorage.setItem(key, JSON.stringify(item));
    } catch (error) {
      if (DEBUG) console.error(`Failed to set ${key} in localStorage:`, error);
    }
  }

  /**
   * Remove item from localStorage
   * @param key - Storage key
   */
  static remove(key: string): void {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      if (DEBUG) console.error(`Failed to remove ${key} from localStorage:`, error);
    }
  }

  /**
   * Get user location (convenience method)
   * @returns User location or null if not found/expired
   */
  static getLocation(): UserLocation | null {
    return this.get<UserLocation>(STORAGE_KEYS.USER_LOCATION);
  }

  /**
   * Set user location with default TTL (convenience method)
   * @param location - User location
   * @param ttlMs - Time to live in milliseconds (default: 1 hour)
   */
  static setLocation(location: UserLocation, ttlMs = DEFAULT_LOCATION_TTL): void {
    this.set(STORAGE_KEYS.USER_LOCATION, location, ttlMs);
  }

  /**
   * Clear user location (convenience method)
   */
  static clearLocation(): void {
    this.remove(STORAGE_KEYS.USER_LOCATION);
  }

  /**
   * Get theme preference
   * @returns Theme preference or null
   */
  static getTheme(): 'light' | 'dark' | null {
    return this.get<'light' | 'dark'>(STORAGE_KEYS.THEME_PREFERENCE);
  }

  /**
   * Set theme preference
   * @param theme - 'light' or 'dark'
   */
  static setTheme(theme: 'light' | 'dark'): void {
    this.set(STORAGE_KEYS.THEME_PREFERENCE, theme);
  }
}
