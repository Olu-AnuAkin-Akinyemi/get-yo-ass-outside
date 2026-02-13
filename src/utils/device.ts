/**
 * Device Detection Utility
 * Detects platform to show context-appropriate UI instructions
 */

export type Platform = 'ios' | 'android' | 'desktop';

/**
 * Detect the user's platform using User Agent + touch capability.
 * User Agent is the primary signal; touch support is a secondary fallback.
 * @returns Detected platform
 */
export const detectPlatform = (): Platform => {
  const ua = navigator.userAgent;

  // iOS: iPhone, iPad, iPod — also catch iPad on iOS 13+ which reports as Mac
  if (/iPhone|iPod/i.test(ua) || (/iPad/i.test(ua)) || (/Macintosh/i.test(ua) && 'ontouchend' in document)) {
    return 'ios';
  }

  // Android
  if (/Android/i.test(ua)) {
    return 'android';
  }

  return 'desktop';
};

/**
 * Get platform-specific instructions for enabling location access
 * @param platform - Detected platform
 * @returns HTML string with step-by-step instructions
 */
export const getLocationPermissionHelp = (platform: Platform): string => {
  switch (platform) {
    case 'ios':
      return `
        To enable location on iOS:
        <br>1. Open <strong>Settings</strong> on your device
        <br>2. Scroll down and tap <strong>Safari</strong> (or your browser)
        <br>3. Tap <strong>Location</strong> and select <strong>Allow</strong>
        <br>4. Come back here and tap <strong>Try Again</strong>
      `;

    case 'android':
      return `
        To enable location on Android:
        <br>1. Tap the <strong>lock icon</strong> in your browser's address bar
        <br>2. Tap <strong>Permissions</strong> → <strong>Location</strong> → <strong>Allow</strong>
        <br>3. Or go to <strong>Settings</strong> → <strong>Site Settings</strong> → <strong>Location</strong>
        <br>4. Come back here and tap <strong>Try Again</strong>
      `;

    case 'desktop':
      return `
        To enable location access:
        <br>• Look for the <strong>location icon</strong> in the address bar and click <strong>Allow</strong>
        <br>• Or check your browser's site settings for location permissions
      `;
  }
};
