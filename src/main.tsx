import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Register PWA service worker for clean home screen / desktop installation
try {
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      try {
        navigator.serviceWorker.register('/sw.js?v=12')
          .then((reg) => {
            console.log('Mimbar Digital Pro Service Worker registered with scope: ', reg.scope);
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

