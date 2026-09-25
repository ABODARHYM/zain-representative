// ================================================================
// Service Worker - zain-driver v10.3.0
// ================================================================

const APP_NAME = 'zain-driver';
const CACHE_VERSION = 'v10.3.0';
const CACHE_NAME = APP_NAME + '-' + CACHE_VERSION;

const urlsToCache = [
    './',
    './index.html',
    './drivers.html',
    './login.html',
    './notifications.html',
    './manifest.json',
    './branding.css',
    './responsive.css',
    './zain-core.js'
];

// ==================== Install ====================
self.addEventListener('install', function(event) {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(function(cache) {
                return cache.addAll(urlsToCache);
            })
            .then(function() {
                return self.skipWaiting();
            })
    );
});

// ==================== Activate ====================
self.addEventListener('activate', function(event) {
    event.waitUntil(
        caches.keys().then(function(names) {
            return Promise.all(
                names.map(function(name) {
                    if (name.startsWith(APP_NAME) && name !== CACHE_NAME) {
                        return caches.delete(name);
                    }
                })
            );
        }).then(function() {
            return self.clients.claim();
        })
    );
});

// ==================== Fetch ====================
self.addEventListener('fetch', function(event) {
    // تجاهل Firebase و APIs الخارجية
    if (event.request.url.includes('firestore.googleapis.com') ||
        event.request.url.includes('firebase') ||
        event.request.url.includes('googleapis.com') ||
        event.request.url.includes('gstatic.com') ||
        event.request.url.includes('unpkg.com') ||
        event.request.url.includes('cdnjs.cloudflare.com')) {
        return;
    }
    
    // Network First للـ HTML
    if (event.request.mode === 'navigate') {
        event.respondWith(
            fetch(event.request).catch(function() {
                return caches.match('./index.html');
            })
        );
        return;
    }
    
    // Cache First للأصول الثابتة
    event.respondWith(
        caches.match(event.request).then(function(response) {
            return response || fetch(event.request).then(function(networkResponse) {
                if (networkResponse && networkResponse.status === 200) {
                    const responseClone = networkResponse.clone();
                    caches.open(CACHE_NAME).then(function(cache) {
                        cache.put(event.request, responseClone);
                    });
                }
                return networkResponse;
            });
        })
    );
});

// ==================== Push Notifications ====================
self.addEventListener('push', function(event) {
    let data = {
        title: '🛵 طلب جديد',
        body: 'لديك طلب جديد للتحقق منه',
        target: 'driver'
    };
    
    try {
        if (event.data) {
            data = Object.assign(data, event.data.json());
        }
    } catch (e) {}
    
    // ✅ رفض الإشعارات غير الموجهة للمندوبين
    if (data.target && data.target !== 'driver') return;
    
    const options = {
        body: data.body,
        icon: './icons/icon-192.png',
        badge: './icons/icon-72.png',
        vibrate: [500, 200, 500, 200, 500, 200, 500],
        requireInteraction: true,
        tag: 'zain-driver-' + Date.now(),
        renotify: true,
        data: data.data || { url: './index.html' },
        actions: [
            { action: 'open', title: 'افتح التطبيق' },
            { action: 'close', title: 'إغلاق' }
        ]
    };
    
    event.waitUntil(
        self.registration.showNotification(data.title, options)
    );
});

// ==================== Notification Click ====================
self.addEventListener('notificationclick', function(event) {
    event.notification.close();
    
    if (event.action === 'close') return;
    
    const urlToOpen = (event.notification.data && event.notification.data.url) || './index.html';
    
    event.waitUntil(
        clients.matchAll({ type: 'window', includeUncontrolled: true })
            .then(function(clientList) {
                for (let i = 0; i < clientList.length; i++) {
                    const client = clientList[i];
                    if (client.url.includes('/zain-driver/') && 'focus' in client) {
                        return client.focus();
                    }
                }
                if (clients.openWindow) {
                    return clients.openWindow(urlToOpen);
                }
            })
    );
});

// ==================== Message from App ====================
self.addEventListener('message', function(event) {
    if (event.data && event.data.type === 'SKIP_WAITING') {
        self.skipWaiting();
    }
});