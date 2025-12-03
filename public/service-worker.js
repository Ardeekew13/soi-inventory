/**
 * Service Worker for SOI POS
 * 
 * Features:
 * - Cache static assets
 * - Offline fallback
 * - Background sync for transactions
 */

const CACHE_NAME = 'soi-pos-v1';
const OFFLINE_URL = '/offline.html';

// Assets to cache on install
const STATIC_ASSETS = [
  '/',
  '/offline.html',
  '/icon-192x192.png',
  '/icon-512x512.png',
];

// Install event - cache static assets
self.addEventListener('install', (event) => {
  console.log('[Service Worker] Installing...');
  
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[Service Worker] Caching static assets');
      return cache.addAll(STATIC_ASSETS);
    })
  );
  
  // Force activate immediately
  self.skipWaiting();
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('[Service Worker] Activating...');
  
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('[Service Worker] Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  
  // Take control of all pages immediately
  return self.clients.claim();
});

// Fetch event - serve from cache, fallback to network
self.addEventListener('fetch', (event) => {
  // Skip non-GET requests
  if (event.request.method !== 'GET') return;
  
  // Skip chrome-extension and other non-http(s) requests
  if (!event.request.url.startsWith('http')) return;
  
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        console.log('[Service Worker] Serving from cache:', event.request.url);
        return cachedResponse;
      }
      
      // Not in cache, fetch from network
      return fetch(event.request)
        .then((response) => {
          // Don't cache non-successful responses
          if (!response || response.status !== 200 || response.type !== 'basic') {
            return response;
          }
          
          // Cache successful responses for static assets
          if (event.request.url.match(/\.(js|css|png|jpg|jpeg|svg|woff|woff2)$/)) {
            const responseToCache = response.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, responseToCache);
            });
          }
          
          return response;
        })
        .catch(() => {
          // Network failed, serve offline page for navigation requests
          if (event.request.mode === 'navigate') {
            return caches.match(OFFLINE_URL);
          }
        });
    })
  );
});

// Background Sync - sync offline transactions
self.addEventListener('sync', (event) => {
  console.log('[Service Worker] Background sync triggered:', event.tag);
  
  if (event.tag === 'sync-transactions') {
    event.waitUntil(syncOfflineTransactions());
  }
});

// Push Notification
self.addEventListener('push', (event) => {
  console.log('[Service Worker] Push notification received');
  
  const data = event.data ? event.data.json() : {};
  const title = data.title || 'SOI POS Notification';
  const options = {
    body: data.body || 'You have a notification',
    icon: '/icon-192x192.png',
    badge: '/icon-192x192.png',
    data: data.url || '/',
  };
  
  event.waitUntil(
    self.registration.showNotification(title, options)
  );
});

// Notification click
self.addEventListener('notificationclick', (event) => {
  console.log('[Service Worker] Notification clicked');
  
  event.notification.close();
  
  event.waitUntil(
    clients.openWindow(event.notification.data)
  );
});

// Sync offline transactions function
async function syncOfflineTransactions() {
  try {
    console.log('[Service Worker] Syncing offline transactions...');
    
    // Get offline transactions from IndexedDB
    const db = await openIndexedDB();
    const transactions = await getOfflineTransactions(db);
    
    if (transactions.length === 0) {
      console.log('[Service Worker] No transactions to sync');
      return;
    }
    
    console.log(`[Service Worker] Found ${transactions.length} transactions to sync`);
    
    let successCount = 0;
    let failCount = 0;
    
    for (const transaction of transactions) {
      try {
        // Send to server
        const response = await fetch('/api/graphql', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            query: transaction.mutation,
            variables: transaction.variables,
          }),
        });
        
        if (response.ok) {
          // Mark as synced in IndexedDB
          await markAsSynced(db, transaction.id);
          successCount++;
        } else {
          failCount++;
        }
      } catch (error) {
        console.error('[Service Worker] Failed to sync transaction:', error);
        failCount++;
      }
    }
    
    console.log(`[Service Worker] Sync complete: ${successCount} success, ${failCount} failed`);
    
    // Notify user
    if (successCount > 0) {
      self.registration.showNotification('SOI POS', {
        body: `✅ Synced ${successCount} offline transactions`,
        icon: '/icon-192x192.png',
      });
    }
  } catch (error) {
    console.error('[Service Worker] Sync error:', error);
  }
}

// IndexedDB helpers
function openIndexedDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('soi-pos-offline', 1);
    
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
    
    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains('transactions')) {
        db.createObjectStore('transactions', { keyPath: 'id' });
      }
    };
  });
}

function getOfflineTransactions(db) {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(['transactions'], 'readonly');
    const store = transaction.objectStore('transactions');
    const request = store.getAll();
    
    request.onerror = () => reject(request.error);
    request.onsuccess = () => {
      const transactions = request.result.filter(t => !t.synced);
      resolve(transactions);
    };
  });
}

function markAsSynced(db, id) {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(['transactions'], 'readwrite');
    const store = transaction.objectStore('transactions');
    const request = store.get(id);
    
    request.onsuccess = () => {
      const data = request.result;
      data.synced = true;
      data.syncedAt = Date.now();
      
      const updateRequest = store.put(data);
      updateRequest.onsuccess = () => resolve();
      updateRequest.onerror = () => reject(updateRequest.error);
    };
    
    request.onerror = () => reject(request.error);
  });
}
