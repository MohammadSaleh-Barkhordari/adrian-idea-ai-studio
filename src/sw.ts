/// <reference lib="webworker" />
import { precacheAndRoute } from 'workbox-precaching';
import { clientsClaim } from 'workbox-core';

declare let self: ServiceWorkerGlobalScope;

// Take control immediately
self.skipWaiting();
clientsClaim();

// VitePWA injects precache manifest here
precacheAndRoute(self.__WB_MANIFEST);

// ===== PUSH NOTIFICATION HANDLERS =====

self.addEventListener('push', function(event) {
  console.log('[SW] Push event received');

  let data: any = {
    title: 'Adrian Idea',
    body: 'You have a new notification',
    icon: '/lovable-uploads/38598e63-607e-4758-bb3d-7fb4e170eae0.png',
    url: '/',
  };

  if (event.data) {
    try {
      const payload = event.data.json();
      console.log('[SW] Push payload:', payload);
      data = {
        title: payload.title || data.title,
        body: payload.body || payload.message || data.body,
        icon: payload.icon || data.icon,
        url: payload.url || data.url,
      };
    } catch (e) {
      console.error('[SW] Error parsing push data:', e);
      data.body = event.data.text();
    }
  }

  event.waitUntil(
    self.registration.showNotification(data.title, {
      body: data.body,
      icon: data.icon,
      badge: '/lovable-uploads/38598e63-607e-4758-bb3d-7fb4e170eae0.png',
      tag: 'notification-' + Date.now(),
      renotify: true,
      data: {
        url: data.url,
        dateOfArrival: Date.now(),
      },
    } as NotificationOptions)
  );
});

self.addEventListener('notificationclick', function(event) {
  console.log('[SW] Notification clicked');
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

self.addEventListener('notificationclose', function(event) {
  console.log('[SW] Notification dismissed');
});

self.addEventListener('install', function() {
  console.log('[SW] Service worker installed with push support');
  self.skipWaiting();
});

self.addEventListener('activate', function(event) {
  console.log('[SW] Service worker activated - push handlers ready');
  event.waitUntil(self.clients.claim());
});
