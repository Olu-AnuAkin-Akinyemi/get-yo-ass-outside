/**
 * UI Module
 * Handles view rendering and DOM manipulation
 */

/// <reference types="vite/client" />

import { getRandomPrompt } from '@/modules/voice';

// Debug mode (only log in development)
const DEBUG = import.meta.env.DEV;

/**
 * Initialize the UI and render the prompt view
 */
export const initUI = (): void => {
  renderPromptView();
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
    <main class="main-container">
      <section class="hero">
        <div class="prompt-card glass-card">
          <p class="prompt-card__text" role="status" aria-live="polite" id="prompt-text">
            ${escapeHtml(prompt)}
          </p>
        </div>
      </section>
      
      <section class="actions">
        <button class="btn btn--primary" type="button" id="find-parks-btn">
          <span class="btn__text">Find Parks Near Me</span>
        </button>
      </section>
    </main>
  `;

  // Attach event listeners after rendering
  attachPromptViewListeners();
  
  if (DEBUG) console.log('✅ Prompt view rendered');
};

/**
 * Attach event listeners for the prompt view
 */
const attachPromptViewListeners = (): void => {
  const findParksBtn = document.querySelector<HTMLButtonElement>('#find-parks-btn');
  
  if (findParksBtn) {
    findParksBtn.addEventListener('click', handleFindParksClick);
  }
};

/**
 * Handle click on "Find Parks Near Me" button
 */
const handleFindParksClick = async (): Promise<void> => {
  if (DEBUG) console.log('🔍 Find parks clicked');
  
  // Show loading state
  showLoading();
  
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
    hideLoading();
    renderResultsView(parks);
    
    // Show friendly cache notification if results came from cache
    if (fromCache) {
      showCacheNotice();
    }
    
  } catch (error) {
    hideLoading();
    
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
    <main class="main-container">
      <section class="results-header">
        <h1 class="results-header__title">Parks Near You</h1>
        <p class="results-header__subtitle">${parks.length} park${parks.length === 1 ? '' : 's'} found</p>
      </section>
      
      ${hasPark ? `
        <section class="parks-list">
          ${parks.map((park) => `
            <div class="park-card glass-card">
              <div class="park-card__header">
                <h2 class="park-card__name">${escapeHtml(park.name)}</h2>
                <span class="park-card__distance">${escapeHtml(park.distanceFormatted)}</span>
              </div>
              <p class="park-card__type">${escapeHtml(park.type.replace('_', ' '))}</p>
              <div class="park-card__actions">
                <a 
                  href="https://www.google.com/maps/dir/?api=1&destination=${park.coordinates.latitude},${park.coordinates.longitude}" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  class="park-card__link"
                >
                  Get Directions →
                </a>
              </div>
            </div>
          `).join('')}
        </section>
      ` : `
        <section class="empty-state">
          <p class="empty-state__message">No parks found nearby. Try expanding your search area or check back later.</p>
        </section>
      `}
      
      <section class="actions">
        <button class="btn btn--secondary" type="button" id="back-btn">
          <span class="btn__text">Back</span>
        </button>
      </section>
    </main>
  `;
  
  // Attach listeners for this view
  const backBtn = document.querySelector<HTMLButtonElement>('#back-btn');
  if (backBtn) {
    backBtn.addEventListener('click', renderPromptView);
  }
  
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
    <main class="main-container">
      <section class="error-view">
        <div class="error-card glass-card">
          <h1 class="error-card__title">Oops!</h1>
          <p class="error-card__message">${escapeHtml(message)}</p>
          ${errorCode === 1 ? `
            <p class="error-card__help">
              To enable location access:
              <br>• Check your browser settings
              <br>• Look for the location icon in the address bar
            </p>
          ` : ''}
        </div>
      </section>
      
      <section class="actions">
        <button class="btn btn--primary" type="button" id="retry-btn">
          <span class="btn__text">Try Again</span>
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
  
  if (DEBUG) console.log('✅ Error view rendered');
};

/**
 * Show loading state
 */
export const showLoading = (): void => {
  const findParksBtn = document.querySelector<HTMLButtonElement>('#find-parks-btn');
  const btnText = findParksBtn?.querySelector<HTMLSpanElement>('.btn__text');
  
  if (findParksBtn && btnText) {
    findParksBtn.disabled = true;
    btnText.textContent = 'Getting your location...'; // Updated text
  }
};

/**
 * Hide loading state
 */
export const hideLoading = (): void => {
  const findParksBtn = document.querySelector<HTMLButtonElement>('#find-parks-btn');
  const btnText = findParksBtn?.querySelector<HTMLSpanElement>('.btn__text');
  
  if (findParksBtn && btnText) {
    findParksBtn.disabled = false;
    btnText.textContent = 'Find Parks Near Me'; // textContent for text update
  }
};

/**
 * Show a friendly notice when results are served from cache
 * Auto-dismisses after 4 seconds
 */
const showCacheNotice = (): void => {
  const app = document.querySelector<HTMLDivElement>('#app');
  if (!app) return;

  const notice = document.createElement('div');
  notice.className = 'cache-notice';
  notice.setAttribute('role', 'status');
  notice.setAttribute('aria-live', 'polite');
  notice.textContent = "Hold on now \u2014 we just checked! Here's what we found.";
  app.prepend(notice);

  // Auto-dismiss after 4 seconds
  setTimeout(() => {
    notice.classList.add('cache-notice--dismissed');
    setTimeout(() => notice.remove(), 300);
  }, 4000);
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
