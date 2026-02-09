/**
 * Get Yo A$$ Outside
 * Main application entry point
 */

// CSS imports
import '@/css/variables.css';
import '@/css/main.css';

// Module imports (uncomment as implemented)
// import { initVoice } from '@/modules/voice';
// import { initGeolocation } from '@/modules/geolocation';
// import { initUI } from '@/modules/ui';

/**
 * Initialize the application
 */
const init = (): void => {
  console.log('🌳 Get Yo A$$ Outside - Initializing...');
  
  // TODO: Initialize modules
  // initUI();
  // initVoice();
  // initGeolocation();
  
  console.log('✅ App initialized');
};

// Run on DOM ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
