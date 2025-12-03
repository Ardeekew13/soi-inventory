# Database Optimization Guide

## Overview
This document describes the database optimization strategies implemented in the SOI Inventory system.

## 1. Database Indexes

### Purpose
Indexes improve query performance by allowing MongoDB to quickly locate documents without scanning the entire collection.

### Implemented Indexes

#### Users Collection
```javascript
- username: 1       // Unique, for login queries
- role: 1          // For filtering by role
- isActive: 1      // For active user queries
- createdAt: -1    // For sorting by date
```

#### Sales Collection
```javascript
- status: 1                    // For filtering by status
- orderNo: 1                   // For order lookup
- createdAt: -1               // For date range queries
- isDeleted: 1                // For filtering deleted sales
- orderType: 1                // For dine-in/takeout queries
- {createdAt: -1, status: 1}  // Compound for date + status
```

#### Items Collection
```javascript
- name: 1           // For name searches
- currentStock: 1   // For low stock queries
- createdAt: -1     // For sorting
```

#### Products Collection
```javascript
- name: 1          // For name searches
- isActive: 1      // For active product queries
- price: 1         // For price-based queries
- createdAt: -1    // For sorting
```

#### Cash Drawers Collection
```javascript
- status: 1                   // For open/closed queries
- openedAt: -1               // For date queries
- closedAt: -1               // For closed drawer queries
- openedBy: 1                // For user-specific queries
- {openedAt: -1, status: 1}  // Compound for date + status
```

## 2. Data Archiving System

### Purpose
Move old data to archive collections to keep main collections lean and performant.

### Script: `lib/archiveOldData.js`

#### What it does:
- Finds completed sales older than 2 years
- Copies to `archived_sales`, `archived_sale_items`, `archived_cash_drawers`
- Optionally deletes from main collections (commented out by default)

#### Usage:
```bash
# Dry run (copies but doesn't delete)
node lib/archiveOldData.js

# To actually delete old data, uncomment the delete lines in the script
```

#### Recommendations:
- Run monthly or quarterly
- Test first on a backup
- Keep 2-3 years of data in main collections
- Archive older data for compliance

## 3. Database Monitoring

### Script: `lib/dbStats.js`

#### What it shows:
- Database size and storage usage
- Collection-level statistics
- Document counts per collection
- Storage projections
- Time to reach capacity

#### Usage:
```bash
node lib/dbStats.js
```

#### Output includes:
- Total database size
- Individual collection sizes
- Document counts
- Average document size
- Storage projections for free tier (512 MB)

#### When to run:
- Monthly to track growth
- Before archiving old data
- When planning upgrades

## 4. Query Optimization Best Practices

### Use lean() for read-only queries
```javascript
// Instead of:
const users = await User.find();

// Use:
const users = await User.find().lean();
```

### Select only needed fields
```javascript
// Instead of:
const users = await User.find();

// Use:
const users = await User.find().select('username role isActive');
```

### Use indexes in queries
```javascript
// Good - uses index on status
const sales = await Sale.find({ status: 'COMPLETED' });

// Good - uses compound index
const sales = await Sale.find({ 
  createdAt: { $gte: startDate },
  status: 'COMPLETED' 
}).sort({ createdAt: -1 });
```

### Limit results
```javascript
// Always use pagination
const sales = await Sale.find()
  .limit(100)
  .skip(page * 100)
  .sort({ createdAt: -1 });
```

## 5. Storage Projections

### Current Estimate:
- **Items (500)**: ~250 KB
- **Products (200)**: ~160 KB
- **Transactions (100/day)**: ~200 KB/day
- **Monthly Growth**: ~6 MB
- **Annual Growth**: ~73 MB

### Free Tier Timeline (512 MB):
- Current usage: 0.44 MB (0.1%)
- Time to full: ~7 years at current rate

### When to Upgrade:
- Approaching 400 MB (80% capacity)
- Transactions exceed 500/day
- Need more than 3 years of active data
- Require backups/disaster recovery

## 6. Maintenance Schedule

### Weekly
- Check open cash drawers
- Monitor parked sales

### Monthly
- Run `node lib/dbStats.js`
- Review storage growth
- Check for slow queries

### Quarterly
- Run `node lib/archiveOldData.js`
- Review archived data
- Update projections

### Annually
- Review retention policy
- Evaluate upgrade needs
- Optimize indexes

## 7. Performance Tips

### DO:
✅ Use indexes for frequently queried fields
✅ Archive old data regularly
✅ Use lean() for read-only operations
✅ Select only needed fields
✅ Implement pagination
✅ Monitor database size

### DON'T:
❌ Scan entire collections without indexes
❌ Load all documents into memory
❌ Keep unnecessary data
❌ Ignore slow queries
❌ Skip regular monitoring

## 8. Troubleshooting

### Slow Queries
1. Check if indexes exist: `db.collection.getIndexes()`
2. Use `.explain()` to analyze query plan
3. Add missing indexes

### High Storage Usage
1. Run `node lib/dbStats.js`
2. Identify large collections
3. Archive old data
4. Consider retention policy

### Out of Space
1. Run archiving immediately
2. Delete unnecessary data
3. Upgrade to paid tier ($9/month for 2GB)

## 9. Scripts Reference

```bash
# Check database statistics
node lib/dbStats.js

# Archive old data (2+ years)
node lib/archiveOldData.js

# Check MongoDB connection
node lib/checkUser.js

# Add name fields to users
node lib/addNameFields.js
```

## 10. MongoDB Atlas Tiers

### Free (M0)
- Storage: 512 MB
- RAM: Shared
- Cost: $0
- Best for: Development, small projects

### M2 ($9/month)
- Storage: 2 GB
- RAM: Shared
- Good for: Production, <1000 transactions/day

### M5 ($25/month)
- Storage: 5 GB
- RAM: 2 GB dedicated
- Good for: High traffic, >1000 transactions/day
