# Offline POS Architecture Diagram

## System Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                         POS APPLICATION                          │
└─────────────────────────────────────────────────────────────────┘
                                │
                    ┌───────────┴───────────┐
                    │   Network Status?     │
                    └───────────┬───────────┘
                                │
                ┌───────────────┼───────────────┐
                │               │               │
           🟢 ONLINE       🔴 OFFLINE      🟡 SYNCING
                │               │               │
                ▼               ▼               ▼
    ┌────────────────┐  ┌──────────────┐  ┌──────────────┐
    │  Apollo Client │  │ LocalStorage │  │ Sync Manager │
    │   (GraphQL)    │  │  (Pending)   │  │  (Worker)    │
    └────────┬───────┘  └──────┬───────┘  └──────┬───────┘
             │                 │                  │
             ▼                 │                  ▼
    ┌────────────────┐         │         ┌──────────────┐
    │  GraphQL API   │         │         │  Batch Sync  │
    └────────┬───────┘         │         └──────┬───────┘
             │                 │                 │
             ▼                 └─────────────────┘
    ┌────────────────┐                  │
    │    MongoDB     │◄─────────────────┘
    └────────────────┘
```

## Data Flow States

### State 1: Online Transaction
```
User Action (Checkout)
    ↓
Check Network (isOnline = true)
    ↓
Apollo Client.mutate()
    ↓
GraphQL API
    ↓
MongoDB (Immediate)
    ↓
✅ Success Notification
```

### State 2: Offline Transaction
```
User Action (Checkout)
    ↓
Check Network (isOnline = false)
    ↓
Generate Offline ID
    ↓
LocalStorage.setItem()
    ↓
💾 "Saved Offline" Notification
    ↓
Red Indicator Badge (+1)
```

### State 3: Auto Sync on Reconnection
```
Network Event (navigator.onLine = true)
    ↓
🟢 "Back Online" Notification
    ↓
Load Pending Transactions
    ↓
For Each Transaction:
    ├─ Try Sync to Server
    │   ├─ Success: Mark as Synced ✅
    │   └─ Failed: Increment Attempts ❌
    ↓
Update LocalStorage
    ↓
Clean Up Old Synced Items
    ↓
Update Badge Count
    ↓
✨ "Synced X transactions" Notification
```

## Component Hierarchy

```
App Layout
├─ OfflineIndicator (Fixed Position)
│  ├─ Network Status Icon
│  ├─ Pending Count Badge
│  └─ Manual Sync Button
│
├─ POS Component
│  ├─ useOfflineSync() Hook
│  │  ├─ isOnline
│  │  ├─ pendingCount
│  │  ├─ saveOffline()
│  │  └─ syncNow()
│  │
│  └─ CartSection
│     └─ handleCheckout()
│        ├─ if (isOnline) → Normal Mutation
│        └─ if (!isOnline) → saveOffline()
│
└─ Other Components...
```

## Storage Structure

```
LocalStorage
└─ offline_transactions
   ├─ [0]
   │  ├─ id: "offline-1701619200000-abc123"
   │  ├─ type: "SALE"
   │  ├─ data: { customerId, products[], total }
   │  ├─ timestamp: 1701619200000
   │  ├─ synced: false
   │  ├─ attempts: 0
   │  └─ lastError: null
   │
   ├─ [1]
   │  ├─ id: "offline-1701619300000-def456"
   │  ├─ type: "SALE"
   │  ├─ synced: true ✅
   │  └─ attempts: 1
   │
   └─ [2]
      ├─ id: "offline-1701619400000-ghi789"
      ├─ type: "CASH_DRAWER"
      ├─ synced: false
      ├─ attempts: 3
      └─ lastError: "Network timeout"
```

## Sync Flow Diagram

```
┌──────────────┐
│ Page Loads   │
└──────┬───────┘
       │
       ▼
┌──────────────────────┐
│ Setup Event Listeners│
│ - window.online      │
│ - window.offline     │
└──────┬───────────────┘
       │
       ▼
┌──────────────────────┐
│ Check Pending Count  │
└──────┬───────────────┘
       │
       ├─ Count > 0 ─┐
       │             ▼
       │    ┌─────────────────┐
       │    │ Show Indicator  │
       │    └─────────────────┘
       │
       └─ Count = 0 ─┐
                     ▼
            ┌──────────────────┐
            │ Hide Indicator   │
            └──────────────────┘

