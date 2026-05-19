/**
 * UI Module
 * Handles view rendering and DOM manipulation
 */

/// <reference types="vite/client" />

import { getRandomPrompt } from '@/modules/voice';
import { detectPlatform, getLocationPermissionHelp } from '@/utils/device';
import { StorageService } from '@/services/storage-service';

// Debug mode (only log in development)
const DEBUG = import.meta.env.DEV;

/**
 * Initialize the UI and render the prompt view
 */
export const initUI = (): void => {
  initTheme();
  renderSkipLink();
  renderHeader();
  renderPromptView();
};

/**
 * Render keyboard skip link once at startup
 */
const renderSkipLink = (): void => {
  const existingSkipLink = document.querySelector('.skip-link');
  if (existingSkipLink) return;

  const skipLink = document.createElement('a');
  skipLink.className = 'skip-link';
  skipLink.href = '#main-content';
  skipLink.textContent = 'Skip to main content';
  document.body.prepend(skipLink);
};

/**
 * Initialize theme from storage or default to light
 */
const initTheme = (): void => {
  const savedTheme = StorageService.getTheme();
  // Default to light mode if no preference saved
  document.documentElement.setAttribute('data-theme', savedTheme ?? 'light');
};

/**
 * Toggle between light and dark themes
 */
const toggleTheme = (): void => {
  const currentTheme = document.documentElement.getAttribute('data-theme');
  const prefersLight = window.matchMedia('(prefers-color-scheme: light)').matches;
  
  let newTheme: 'light' | 'dark';
  
  if (currentTheme === 'light') {
    newTheme = 'dark';
  } else if (currentTheme === 'dark') {
    newTheme = 'light';
  } else {
    // No explicit theme set — toggle away from system preference
    newTheme = prefersLight ? 'dark' : 'light';
  }
  
  document.documentElement.setAttribute('data-theme', newTheme);
  StorageService.setTheme(newTheme);
  
  if (DEBUG) console.log(`\ud83c\udf19 Theme switched to: ${newTheme}`);
};

/**
 * Render the app header with theme toggle
 */
const renderHeader = (): void => {
  const existingHeader = document.querySelector('.app-header');
  if (existingHeader) return;
  
  const header = document.createElement('header');
  header.className = 'app-header';
  header.innerHTML = `
    <div class="app-header__brand">
      <span class="app-header__logo">\ud83c\udf33</span>
      <span>Get Outside</span>
    </div>
    <div class="app-header__actions">
      <button class="icon-btn" type="button" id="theme-toggle-btn" aria-label="Toggle theme">
        <span class="theme-toggle__icon--light">\u2600\ufe0f</span>
        <span class="theme-toggle__icon--dark">\ud83c\udf19</span>
      </button>
      <button class="icon-btn" type="button" id="refresh-prompt-btn" aria-label="New prompt">
        \ud83d\udd04
      </button>
    </div>
  `;
  
  document.body.prepend(header);
  
  const themeToggle = header.querySelector<HTMLButtonElement>('#theme-toggle-btn');
  const refreshBtn = header.querySelector<HTMLButtonElement>('#refresh-prompt-btn');
  
  if (themeToggle) {
    themeToggle.addEventListener('click', toggleTheme);
  }
  
  if (refreshBtn) {
    refreshBtn.addEventListener('click', updatePrompt);
  }
};

/**
 * Render the main prompt view
 */
