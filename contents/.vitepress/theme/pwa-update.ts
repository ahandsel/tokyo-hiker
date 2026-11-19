/// <reference types="vite-plugin-pwa/vanillajs" />

import { showOfflineReadyToast } from './offline-ready-toast';

// The service worker answers every request from its precache, so the site opens
// instantly and works offline. The first time the precache is complete, a toast
// tells the reader so. With `registerType: 'autoUpdate'`, a new deploy installs in
// the background and the page reloads once it takes over.
// Browsers only check for a new service worker on a full page load, which never
// happens in an installed app resumed from the background or a long-open tab.
// So this also checks when the page becomes visible again, when the device comes
// back online, and once an hour.
const UPDATE_INTERVAL_MS = 60 * 60 * 1000;

export function registerServiceWorker() {
  if (typeof window === 'undefined') return;

  import('virtual:pwa-register').then(({ registerSW }) => {
    registerSW({
      // In autoUpdate mode this runs only on the first install, never after a deploy.
      onOfflineReady: showOfflineReadyToast,
      onRegisteredSW(_swUrl, registration) {
        if (!registration) return;

        const checkForUpdate = () => {
          if (!navigator.onLine || registration.installing) return;
          // Rejects when the request fails, for example on a weak mountain signal.
          registration.update().catch(() => {});
        };

        document.addEventListener('visibilitychange', () => {
          if (document.visibilityState === 'visible') checkForUpdate();
        });
        window.addEventListener('online', checkForUpdate);
        setInterval(checkForUpdate, UPDATE_INTERVAL_MS);
      },
    });
  });
}
