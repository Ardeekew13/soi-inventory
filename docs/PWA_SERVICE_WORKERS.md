# PWA (Progressive Web App) Setup Guide

## 🎯 What Are Service Workers & PWA?

### **Service Worker = Background Worker**
Think of it as a "robot assistant" that:
- Works 24/7 in the background
- Caches your app for offline use
- Syncs data even when browser is closed
- Sends push notifications

### **PWA = Web App That Feels Native**
Your POS becomes:
- **Installable** - Add to phone/desktop home screen
- **Offline-First** - Works without internet
- **Fast** - Loads instantly from cache
- **App-Like** - Full screen, no browser bars

---

## 📦 Files Created

1. **`public/manifest.json`** - PWA configuration
   - App name, icons, colors
   - Install settings
   - Shortcuts (POS, Inventory)

2. **`public/service-worker.js`** - Background worker
   - Caches static assets
   - Handles offline requests
   - Background sync
   - Push notifications

3. **`public/offline.html`** - Offline fallback page
   - Shows when no connection
   - Auto-redirects when online

---

## 🚀 How to Enable PWA

### Step 1: Register Service Worker

Add this to your root layout:

```tsx
// app/layout.tsx
'use client';

import { useEffect } from 'react';

export default function RootLayout({ children }) {
  useEffect(() => {
    // Register service worker
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker
        .register('/service-worker.js')
        .then((registration) => {
          console.log('✅ Service Worker registered:', registration);
          
          // Request notification permission
          if ('Notification' in window && Notification.permission === 'default') {
            Notification.requestPermission();
          }
        })
        .catch((error) => {
          console.error('❌ Service Worker registration failed:', error);
        });
    }
  }, []);

  return (
    <html lang="en">
      <head>
        {/* PWA Meta Tags */}
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#1890ff" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="SOI POS" />
        <link rel="apple-touch-icon" href="/icon-192x192.png" />
      </head>
      <body>
        {children}
      </body>
    </html>
  );
}
```

### Step 2: Add App Icons

Create two icon files:
- **`public/icon-192x192.png`** - 192x192px
- **`public/icon-512x512.png`** - 512x512px

Use your logo/branding. You can use tools like:
- https://favicon.io/
- https://realfavicongenerator.net/

### Step 3: Test Installation

**On Desktop (Chrome/Edge):**
1. Open your app
2. Look for install icon in address bar (➕)
3. Click to install
4. App opens in its own window!

**On Mobile (Chrome/Safari):**
1. Open your app
2. Tap menu (⋮)
3. Select "Add to Home Screen"
4. Icon appears on home screen!

---

## 🔄 Background Sync Feature

### Enable Background Sync in Service Worker

Your `service-worker.js` already has background sync! To use it:

```tsx
// In your POS component
const registerBackgroundSync = async () => {
  if ('serviceWorker' in navigator && 'sync' in ServiceWorkerRegistration.prototype) {
    const registration = await navigator.serviceWorker.ready;
    
    // Register background sync
    await registration.sync.register('sync-transactions');
    
    console.log('✅ Background sync registered');
  }
};

// Call this after saving offline transaction
await saveOffline('SALE', saleData);
await registerBackgroundSync(); // Will sync even if browser closed!
```

---

## 📬 Push Notifications

### Step 1: Request Permission

```tsx
const requestNotificationPermission = async () => {
  if ('Notification' in window) {
    const permission = await Notification.requestPermission();
    if (permission === 'granted') {
      console.log('✅ Notification permission granted');
    }
  }
};
```

### Step 2: Send Notification

```tsx
const showNotification = () => {
  if ('serviceWorker' in navigator && Notification.permission === 'granted') {
    navigator.serviceWorker.ready.then((registration) => {
      registration.showNotification('Low Stock Alert', {
        body: 'Coffee beans stock is running low!',
        icon: '/icon-192x192.png',
        badge: '/icon-192x192.png',
        tag: 'low-stock',
        requireInteraction: true,
        actions: [
          { action: 'view', title: 'View Inventory' },
          { action: 'dismiss', title: 'Dismiss' },
        ],
      });
    });
  }
};
```

