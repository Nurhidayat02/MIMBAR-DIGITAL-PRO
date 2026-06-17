import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Register PWA service worker for clean home screen / desktop installation
if ('serviceWorker' in navigator && process.env.NODE_ENV === 'production') {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then((reg) => {
        console.log('Mimbar Digital Pro Service Worker registered with scope: ', reg.scope);
      })
      .catch((err) => {
        console.error('Service worker registration failed: ', err);
      });
  });
} else if ('serviceWorker' in navigator) {
  // Also register in development to ensure installation prompts work in the dev environment
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then((reg) => {
        console.log('Mimbar Digital Pro SW (Dev mode) registered: ', reg.scope);
      })
      .catch((err) => {
        console.error('Service worker registration failed: ', err);
      });
  });
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);

