/**
 * Get Yo A$$ Outside
 * Main application entry point
 */

/// <reference types="vite/client" />

// CSS imports
import '@/css/variables.css';
import '@/css/main.css';

// Module imports
import { initUI } from '@/modules/ui';

// Debug mode
const DEBUG = import.meta.env.DEV;

/**
 * Initialize the application
 */
const init = (): void => {
  if (DEBUG) console.log('🌳 Get Yo A$$ Outside - Initializing...');
  
  // Initialize UI and render the app
  initUI();
  
  if (DEBUG) console.log('✅ App initialized');
};

// Run on DOM ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