---

## 🎨 PWA Install Button

Add an install button to your app:

```tsx
'use client';

import { useState, useEffect } from 'react';
import { Button } from 'antd';
import { DownloadOutlined } from '@ant-design/icons';

export default function InstallPWA() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showInstall, setShowInstall] = useState(false);

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowInstall(true);
    };

    window.addEventListener('beforeinstallprompt', handler);

    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;

    if (outcome === 'accepted') {
      console.log('✅ User installed PWA');
    }

    setDeferredPrompt(null);
    setShowInstall(false);
  };

  if (!showInstall) return null;

  return (
    <Button
      type="primary"
      icon={<DownloadOutlined />}
      onClick={handleInstall}
      style={{ position: 'fixed', bottom: 20, right: 20, zIndex: 1000 }}
    >
      Install App
    </Button>
  );
}
```

---

## 🧪 Testing Checklist

### PWA Installation
- [ ] Install prompt appears
- [ ] App installs to home screen
- [ ] App opens in standalone mode
- [ ] Splash screen shows

### Offline Functionality
- [ ] App loads when offline
- [ ] Cached pages accessible
- [ ] Offline page shows for uncached routes
- [ ] Transitions smoothly online/offline

### Background Sync
- [ ] Transactions sync in background
- [ ] Syncs even when browser closed
- [ ] Shows notification after sync

### Push Notifications
- [ ] Permission request works
- [ ] Notifications display correctly
- [ ] Click opens correct page
- [ ] Actions work (View/Dismiss)

---

## 📊 Benefits Comparison

### Before PWA:
```
❌ Must keep browser tab open to sync
❌ Reloads entire app on refresh
❌ No install option
❌ Browser UI takes screen space
❌ No push notifications
```

### After PWA:
```
✅ Background sync (browser can close!)
✅ Instant loading from cache
✅ Install as native-like app
✅ Full-screen app experience
✅ Push notifications enabled
```

---

## 🔧 Advanced Features

### Update Service Worker

When you make changes to service-worker.js:

```tsx
// Add to your app
useEffect(() => {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.ready.then((registration) => {
      // Check for updates every hour
      setInterval(() => {
        registration.update();
      }, 60 * 60 * 1000);
    });
  }
}, []);
```

### Cache Strategies

1. **Cache First** (Fast, for static assets)
   ```js
   // Check cache first, fallback to network
   ```

2. **Network First** (Fresh data, for API calls)
   ```js
   // Try network first, fallback to cache
   ```

3. **Stale While Revalidate** (Best of both)
   ```js
   // Serve cache immediately, update in background
   ```

### IndexedDB for Larger Storage

Upgrade from LocalStorage (5MB) to IndexedDB (50MB+):

```tsx
// Already in service-worker.js!
const db = await openIndexedDB();
```

---

## 🎉 Summary

### What You Get:

1. **📱 Install as App** - Home screen icon, full screen
2. **⚡ Lightning Fast** - Loads from cache instantly
3. **🔌 Works Offline** - Full POS functionality
4. **🔄 Background Sync** - Syncs even when closed
5. **📬 Push Notifications** - Alert users of important events
6. **💾 Larger Storage** - IndexedDB for 50MB+ data

### Implementation Time:
- **Basic PWA:** 1 hour
- **With Background Sync:** 2 hours
- **With Push Notifications:** 3 hours

### Next Steps:
1. Add icons (192x192, 512x512)
2. Register service worker in layout
3. Test installation on mobile/desktop
4. Enable background sync
5. Add push notifications (optional)

---

**Your POS is now a real app! 🚀**

Install it on phones, tablets, and desktops. It works offline, syncs in the background, and feels like a native app. No App Store needed!
