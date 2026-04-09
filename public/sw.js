self.addEventListener('push', (event) => {
  if (!event.data) return;

  let data = {};
  try {
    data = event.data.json();
  } catch {
    data = { title: 'Anchor', body: event.data.text() };
  }

  const options = {
    body: data.body || '',
    icon: data.icon || '/icon-192.png',
    badge: data.badge || '/icon-96.png',
    data: {
      category: data.category,
      timestamp: data.timestamp,
      url: data.url || '/'
    },
    vibrate: data.category === 'security' ? [300, 100, 300, 100, 300] : [200, 100, 200],
    requireInteraction: data.category === 'security' || data.category === 'pengajakten',
    actions: data.actions || []
  };

  event.waitUntil(
    self.registration.showNotification(data.title || 'Anchor', options)
  );
});

self.addEventListener('notificationclick', (event) => {
  const action = event.action;
  const notifData = event.notification.data || {};
  event.notification.close();

  let targetUrl = notifData.url || '/';

  // Action-specifik routing
  if (action === 'fix' || action === 'confirm' || action === 'sell' || action === 'view') {
    targetUrl = notifData.url || '/';
  } else if (action === 'investigate') {
    targetUrl = '/TransactionHistory';
  }
  // 'dismiss' & 'ignore' → ingen navigation

  if (action === 'dismiss' || action === 'ignore') {
    return;
  }

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if (client.url.includes(self.location.origin) && 'focus' in client) {
          client.navigate(targetUrl);
          return client.focus();
        }
      }
      if (clients.openWindow) return clients.openWindow(targetUrl);
    })
  );
});
