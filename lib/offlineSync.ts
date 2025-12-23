/**
 * Offline Sync Manager for POS Transactions
 * 
 * Features:
 * - Store transactions locally when offline
 * - Auto-sync when connection returns
 * - Handle conflicts and retries
 * - Track sync status
 */

import { ApolloClient } from '@apollo/client';

export interface OfflineTransaction {
  id: string; // Local UUID
  type: 'SALE' | 'CASH_DRAWER' | 'SHIFT_EVENT' | 'PARKED_SALE';
  data: any;
  timestamp: number;
  synced: boolean;
  attempts: number;
  lastError?: string;
}

const OFFLINE_STORAGE_KEY = 'offline_transactions';
const LAST_SYNC_KEY = 'offline_last_sync';
const MAX_RETRY_ATTEMPTS = 5;

export class OfflineSync {
  private isOnline: boolean = true;
  private syncInProgress: boolean = false;
  private listeners: Array<(status: boolean) => void> = [];
  private lastNetworkLog: string = '';
  private lastNetworkLogTime: number = 0;
  private readonly LOG_DEBOUNCE_MS = 1000; // Prevent duplicate logs within 1 second

  constructor() {
    if (typeof window !== 'undefined') {
      this.isOnline = navigator.onLine;
      this.setupNetworkListeners();
    }
  }

  /**
   * Log message only if it hasn't been logged recently (debounce)
   */
  private debouncedLog(message: string) {
    const now = Date.now();
    if (this.lastNetworkLog === message && (now - this.lastNetworkLogTime) < this.LOG_DEBOUNCE_MS) {
      return; // Skip duplicate log
    }
    console.log(message);
    this.lastNetworkLog = message;
    this.lastNetworkLogTime = now;
  }

  /**
   * Setup network status listeners
   */
  private setupNetworkListeners() {
    window.addEventListener('online', () => {
      this.debouncedLog('🟢 Network back online - starting sync...');
      this.isOnline = true;
      this.notifyListeners(true);
      this.syncPendingTransactions();
    });

    window.addEventListener('offline', () => {
      this.debouncedLog('🔴 Network offline - switching to offline mode');
      this.isOnline = false;
      this.notifyListeners(false);
    });
  }

  /**
   * Subscribe to network status changes
   */
  public onNetworkChange(callback: (isOnline: boolean) => void) {
    this.listeners.push(callback);
    return () => {
      this.listeners = this.listeners.filter(cb => cb !== callback);
    };
  }

  private notifyListeners(isOnline: boolean) {
    this.listeners.forEach(callback => callback(isOnline));
  }

  /**
   * Check if currently online
   */
  public getNetworkStatus(): boolean {
    return this.isOnline;
  }

  /**
   * Save transaction to local storage (offline mode)
   */
  public async saveOfflineTransaction(
    type: OfflineTransaction['type'],
    data: any
  ): Promise<string> {
    const transaction: OfflineTransaction = {
      id: this.generateUUID(),
      type,
      data,
      timestamp: Date.now(),
      synced: false,
      attempts: 0,
    };

    const existing = this.getOfflineTransactions();
    existing.push(transaction);
    
    if (typeof window !== 'undefined') {
      localStorage.setItem(OFFLINE_STORAGE_KEY, JSON.stringify(existing));
      // Broadcast sync event to all components
      window.dispatchEvent(new CustomEvent('offline-sync-update'));
    }

    this.debouncedLog(`💾 Saved offline transaction: ${transaction.id}`);
    return transaction.id;
  }

  /**
   * Get all pending offline transactions
   */
  public getOfflineTransactions(): OfflineTransaction[] {
    if (typeof window === 'undefined') return [];
    
    const stored = localStorage.getItem(OFFLINE_STORAGE_KEY);
    if (!stored) return [];
    
    try {
      return JSON.parse(stored);
    } catch (error) {
      console.error('Failed to parse offline transactions:', error);
      return [];
    }
  }

  /**
   * Get count of pending transactions
   */
  public getPendingCount(): number {
    return this.getOfflineTransactions().filter(t => !t.synced).length;
  }

