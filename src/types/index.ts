/**
 * Get Yo A$$ Outside
 * TypeScript Type Definitions
 */

// ============================================
// User Location
// ============================================

export interface Coordinates {
  latitude: number;
  longitude: number;
}

export interface UserLocation extends Coordinates {
  accuracy: number;
  timestamp: number;
}

// ============================================
// Parks
// ============================================

export type ParkType = 'park' | 'nature_reserve' | 'garden' | 'trail' | 'recreation_ground';

export interface Park {
  id: string;
  name: string;
  type: ParkType;
  coordinates: Coordinates;
  distance: number; // in miles
  distanceFormatted: string; // "0.3 miles"
}

// ============================================
// Overpass API
// ============================================

export interface OverpassResponse {
  version: number;
  generator: string;
  elements: OverpassElement[];
}

export interface OverpassElement {
  type: 'node' | 'way' | 'relation';
  id: number;
  lat?: number;
  lon?: number;
  center?: {
    lat: number;
    lon: number;
  };
  tags?: {
    name?: string;
    leisure?: string;
    [key: string]: string | undefined;
  };
}

// ============================================
// App State
// ============================================

export type AppStatus = 'idle' | 'loading' | 'success' | 'error';

export interface AppState {
  status: AppStatus;
  locationGranted: boolean;
  userLocation: UserLocation | null;
  parks: Park[];
  currentPromptIndex: number;
  error: string | null;
  theme: 'light' | 'dark';
}

// ============================================
// Voice Prompts
// ============================================

export interface VoicePrompt {
  id: string;
  text: string;
  category: 'firm' | 'encouraging' | 'humorous';
}

// ============================================
// Storage
// ============================================

export interface StorageKeys {
  USER_LOCATION: 'gyao_user_location';
  LAST_PROMPT_INDEX: 'gyao_last_prompt';
  THEME_PREFERENCE: 'gyao_theme';
  PARKS_CACHE: 'gyao_parks_cache';
  PARKS_CACHE_TIMESTAMP: 'gyao_parks_cache_ts';
}

// ============================================
// Geolocation
// ============================================

export interface GeolocationConfig {
  enableHighAccuracy: boolean;
  timeout: number;
  maximumAge: number;
}

export type GeolocationErrorCode = 1 | 2 | 3; // PERMISSION_DENIED | POSITION_UNAVAILABLE | TIMEOUT
