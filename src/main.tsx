import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { HelmetProvider } from 'react-helmet-async'
import App from './App.tsx'
import './index.css'

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <HelmetProvider>
      <App />
    </HelmetProvider>
  </StrictMode>
);

// VitePWA handles service worker registration automatically via registerType: 'autoUpdate'
// The combined SW in src/sw.ts includes both Workbox caching AND push notification handlers

// Log registered service workers for debugging
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.getRegistrations().then((registrations) => {
    console.log('[App] Service workers registered:', registrations.length);
    for (const registration of registrations) {
      console.log('[App] SW scope:', registration.scope, 'script:', registration.active?.scriptURL);
    }
  });
}
