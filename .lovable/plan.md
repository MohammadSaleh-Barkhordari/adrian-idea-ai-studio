
# Execute Push Notification Fix — Service Worker Merge

## Overview
Merge push notification handlers into VitePWA's service worker to resolve the conflict where push events are silently swallowed.

## Changes to Implement

### 1. Create `src/sw.ts` (NEW FILE)
Combined service worker with Workbox precaching + push handlers:

```typescript
/// <reference lib="webworker" />
import { precacheAndRoute } from 'workbox-precaching';
import { clientsClaim } from 'workbox-core';

declare let self: ServiceWorkerGlobalScope;

self.skipWaiting();
clientsClaim();

// VitePWA injects precache manifest here
precacheAndRoute(self.__WB_MANIFEST);

// Push event handler
self.addEventListener('push', function(event) {
  console.log('[SW] Push event received');
  let data = {
    title: 'Adrian Idea',
    body: 'You have a new notification',
    icon: '/adrian-idea-favicon-512.png',
    url: '/',
  };
  if (event.data) {
    try {
      const payload = event.data.json();
      data = { ...data, ...payload };
    } catch (e) {
      data.body = event.data.text();
    }
  }
  event.waitUntil(
    self.registration.showNotification(data.title, {
      body: data.body || data.message,
      icon: data.icon,
      badge: '/adrian-idea-favicon-192.png',
      vibrate: [100, 50, 100],
      tag: 'notification-' + Date.now(),
      renotify: true,
      data: { url: data.url, dateOfArrival: Date.now() },
    })
  );
});

// Notification click handler
self.addEventListener('notificationclick', function(event) {
  event.notification.close();
  const urlToOpen = event.notification.data?.url || '/';
  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then(function(clientList) {
      for (const client of clientList) {
        if (client.url.includes(self.location.origin) && 'focus' in client) {
          client.navigate(urlToOpen);
          return client.focus();
        }
      }
      return self.clients.openWindow(urlToOpen);
    })
  );
});

// Install/activate handlers
self.addEventListener('install', () => { console.log('[SW] Installed with push support'); self.skipWaiting(); });
self.addEventListener('activate', (event) => { console.log('[SW] Activated'); event.waitUntil(self.clients.claim()); });
```

### 2. Modify `vite.config.ts`
Switch VitePWA to `injectManifest` strategy:

- Change `strategies: 'injectManifest'`
- Add `srcDir: 'src'` and `filename: 'sw.ts'`
- Move `maximumFileSizeToCacheInBytes` into `injectManifest` config
- Add `devOptions: { enabled: true, type: 'module' }`
- Keep all existing manifest config unchanged

### 3. Delete `public/sw.js`
Remove the old standalone service worker file.

### 4. Modify `src/main.tsx`
Remove manual service worker registration (lines 15-22) since VitePWA handles it automatically. Add debug logging for service worker registrations.

### 5. Modify `src/components/NotificationBell.tsx`
Add debug info state and display (development mode only) showing registered service workers.

---

## Technical Details

| File | Action |
|------|--------|
| `src/sw.ts` | Create (combined SW) |
| `vite.config.ts` | Modify (injectManifest strategy) |
| `public/sw.js` | Delete |
| `src/main.tsx` | Modify (remove manual registration) |
| `src/components/NotificationBell.tsx` | Modify (add debug info) |

## Post-Deployment Steps
1. Delete the PWA from iPhone Home Screen
2. Clear Safari cache
3. Re-add to Home Screen
4. Enable notifications
5. Test with locked screen