const renderPromptView = (): void => {
  const app = document.querySelector<HTMLDivElement>('#app');
  
  if (!app) {
    console.error('❌ #app element not found');
    return;
  }

  // Get a prompt from The Voice
  const prompt = getRandomPrompt();

  // Render the prompt view (innerHTML is appropriate here for view switching)
  app.innerHTML = `
    <main class="main-container" id="main-content" tabindex="-1">
      <section class="hero">
        <div class="prompt-card glass-card">
          <p class="prompt-card__eyebrow">The Voice says:</p>
          <p class="prompt-card__text" role="status" aria-live="polite" id="prompt-text">
            ${escapeHtml(prompt)}
          </p>
          <p class="prompt-card__support">Fresh air and a short walk can reset your whole day.</p>
        </div>
      </section>

      <section class="permission-panel glass-card" aria-labelledby="permission-panel-title">
        <h2 class="permission-panel__title" id="permission-panel-title">Ready to find nearby parks?</h2>
        <p class="permission-panel__body">Share your location so we can show walkable options near you. No location, no park map.</p>
      </section>
      
      <section class="actions">
        <!-- Animated Button with accessible SVGs -->
        <button class="animated-button" type="button" id="find-parks-btn">
          <svg viewBox="0 0 24 24" class="arr-2" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
            <path d="M16.1716 10.9999L10.8076 5.63589L12.2218 4.22168L20 11.9999L12.2218 19.778L10.8076 18.3638L16.1716 12.9999H4V10.9999H16.1716Z"></path>
          </svg>
          <span class="text">Use My Location</span>
          <span class="circle"></span>
          <svg viewBox="0 0 24 24" class="arr-1" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
            <path d="M16.1716 10.9999L10.8076 5.63589L12.2218 4.22168L20 11.9999L12.2218 19.778L10.8076 18.3638L16.1716 12.9999H4V10.9999H16.1716Z"></path>
          </svg>
        </button>

        <button class="btn btn--secondary" type="button" id="new-prompt-btn">
          <span class="btn__text">Hit Me With Another Prompt</span>
        </button>
      </section>
    </main>
  `;

  // Attach event listeners after rendering
  attachPromptViewListeners();
  focusMainContent();
  
  if (DEBUG) console.log('✅ Prompt view rendered');
};

/**
 * Attach event listeners for the prompt view
 */
const attachPromptViewListeners = (): void => {
  const findParksBtn = document.querySelector<HTMLButtonElement>('#find-parks-btn');
  const newPromptBtn = document.querySelector<HTMLButtonElement>('#new-prompt-btn');
  
  if (findParksBtn) {
    findParksBtn.addEventListener('click', handleFindParksClick);
  }

  if (newPromptBtn) {
    newPromptBtn.addEventListener('click', updatePrompt);
  }
};

/**
 * Handle click on "Find Parks Near Me" or "Try Again" button
 */
const handleFindParksClick = async (event: MouseEvent): Promise<void> => {
  if (DEBUG) console.log('🔍 Find parks clicked');

  const btn = (event.currentTarget as HTMLButtonElement) ?? null;

  // Show loading state on whichever button triggered this
  showLoading(btn);
  renderLoadingView();

  try {
    // Import services
    const { GeolocationService } = await import('@/services/geolocation-service');
    const { ParkService } = await import('@/services/park-service');

    // Get location
    const location = await GeolocationService.getCurrentPosition();

    if (DEBUG) console.log('📍 Location obtained:', location);

    // Fetch nearby parks
    const { parks, fromCache } = await ParkService.findNearbyParks(location);

    if (DEBUG) console.log(`🌳 Found ${parks.length} parks${fromCache ? ' (from cache)' : ''}`);

    // Hide loading and render results
    hideLoading(btn);
    renderResultsView(parks);

    // Show friendly cache notification if results came from cache
    if (fromCache) {
      showCacheNotice();
    }

  } catch (error) {
    hideLoading(btn);

    // Type guard to distinguish GeolocationError from generic errors
    const isGeoError = (e: unknown): e is import('@/types').GeolocationError =>
      typeof e === 'object' && e !== null && 'userFriendlyMessage' in e;

    if (DEBUG) console.error('Error:', error);

    if (isGeoError(error)) {
      renderErrorView(error.userFriendlyMessage, error.code);
    } else {
      const message = error instanceof Error ? error.message : 'Something went wrong. Please try again.';
      renderErrorView(message, 2);
    }
  }
};

/**
 * Render the results view with park cards
 */
