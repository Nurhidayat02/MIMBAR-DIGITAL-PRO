import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Register PWA service worker for clean home screen / desktop installation
try {
  if ('serviceWorker' in navigator) {
    // Reload the page when a new service worker takes over to apply instant changes
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      window.location.reload();
    });

    window.addEventListener('load', () => {
      try {
        navigator.serviceWorker.register('/sw.js')
          .then((reg) => {
            console.log('MIMBAR DIGITAL PRO Service Worker registered with scope: ', reg.scope);
            // Prompt service worker update check
            reg.update().catch(() => {});
          })
          .catch((err) => {
            console.warn('Service worker registration failed: ', err);
          });
      } catch (innerErr) {
        console.warn('Service worker registration synchronous exception:', innerErr);
      }
    });
  }
} catch (outerErr) {
  console.warn('Service worker check synchronous exception:', outerErr);
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);