  /**
   * Sync all pending transactions to server
   */
  public async syncPendingTransactions(apolloClient?: ApolloClient<any>): Promise<{
    success: number;
    failed: number;
    total: number;
  }> {
    if (this.syncInProgress) {
      this.debouncedLog('⏳ Sync already in progress, skipping...');
      return { success: 0, failed: 0, total: 0 };
    }

    if (!this.isOnline) {
      this.debouncedLog('🔴 Cannot sync - still offline');
      return { success: 0, failed: 0, total: 0 };
    }

    this.syncInProgress = true;
    const transactions = this.getOfflineTransactions();
    const pending = transactions.filter(t => !t.synced && t.attempts < MAX_RETRY_ATTEMPTS);

    if (pending.length === 0) {
      // Update last sync time even when nothing to sync
      this.saveLastSyncTime();
      this.syncInProgress = false;
      return { success: 0, failed: 0, total: 0 };
    }

    this.debouncedLog(`🔄 Syncing ${pending.length} offline transactions...`);

    let success = 0;
    let failed = 0;

    for (const transaction of pending) {
      try {
        await this.syncSingleTransaction(transaction, apolloClient);
        transaction.synced = true;
        transaction.attempts++;
        success++;
        this.debouncedLog(`✅ Synced: ${transaction.id}`);
      } catch (error: any) {
        transaction.attempts++;
        transaction.lastError = error.message;
        failed++;
        console.error(`❌ Failed to sync ${transaction.id}:`, error.message);
      }
    }

    // Update storage
    if (typeof window !== 'undefined') {
      localStorage.setItem(OFFLINE_STORAGE_KEY, JSON.stringify(transactions));
      // Broadcast sync event to all components
      window.dispatchEvent(new CustomEvent('offline-sync-update'));
    }

    // Clean up synced transactions (keep for 7 days for audit)
    this.cleanupOldTransactions();

    // Save last sync time
    this.saveLastSyncTime();

    this.syncInProgress = false;
    this.debouncedLog(`✨ Sync complete: ${success} success, ${failed} failed`);

    return { success, failed, total: pending.length };
  }

  /**
   * Sync a single transaction to the server
   */
  private async syncSingleTransaction(
    transaction: OfflineTransaction,
    apolloClient?: ApolloClient<any>
  ): Promise<void> {
    if (!apolloClient) {
      throw new Error('Apollo Client not provided');
    }

    // Import mutations dynamically based on type
    switch (transaction.type) {
      case 'SALE':
        const { CHECKOUT_SALE } = await import('@/graphql/inventory/point-of-sale');
        await apolloClient.mutate({
          mutation: CHECKOUT_SALE,
          variables: transaction.data,
        });
        break;

      case 'PARKED_SALE':
        const { PARK_SALE } = await import('@/graphql/inventory/point-of-sale');
        await apolloClient.mutate({
          mutation: PARK_SALE,
          variables: transaction.data,
        });
        break;

      case 'CASH_DRAWER':
        // Add cash drawer sync logic
        throw new Error('Cash drawer sync not implemented yet');

      case 'SHIFT_EVENT':
        const { RECORD_SHIFT_EVENT_MUTATION } = await import('@/graphql/shift/shiftTracking');
        await apolloClient.mutate({
          mutation: RECORD_SHIFT_EVENT_MUTATION,
          variables: { input: transaction.data },
        });
        break;

      default:
        throw new Error(`Unknown transaction type: ${transaction.type}`);
    }
  }

  /**
   * Clean up old synced transactions (keep for 7 days)
   */
  private cleanupOldTransactions() {
    const transactions = this.getOfflineTransactions();
    const sevenDaysAgo = Date.now() - (7 * 24 * 60 * 60 * 1000);
    
    const filtered = transactions.filter(t => {
      // Keep unsynced or recent transactions
      return !t.synced || t.timestamp > sevenDaysAgo;
    });

    if (filtered.length < transactions.length) {
      if (typeof window !== 'undefined') {
        localStorage.setItem(OFFLINE_STORAGE_KEY, JSON.stringify(filtered));
      }
      console.log(`🧹 Cleaned up ${transactions.length - filtered.length} old transactions`);
    }
  }

  /**
   * Clear all offline data (use with caution!)
   */
  public clearOfflineData() {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(OFFLINE_STORAGE_KEY);
    }
    console.log('🗑️ Cleared all offline transaction data');
  }

  /**
   * Generate UUID for offline transactions
   */
  private generateUUID(): string {
    return 'offline-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
  }

  /**
   * Manually retry failed transactions
   */
  public async retryFailedTransactions(apolloClient?: ApolloClient<any>): Promise<void> {
    const transactions = this.getOfflineTransactions();
    
    // Reset attempt count for failed transactions
    transactions.forEach(t => {
      if (!t.synced && t.attempts >= MAX_RETRY_ATTEMPTS) {
        t.attempts = 0;
      }
    });

    if (typeof window !== 'undefined') {
      localStorage.setItem(OFFLINE_STORAGE_KEY, JSON.stringify(transactions));
    }

    await this.syncPendingTransactions(apolloClient);
  }

  /**
   * Save last sync timestamp
   */
  private saveLastSyncTime() {
    if (typeof window !== 'undefined') {
      localStorage.setItem(LAST_SYNC_KEY, Date.now().toString());
      // Broadcast sync event to all components
      window.dispatchEvent(new CustomEvent('offline-sync-update'));
    }
  }

  /**
   * Get last sync timestamp
   */
  public getLastSyncTime(): number | null {
    if (typeof window === 'undefined') return null;
    
    const stored = localStorage.getItem(LAST_SYNC_KEY);
    return stored ? parseInt(stored, 10) : null;
  }
}

// Singleton instance
let offlineSyncInstance: OfflineSync | null = null;

export function getOfflineSync(): OfflineSync {
  if (!offlineSyncInstance) {
    offlineSyncInstance = new OfflineSync();
  }
  return offlineSyncInstance;
}