export const renderResultsView = (parks: import('@/types').Park[]): void => {
  const app = document.querySelector<HTMLDivElement>('#app');
  
  if (!app) return;

  // Check if we have parks
  const hasPark = parks.length > 0;

  app.innerHTML = `
    <main class="main-container" id="main-content" tabindex="-1">
      <section class="results-header">
        <h1 class="results-header__title">Parks Near You</h1>
        <p class="results-header__subtitle">${parks.length} park${parks.length === 1 ? '' : 's'} found</p>
      </section>
      
      ${hasPark ? `
        <ul class="parks-list" role="list">
          ${parks.map((park, index) => `
            <li class="park-card glass-card" style="--item-index: ${index};">
              <div class="park-card__header">
                <h2 class="park-card__name">
                  <span class="park-card__icon" aria-hidden="true">${getParkIcon(park.type)}</span>
                  ${escapeHtml(park.name)}
                </h2>
                <span class="park-card__distance">${escapeHtml(park.distanceFormatted)}</span>
              </div>
              <p class="park-card__type">${escapeHtml((park.type as string).replaceAll('_', ' '))}</p>
              <div class="park-card__actions">
                <a 
                  href="https://www.google.com/maps/dir/?api=1&destination=${park.coordinates.latitude},${park.coordinates.longitude}" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  class="park-card__link"
                  aria-label="Navigate to ${escapeHtml(park.name)} in Google Maps"
                >
                  Navigate \u2192
                </a>
              </div>
            </li>
          `).join('')}
        </ul>
      ` : `
        <section class="empty-state glass-card">
          <div class="empty-state__icon">\ud83c\udf33</div>
          <h2 class="empty-state__title">No parks nearby... yet</h2>
          <p class="empty-state__message">We couldn't find parks within walking distance. But that fresh air is still out there \u2014 maybe take a walk anyway?</p>
        </section>
      `}
      
      <section class="actions">
        <button class="btn btn--secondary" type="button" id="back-btn">
          <span class="btn__text">Back to Prompt</span>
        </button>
      </section>
    </main>
  `;
  
  // Attach listeners for this view
  const backBtn = document.querySelector<HTMLButtonElement>('#back-btn');
  if (backBtn) {
    backBtn.addEventListener('click', renderPromptView);
  }

  focusMainContent();
  
  if (DEBUG) console.log('✅ Results view rendered');
};

/**
 * Update the prompt text in the current view
 * Uses textContent for simple text updates
 */
export const updatePrompt = (): void => {
  const promptElement = document.querySelector<HTMLParagraphElement>('#prompt-text');
  
  if (promptElement) {
    const newPrompt = getRandomPrompt();
    promptElement.textContent = newPrompt; // textContent for text-only updates
  }
};

/**
 * Render error view
 */
const renderErrorView = (message: string, errorCode: number): void => {
  const app = document.querySelector<HTMLDivElement>('#app');
  
  if (!app) return;

  app.innerHTML = `
    <main class="main-container" id="main-content" tabindex="-1">
      <section class="error-view">
        <div class="error-card glass-card" role="alert" aria-live="assertive">
          <h1 class="error-card__title">Oops!</h1>
          <p class="error-card__message">${escapeHtml(message)}</p>
          ${errorCode === 1 ? `
            <p class="error-card__help">
              ${getLocationPermissionHelp(detectPlatform())}
            </p>
          ` : ''}
        </div>
      </section>
      
      <section class="actions">
        <!-- Retry Button (Animated) with accessible SVGs -->
        <button class="animated-button" type="button" id="retry-btn">
          <svg viewBox="0 0 24 24" class="arr-2" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
            <path d="M16.1716 10.9999L10.8076 5.63589L12.2218 4.22168L20 11.9999L12.2218 19.778L10.8076 18.3638L16.1716 12.9999H4V10.9999H16.1716Z"></path>
          </svg>
          <span class="text">Try Again</span>
          <span class="circle"></span>
          <svg viewBox="0 0 24 24" class="arr-1" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
            <path d="M16.1716 10.9999L10.8076 5.63589L12.2218 4.22168L20 11.9999L12.2218 19.778L10.8076 18.3638L16.1716 12.9999H4V10.9999H16.1716Z"></path>
          </svg>
        </button>
        
        <button class="btn btn--secondary" type="button" id="back-home-btn">
          <span class="btn__text">Back</span>
        </button>
      </section>
    </main>
  `;
  
  // Attach listeners
  const retryBtn = document.querySelector<HTMLButtonElement>('#retry-btn');
  const backBtn = document.querySelector<HTMLButtonElement>('#back-home-btn');
  
  if (retryBtn) {
    retryBtn.addEventListener('click', handleFindParksClick);
  }
  
  if (backBtn) {
    backBtn.addEventListener('click', renderPromptView);
  }

  focusMainContent();
  
  if (DEBUG) console.log('✅ Error view rendered');
};

