/**
 * Quick Setup Script for Offline POS
 * 
 * Run this to test the offline functionality:
 * 1. Save some test transactions offline
 * 2. View pending count
 * 3. Sync them
 */

import { getOfflineSync } from './offlineSync';

async function setupOfflineDemo() {
  const offlineSync = getOfflineSync();

  console.log('🎯 Offline POS Demo Setup');
  console.log('========================\n');

  // Check network status
  const isOnline = offlineSync.getNetworkStatus();
  console.log(`📡 Network Status: ${isOnline ? '🟢 Online' : '🔴 Offline'}`);

  // Get pending count
  const pending = offlineSync.getPendingCount();
  console.log(`📊 Pending Transactions: ${pending}`);

  // Show all offline transactions
  const transactions = offlineSync.getOfflineTransactions();
  console.log('\n📝 Offline Transactions:');
  transactions.forEach((t, i) => {
    console.log(`  ${i + 1}. ${t.type} - ${t.synced ? '✅ Synced' : '⏳ Pending'}`);
    console.log(`     ID: ${t.id}`);
    console.log(`     Attempts: ${t.attempts}`);
    if (t.lastError) {
      console.log(`     Error: ${t.lastError}`);
    }
  });

  console.log('\n💡 How to use:');
  console.log('1. Go offline (Chrome DevTools → Network → Offline)');
  console.log('2. Create a sale in POS');
  console.log('3. Go back online');
  console.log('4. Watch auto-sync happen!');
  console.log('\n✨ Try the OfflineIndicator component to see it in action!');
}

// For browser console
if (typeof window !== 'undefined') {
  (window as any).testOfflineSync = setupOfflineDemo;
  (window as any).getOfflineSync = getOfflineSync;
  
  console.log('💡 Offline Sync loaded! Try:');
  console.log('  window.testOfflineSync() - Show demo info');
  console.log('  window.getOfflineSync() - Get sync instance');
}

export { setupOfflineDemo };
