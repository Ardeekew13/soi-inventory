# Delete Duplicate Refunds in MongoDB

## Option 1: MongoDB Compass (GUI - Easiest)

1. Open MongoDB Compass
2. Connect to your database: `mongodb://localhost:27017`
3. Select your database (e.g., `soi-inventory`)
4. Click on `cashdrawers` collection
5. Find the open cash drawer (status: "OPEN")
6. Look in the `transactions` array
7. Manually delete duplicate REFUND entries that have:
   - Same `saleId`
   - Same `amount`
   - Same `description`
   - Similar timestamps (milliseconds apart)
8. Save the document

## Option 2: MongoDB Shell (mongosh)

```bash
# 1. Connect to MongoDB
mongosh

# 2. Switch to your database
use soi-inventory

# 3. View the cash drawer with duplicates
db.cashdrawers.findOne({ status: "OPEN" }, { transactions: 1 })

# 4. Remove duplicate refunds (keeps first occurrence)
db.cashdrawers.updateOne(
  { status: "OPEN" },
  {
    $set: {
      transactions: [
        // You'll need to manually copy all transactions except the duplicates
        // Or use the script below
      ]
    }
  }
)
```

## Option 3: Use the cleanup API (when server is running)

```bash
# Start server
npm run dev

# In another terminal, call the API
curl -X POST http://localhost:3000/api/cleanup-duplicates
```

## Identifying Duplicates

Based on your data, these are duplicates (delete the second one in each pair):

1. **Duplicate 1**: 
   - Keep: `_id: "694540efdb636df6c6d2090f"` (createdAt: 1766146287902)
   - DELETE: `_id: "694540efdb636df6c6d20914"` (createdAt: 1766146287906)
   - Both are: Refund for Sale ORD-20251219-0001-5BXV33

2. **Duplicate 2**:
   - Keep: `_id: "694541bfdb636df6c6d2098c"` (createdAt: 1766146495713)
   - DELETE: `_id: "694541bfdb636df6c6d20996"` (createdAt: 1766146495718)
   - Both are: Refund for Sale ORD-20251206-0001

## Quick MongoDB Shell Script

```javascript
mongosh

use soi-inventory

// Get the cash drawer
let drawer = db.cashdrawers.findOne({ status: "OPEN" });

// Remove duplicates by keeping only unique combinations
let seen = new Map();
let uniqueTransactions = drawer.transactions.filter(t => {
  if (t.type === "REFUND" || t.type === "VOID") {
    let key = `${t.type}_${t.saleId}_${t.amount}_${t.description}`;
    if (seen.has(key)) {
      console.log(`Removing duplicate: ${t._id} - ${t.description}`);
      return false; // Skip duplicate
    }
    seen.set(key, true);
  }
  return true; // Keep this transaction
});

// Update the drawer with unique transactions
db.cashdrawers.updateOne(
  { _id: drawer._id },
  { $set: { transactions: uniqueTransactions } }
);

console.log(`Removed ${drawer.transactions.length - uniqueTransactions.length} duplicates`);
```

Copy and paste the script above into mongosh to automatically remove all duplicates!
