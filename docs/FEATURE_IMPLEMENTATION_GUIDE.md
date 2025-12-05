# Feature Implementation Guide - Transaction & Export Features

## ✅ Completed Features

### 1. Void/Refund Returns Inventory ✅
**Status:** DEPLOYED
**What it does:** When you void a transaction, the system now:
- Returns all ingredients back to inventory
- Updates item quantities automatically
- Shows confirmation message
- Still marks transaction as VOID for audit trail

**How to use:**
1. Go to Transactions page
2. Click "Void" button on any completed transaction
3. Choose "Void" or "Refund" (both return stock now)
4. Verify with password
5. Ingredients are automatically returned to inventory

---

## 🔨 Remaining Features to Implement

### 2. Change Item Functionality
**Goal:** Allow changing products in an already-completed transaction

**Implementation needed:**
1. Create `changeItem` mutation in GraphQL
2. Add UI button in transaction view modal
3. Logic:
   - Return original product's ingredients to inventory
   - Deduct new product's ingredients from inventory
   - Recalculate totals (price difference)
   - Update cash drawer if needed
   - Log the change for audit

**Files to modify:**
- `app/api/graphql/resolvers/salesResolver.ts` - Add mutation
- `graphql/inventory/transactions.ts` - Add GraphQL definition
- `component/transaction/dialog/viewTransactionModal.tsx` - Add UI

---

### 3. Adjust Sales Reports (Exclude Voided)
**Goal:** Sales reports should not include voided transactions

**Implementation needed:**
1. Update dashboard sales query to filter out VOID status
2. Update transaction list filters
3. Show voided transactions in separate tab/section

**Files to modify:**
- `app/api/graphql/resolvers/salesResolver.ts` - Update `saleReport` query
- `app/(main)/dashboard/page.tsx` - Adjust calculations

---

### 4. Excel Export - Transactions
**Goal:** Export all transactions to Excel with sales report

**Implementation needed:**
1. Install xlsx library (already installed: `xlsx@0.18.5` ✅)
2. Create export function in transactions page
3. Include columns:
   - Order No, Date, Type, Table, Items, Total, Status, Voided Reason
4. Add summary sheet with totals

**Files to create/modify:**
- `utils/export-transactions.tsx` - Export function
- `app/(main)/transaction/page.tsx` - Add export button

**Code example:**
```typescript
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

export const exportTransactionsToExcel = (transactions: Sale[]) => {
  const worksheet = XLSX.utils.json_to_sheet(
    transactions.map(t => ({
      'Order No': t.orderNo,
      'Date': new Date(t.createdAt).toLocaleDateString(),
      'Type': t.orderType,
      'Table': t.tableNumber || 'N/A',
      'Total': t.totalAmount,
      'Status': t.status,
      'Items': t.saleItems.length
    }))
  );
  
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Transactions');
  
  const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
  const data = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  
  saveAs(data, `transactions_${new Date().toISOString().split('T')[0]}.xlsx`);
};
```

---

### 5. Excel Export - Inventory
**Goal:** Export all inventory items to Excel

**Files to modify:**
- `app/(main)/inventory/page.tsx` - Add export button
- Create similar export function as above

**Columns to include:**
- Item Name, Category, Quantity, Unit, Low Stock Alert, Created Date

---

### 6. Excel Export - Products
**Goal:** Export all products with ingredients to Excel

**Files to modify:**
- `app/(main)/product/page.tsx` - Add export button

**Columns to include:**
- Product Name, Price, Ingredients (comma-separated), Created Date

---

### 7. Filter Products by Ingredient
**Goal:** Search which products use a specific ingredient

**Implementation needed:**
1. Add search/filter UI in products page
2. Create GraphQL query to search products by ingredient
3. Display results

**GraphQL Query example:**
```graphql
query ProductsByIngredient($itemId: ID!) {
  productsByIngredient(itemId: $itemId) {
    _id
    name
    price
    ingredientsUsed {
      item {
        name
      }
      quantityUsed
    }
  }
}
```

**Resolver:**
```typescript
productsByIngredient: async (_: unknown, { itemId }: { itemId: string }) => {
  const products = await Product.find({
    'ingredientsUsed.itemId': itemId
  }).populate('ingredientsUsed.item');
  
  return products;
}
```

---

## Priority Order

1. ✅ **Void returns stock** - DONE
2. **Excel exports** - Quick wins, high value
3. **Filter by ingredient** - Useful feature
4. **Change item** - Complex, requires careful testing
5. **Adjust reports** - Important for accuracy

---

## Quick Start for Next Features

To implement Excel export for transactions NOW:

1. The `xlsx` library is already installed
2. The `file-saver` library is already installed
3. Copy the export function example above
4. Add a button to the transactions page
5. Test with some sample data

Would you like me to implement any of these features next?
