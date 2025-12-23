/**
 * React Hook for Offline Sync
 * 
 * Usage:
 * const { isOnline, pendingCount, syncNow } = useOfflineSync();
 */

import { useState, useEffect, useRef } from 'react';
import { useApolloClient } from '@apollo/client';
import { getOfflineSync } from '@/lib/offlineSync';
import { App } from 'antd';

export function useOfflineSync() {
  const apolloClient = useApolloClient();
  const { message } = App.useApp();
  const offlineSync = getOfflineSync();

  const [isOnline, setIsOnline] = useState(offlineSync.getNetworkStatus());
  const [pendingCount, setPendingCount] = useState(offlineSync.getPendingCount());
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState<number | null>(offlineSync.getLastSyncTime());
  
  // Track if messages have been shown to prevent duplicates
  const messageShownRef = useRef({
    online: false,
    offline: false,
    lastMessageTime: 0,
  });

  useEffect(() => {
    const MESSAGE_DEBOUNCE_MS = 2000; // Prevent duplicate messages within 2 seconds
    
    // Subscribe to network changes
    const unsubscribe = offlineSync.onNetworkChange((online) => {
      setIsOnline(online);
      
      const now = Date.now();
      const timeSinceLastMessage = now - messageShownRef.current.lastMessageTime;
      
      if (online && !messageShownRef.current.online && timeSinceLastMessage > MESSAGE_DEBOUNCE_MS) {
        message.success('🟢 Back online! Syncing pending transactions...');
        messageShownRef.current.online = true;
        messageShownRef.current.offline = false;
        messageShownRef.current.lastMessageTime = now;
        syncNow();
      } else if (!online && !messageShownRef.current.offline && timeSinceLastMessage > MESSAGE_DEBOUNCE_MS) {
        message.warning('🔴 No internet connection. Working offline.');
        messageShownRef.current.offline = true;
        messageShownRef.current.online = false;
        messageShownRef.current.lastMessageTime = now;
      }
    });

    // Listen for sync updates from other components
    const handleSyncUpdate = () => {
      setPendingCount(offlineSync.getPendingCount());
      setLastSyncTime(offlineSync.getLastSyncTime());
    };
    
    window.addEventListener('offline-sync-update', handleSyncUpdate);

    // Update pending count periodically
    const interval = setInterval(() => {
      setPendingCount(offlineSync.getPendingCount());
      setLastSyncTime(offlineSync.getLastSyncTime());
    }, 2000);

    // Initial sync if online (only once per app lifecycle)
    if (isOnline && offlineSync.getPendingCount() > 0 && !isSyncing) {
      // Delay initial sync to prevent multiple components from triggering it
      const initialSyncTimeout = setTimeout(() => {
        syncNow();
      }, 500);
      
      return () => {
        unsubscribe();
        window.removeEventListener('offline-sync-update', handleSyncUpdate);
        clearInterval(interval);
        clearTimeout(initialSyncTimeout);
      };
    }

    return () => {
      unsubscribe();
      window.removeEventListener('offline-sync-update', handleSyncUpdate);
      clearInterval(interval);
    };
  }, []);

  const syncNow = async () => {
    if (isSyncing) return;

    setIsSyncing(true);
    try {
      const result = await offlineSync.syncPendingTransactions(apolloClient);
      
      if (result.success > 0) {
        message.success(`Synced ${result.success} transactions`);
      }
      
      if (result.failed > 0) {
        message.error(`Failed to sync ${result.failed} transactions. Will retry.`);
      }

      setPendingCount(offlineSync.getPendingCount());
      setLastSyncTime(offlineSync.getLastSyncTime());
    } catch (error: any) {
      console.error('Sync error:', error);
      message.error('Failed to sync transactions');
    } finally {
      setIsSyncing(false);
    }
  };

  const saveOffline = async (type: 'SALE' | 'CASH_DRAWER' | 'SHIFT_EVENT' | 'PARKED_SALE', data: any) => {
    const id = await offlineSync.saveOfflineTransaction(type, data);
    setPendingCount(offlineSync.getPendingCount());
    
    if (!isOnline) {
      message.info('💾 Saved offline. Will sync when online.');
    }
    
    return id;
  };

  const retryFailed = async () => {
    setIsSyncing(true);
    try {
      await offlineSync.retryFailedTransactions(apolloClient);
      message.success('Retried failed transactions');
      setPendingCount(offlineSync.getPendingCount());
    } catch (error) {
      message.error('Failed to retry transactions');
    } finally {
      setIsSyncing(false);
    }
  };

  return {
    isOnline,
    pendingCount,
    isSyncing,
    lastSyncTime,
    syncNow,
    saveOffline,
    retryFailed,
  };
}
