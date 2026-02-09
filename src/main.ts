/**
 * Get Yo A$$ Outside
 * Main application entry point
 */

// CSS imports
import '@/css/variables.css';
import '@/css/main.css';

// Module imports
import { initUI } from '@/modules/ui';

/**
 * Initialize the application
 */
const init = (): void => {
  console.log('🌳 Get Yo A$$ Outside - Initializing...');
  
  // Initialize UI and render the app
  initUI();
  
  console.log('✅ App initialized');
};

// Run on DOM ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