┌─────────────────────────────┐
│   Network Status Changes    │
└──────────────┬──────────────┘
               │
       ┌───────┴────────┐
       │                │
    ONLINE           OFFLINE
       │                │
       ▼                ▼
┌──────────────┐  ┌──────────────┐
│ Trigger Sync │  │ Show Warning │
└──────┬───────┘  └──────────────┘
       │
       ▼
┌──────────────────────┐
│ Get Pending Items    │
└──────┬───────────────┘
       │
       ▼
┌──────────────────────┐
│ Batch Process (10)   │
└──────┬───────────────┘
       │
       ├─ For Each Item:
       │  ├─ Try Mutation
       │  ├─ If Success → Mark Synced
       │  └─ If Failed → Log Error
       │
       ▼
┌──────────────────────┐
│ Update Storage       │
└──────┬───────────────┘
       │
       ▼
┌──────────────────────┐
│ Show Result Summary  │
│ "✅ Synced 8 of 10"  │
└──────────────────────┘
```

## Error Handling Flow

```
Sync Attempt
    │
    ├─ Network Error
    │  ├─ Increment Attempts
    │  ├─ Check Max Attempts (5)
    │  │  ├─ < 5: Will Retry
    │  │  └─ >= 5: Mark as Failed
    │  └─ Store Error Message
    │
    ├─ Validation Error
    │  ├─ Mark as Failed
    │  ├─ Store Error Message
    │  └─ Notify User for Manual Fix
    │
    ├─ Duplicate Error
    │  ├─ Check if Already Synced
    │  ├─ Mark as Synced (if exists)
    │  └─ Remove from Queue
    │
    └─ Unknown Error
       ├─ Log to Console
       ├─ Increment Attempts
       └─ Will Retry
```

## Performance Optimization

```
Sync Strategy
├─ Batch Processing
│  └─ Process 10 items at a time
│
├─ Parallel Execution
│  └─ Promise.all() for batch
│
├─ Retry Logic
│  ├─ Exponential Backoff
│  └─ Max 5 Attempts
│
└─ Storage Cleanup
   ├─ Auto-delete synced items > 7 days
   └─ Manual clear option
```

## User Experience Journey

```
1. NORMAL OPERATION
   User → Checkout → ✅ Success
   Duration: 1-2 seconds

2. OFFLINE MODE
   User → Checkout → 💾 Saved Offline
   Duration: <100ms (much faster!)
   Notice: Badge appears (+1)

3. BACK ONLINE
   Auto: 🟢 Syncing notification
   Duration: 5-10 seconds for 10 items
   Result: ✅ Badge disappears

4. SYNC FAILURE
   Auto: ❌ "Failed to sync X items"
   Action: Manual Retry Button
   Alternative: View Failed Items
```

## Implementation Phases

```
Phase 1: Core Setup
├─ offlineSync.ts (30 min)
├─ useOfflineSync.tsx (20 min)
└─ OfflineIndicator.tsx (30 min)
    Total: ~1.5 hours

Phase 2: POS Integration
├─ Modify CartSection (30 min)
├─ Add offline checks (20 min)
└─ Test flows (30 min)
    Total: ~1.5 hours

Phase 3: Polish & Test
├─ Error handling (30 min)
├─ UI refinements (30 min)
└─ Full testing (1 hour)
    Total: ~2 hours

Total Implementation: 4-5 hours
```

## Technology Stack

```
Frontend
├─ React Hooks (useOfflineSync)
├─ Apollo Client (GraphQL)
├─ LocalStorage API
└─ Network Events API

Backend (No Changes!)
├─ GraphQL API (existing)
├─ MongoDB (existing)
└─ All mutations work as-is

Future Enhancements
├─ IndexedDB (better storage)
├─ Service Workers (PWA)
└─ Background Sync API
```

---

This architecture provides:
- ✅ Zero backend changes required
- ✅ Works with existing GraphQL API
- ✅ Graceful degradation
- ✅ Auto-recovery
- ✅ User-friendly experience