/**
 * Show loading state on a button
 * Accepts an explicit button element, or falls back to #find-parks-btn
 */
export const showLoading = (btn?: HTMLButtonElement | null): void => {
  const target = btn ?? document.querySelector<HTMLButtonElement>('#find-parks-btn');
  const btnText = target?.querySelector<HTMLSpanElement>('.text, .btn__text');

  if (target && btnText) {
    target.dataset.originalLabel = btnText.textContent ?? 'Find Parks Near Me';
    target.disabled = true;
    target.classList.add('btn--loading');
    btnText.textContent = 'Finding parks...';
  }
};

/**
 * Hide loading state on a button
 * Accepts an explicit button element, or falls back to #find-parks-btn
 */
export const hideLoading = (btn?: HTMLButtonElement | null): void => {
  const target = btn ?? document.querySelector<HTMLButtonElement>('#find-parks-btn');
  const btnText = target?.querySelector<HTMLSpanElement>('.text, .btn__text');

  if (target && btnText) {
    target.disabled = false;
    target.classList.remove('btn--loading');
    btnText.textContent = target.dataset.originalLabel ?? 'Find Parks Near Me';
  }
};

/**
 * Render loading view with skeleton cards
 */
const renderLoadingView = (): void => {
  const app = document.querySelector<HTMLDivElement>('#app');
  if (!app) return;

  app.innerHTML = `
    <main class="main-container" id="main-content" tabindex="-1">
      <section class="results-header">
        <h1 class="results-header__title">Finding parks...</h1>
        <p class="results-header__subtitle" role="status" aria-live="polite">Hang tight while we check nearby options.</p>
      </section>

      <ul class="parks-list parks-list--loading" aria-hidden="true">
        <li class="park-card glass-card skeleton-card"></li>
        <li class="park-card glass-card skeleton-card"></li>
        <li class="park-card glass-card skeleton-card"></li>
      </ul>
    </main>
  `;

  focusMainContent();
};

/**
 * Show a friendly notice when results are served from cache
 * Auto-dismisses after 4 seconds
 */
const showCacheNotice = (): void => {
  const app = document.querySelector<HTMLDivElement>('#app');
  if (!app) return;

  const notice = document.createElement('div');
  notice.className = 'cache-notice toast toast--info';
  notice.setAttribute('role', 'status');
  notice.setAttribute('aria-live', 'polite');
  notice.innerHTML = `
    <p class="toast__text">Hold on now - we just checked! Here's what we found.</p>
    <button class="toast__close" type="button" aria-label="Dismiss notice">Close</button>
  `;
  app.prepend(notice);

  const closeBtn = notice.querySelector<HTMLButtonElement>('.toast__close');
  if (closeBtn) {
    closeBtn.addEventListener('click', () => {
      notice.classList.add('cache-notice--dismissed');
      setTimeout(() => notice.remove(), 250);
    });
  }

  // Auto-dismiss after 4 seconds
  setTimeout(() => {
    notice.classList.add('cache-notice--dismissed');
    setTimeout(() => notice.remove(), 300);
  }, 4000);
};

/**
 * Move keyboard focus to main content after a view switch
 */
const focusMainContent = (): void => {
  requestAnimationFrame(() => {
    const main = document.querySelector<HTMLElement>('#main-content');
    if (main) {
      main.focus();
    }
  });
};

/**
 * Escape HTML to prevent XSS when using innerHTML
 * @param text - Text to escape
 * @returns HTML-safe string
 */
const escapeHtml = (text: string): string => {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
};

/**
 * Get emoji icon for park type
 * @param type - Park type
 * @returns Emoji string
 */
const getParkIcon = (type: import('@/types').ParkType): string => {
  switch (type) {
    case 'park':
      return '\ud83c\udf33'; // 🌳
    case 'nature_reserve':
      return '\ud83c\udf3f'; // 🌿
    case 'garden':
      return '\ud83c\udf38'; // 🌸
    default:
      return '\ud83c\udf32'; // 🌲
  }
};
