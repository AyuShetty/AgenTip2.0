// Service Worker for AgentTip Push Notifications
// Receives push events from the backend and shows native browser notifications

self.addEventListener('push', function(event) {
  const data = event.data.json();

  const options = {
    body: data.body,
    icon: data.icon || '/icon.png',
    badge: data.badge || '/badge.png',
    data: data.data,
    actions: data.actions || [],
    requireInteraction: true,
    silent: false,
    vibrate: [200, 100, 200],
    tag: 'agenttip-daily-summary',
  };

  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});

self.addEventListener('notificationclick', function(event) {
  event.notification.close();

  const action = event.action;
  const data = event.notification.data;

  let url = data?.url || '/dashboard';

  if (action === 'deploy') {
    url = url + (url.includes('?') ? '&' : '?') + 'deploy=true';
  }

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(function(clientList) {
      // If a dashboard window is already open, focus it
      for (const client of clientList) {
        if (client.url.includes('/dashboard') && 'focus' in client) {
          return client.focus();
        }
      }
      // Otherwise open a new window
      return clients.openWindow(url);
    })
  );
});

self.addEventListener('install', function() {
  self.skipWaiting();
});

self.addEventListener('activate', function() {
  self.clients.claim();
});
