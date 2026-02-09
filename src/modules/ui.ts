/**
 * UI Module
 * Handles view rendering and DOM manipulation
 */

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
const handleFindParksClick = (): void => {
  if (DEBUG) console.log('🔍 Find parks clicked');
  // TODO: Implement geolocation and render results view
  alert('Geolocation feature coming next! 🌳');
};

/**
 * Render the results view (placeholder for Phase 2)
 */
export const renderResultsView = (parks: unknown[]): void => {
  const app = document.querySelector<HTMLDivElement>('#app');
  
  if (!app) return;

  // View switching with innerHTML
  app.innerHTML = `
    <main class="main-container">
      <section class="results">
        <h1>Parks Near You</h1>
        <!-- Park cards will go here -->
      </section>
      
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
 * Show loading state
 */
export const showLoading = (): void => {
  const findParksBtn = document.querySelector<HTMLButtonElement>('#find-parks-btn');
  const btnText = findParksBtn?.querySelector<HTMLSpanElement>('.btn__text');
  
  if (findParksBtn && btnText) {
    findParksBtn.disabled = true;
    btnText.textContent = 'Finding parks...'; // textContent for text update
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
 * Escape HTML to prevent XSS when using innerHTML
 * @param text - Text to escape
 * @returns HTML-safe string
 */
const escapeHtml = (text: string): string => {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
};
