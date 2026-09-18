/* eslint-disable no-undef */
importScripts('https://www.gstatic.com/firebasejs/12.15.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/12.15.0/firebase-messaging-compat.js');

let messaging = null;

fetch('/firebase-config.json')
  .then((response) => response.json())
  .then((config) => {
    if (!config?.apiKey || !config?.projectId || String(config.apiKey).startsWith('REPLACE_WITH_')) {
      return;
    }

    firebase.initializeApp(config);
    messaging = firebase.messaging();

    messaging.onBackgroundMessage((payload) => {
      const title = payload.notification?.title || payload.data?.title || 'VAMOFLEX Vendor Hub';
      const options = {
        body: payload.notification?.body || payload.data?.message || payload.data?.body || '',
        icon: '/favicon.ico',
        data: payload.data || {},
      };

      self.registration.showNotification(title, options);
    });
  })
  .catch(() => {
    // Firebase config not loaded
  });

self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  const link = event.notification?.data?.link || '/vendor-portal/dashboard';

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windowClients) => {
      for (const client of windowClients) {
        if ('focus' in client) {
          client.focus();
          if ('navigate' in client) {
            return client.navigate(link);
          }
        }
      }

      if (clients.openWindow) {
        return clients.openWindow(link);
      }

      return undefined;
    })
  );
});
