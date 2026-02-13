/**
 * Distance Utility
 * Calculate distances between coordinates using Haversine formula
 */

import type { Coordinates } from '@/types';

// Earth's radius in miles
const EARTH_RADIUS_MILES = 3958.8;

/**
 * Calculate distance between two coordinates using Haversine formula
 * @param from - Starting coordinates
 * @param to - Ending coordinates
 * @returns Distance in miles
 */
export const calculateDistance = (from: Coordinates, to: Coordinates): number => {
  const toRadians = (degrees: number): number => (degrees * Math.PI) / 180;

  const lat1 = toRadians(from.latitude);
  const lat2 = toRadians(to.latitude);
  const deltaLat = toRadians(to.latitude - from.latitude);
  const deltaLon = toRadians(to.longitude - from.longitude);

  // Haversine formula
  const a =
    Math.sin(deltaLat / 2) * Math.sin(deltaLat / 2) +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(deltaLon / 2) * Math.sin(deltaLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return EARTH_RADIUS_MILES * c;
};

/**
 * Format distance in miles to human-readable string
 * @param miles - Distance in miles
 * @returns Formatted string (e.g., "0.3 miles", "1.2 miles")
 */
export const formatDistance = (miles: number): string => {
  if (miles < 0.1) {
    return '<0.1 miles';
  }
  
  const rounded = miles.toFixed(1);
  return `${rounded} mile${rounded === '1.0' ? '' : 's'}`;
};
