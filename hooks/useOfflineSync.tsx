/**
 * React Hook for Offline Sync
 * 
 * Usage:
 * const { isOnline, pendingCount, syncNow } = useOfflineSync();
 */

import { useState, useEffect } from 'react';
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

  useEffect(() => {
    // Subscribe to network changes
    const unsubscribe = offlineSync.onNetworkChange((online) => {
      setIsOnline(online);
      
      if (online) {
        message.success('🟢 Back online! Syncing pending transactions...');
        syncNow();
      } else {
        message.warning('🔴 No internet connection. Working offline.');
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

    // Initial sync if online
    if (isOnline && offlineSync.getPendingCount() > 0) {
      syncNow();
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
        message.success(`✅ Synced ${result.success} transactions`);
      }
      
      if (result.failed > 0) {
        message.error(`❌ Failed to sync ${result.failed} transactions. Will retry.`);
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

  const saveOffline = async (type: 'SALE' | 'CASH_DRAWER' | 'SHIFT_EVENT', data: any) => {
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
