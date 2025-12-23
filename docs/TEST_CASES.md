# Test Cases and Use Cases

## Table of Contents
1. [Authentication & Authorization](#authentication--authorization)
2. [Shift Management](#shift-management)
3. [Point of Sale (POS)](#point-of-sale-pos)
4. [Product Management](#product-management)
5. [Inventory Management](#inventory-management)
6. [Transaction Management](#transaction-management)
7. [Cash Drawer](#cash-drawer)
8. [Settings & Configuration](#settings--configuration)
9. [Offline Functionality](#offline-functionality)
10. [Responsive Design](#responsive-design)

---

## Authentication & Authorization

### TC-AUTH-001: User Login
**Preconditions:** User account exists in the system  
**Steps:**
1. Navigate to login page
2. Enter valid username
3. Enter valid password
4. Click "Login" button

**Expected Result:** User is authenticated and redirected to dashboard

**Test Data:**
- Valid username: admin/manager/cashier
- Valid password: user's password

---

### TC-AUTH-002: Invalid Login
**Steps:**
1. Navigate to login page
2. Enter invalid username or password
3. Click "Login" button

**Expected Result:** Error message displayed, user remains on login page

---

### TC-AUTH-003: Role-Based Access
**Steps:**
1. Login as CASHIER role
2. Try to access Settings page
3. Try to access User Management

**Expected Result:** "No Permission" page shown for restricted areas

---

## Shift Management

### TC-SHIFT-001: Start Shift On Time
**Preconditions:** 
- User has shift schedule assigned (e.g., 08:00 - 17:00)
- Current time is between 07:45 - 08:15

**Steps:**
1. Navigate to Shift Management page
2. Click "Start Shift" button
3. Upload selfie photo
4. Submit

**Expected Result:** 
- Shift started successfully
- Attendance status: "ON TIME"
- Shift card shows "In Progress"

---

### TC-SHIFT-002: Start Shift Late (15-120 minutes)
**Preconditions:** 
- User has shift schedule (start time: 08:00)
- Current time is 08:30 (30 minutes late)

**Steps:**
1. Navigate to Shift Management page
2. Click "Start Shift" button
3. Upload selfie photo
4. Submit

**Expected Result:** 
- Shift started successfully
- Attendance status: "LATE"
- System note: "Arrived 30 minutes late (scheduled: 08:00)"
- Photo uploaded successfully

---

### TC-SHIFT-003: Start Shift Very Late (>120 minutes)
**Preconditions:** 
- User has shift schedule (start time: 08:00)
- Current time is 11:00 (3 hours late)

**Steps:**
1. Navigate to Shift Management page
2. Click "Start Shift" button
3. Upload selfie photo
4. Submit

**Expected Result:** 
- Shift started successfully
- Attendance status: "HALF_DAY"
- System note: "Arrived 3h 0m late (scheduled: 08:00)"

---

### TC-SHIFT-004: Lunch Break On Time
**Preconditions:** Shift is active

**Steps:**
1. Click "Start Lunch Break" at scheduled time (e.g., 12:00)
2. Upload photo
3. Submit

**Expected Result:** 
- Lunch break started
- Timer shows break duration
- System note: none (on time)

---

### TC-SHIFT-005: Lunch Break Late
**Preconditions:** 
- Shift is active
- Scheduled lunch: 12:00
- Current time: 12:45

**Steps:**
1. Click "Start Lunch Break"
2. Upload photo
3. Submit

**Expected Result:** 
- Lunch break started
- System note: "Lunch break started 45 minutes late (scheduled: 12:00)"

---

### TC-SHIFT-006: End Shift
**Preconditions:** Shift is active, lunch break completed

**Steps:**
1. Click "End Shift"
2. Upload photo
3. Submit

**Expected Result:** 
- Shift ends successfully
- Total hours calculated (excluding lunch break)
- Status changes to "COMPLETED"
- Shift card shows in history

---

### TC-SHIFT-007: View Shift History
**Steps:**
1. Navigate to Shift Management
2. Scroll down to "My Shift History" section

**Expected Result:** 
- Table shows all past shifts
- Displays: Date, Start Time, End Time, Total Hours, Attendance Status
- Shows system notes for late arrivals/departures

---

## Point of Sale (POS)

### TC-POS-001: Add Product to Cart
**Preconditions:** Products exist in system, cash drawer is open

**Steps:**
1. Navigate to POS page
2. Click on a product card
3. Verify product added to cart

**Expected Result:** 
- Product appears in cart section
- Quantity shows as 1
- Total amount updates

---

### TC-POS-002: Increase Product Quantity
**Steps:**
1. Add product to cart
2. Click same product again or modify quantity in cart

**Expected Result:** 
- Quantity increases
- Total amount updates correctly

---

### TC-POS-003: Search Products
**Steps:**
1. Type product name in search box
2. Press Enter or click search

**Expected Result:** 
- Product cards filter to show matching items only
- Non-matching products hidden

---

### TC-POS-004: Park Sale (Dine-In)
**Preconditions:** Items in cart

**Steps:**
1. Select "Dine In" order type
2. Click "Select Table"
3. Choose table number (e.g., Table 5)
4. Click "Park Order"

**Expected Result:** 
- Sale parked successfully
- Cart clears
- Parked orders count increases
- Success message displayed

---

### TC-POS-005: Park Sale (Take Out)
**Preconditions:** Items in cart

**Steps:**
1. Select "Take Out" order type
2. Click "Park Order"

**Expected Result:** 
- Sale parked without table number
- Cart clears
- Parked orders count increases

---

### TC-POS-006: Retrieve Parked Order
**Steps:**
1. Click "Parked Orders" button (or F4)
2. Select a parked sale from drawer
3. Click "Load Order"

**Expected Result:** 
- Cart populates with parked items
- Order type and table number restored
- Drawer closes

---

### TC-POS-007: Checkout with Cash
**Preconditions:** Items in cart, total is ₱500

**Steps:**
1. Click "Checkout & Pay" (or F3)
2. Select "Cash" payment method
3. Click ₱1000 bill button
4. Verify amount paid shows ₱1000
5. Verify change shows ₱500
6. Click "Complete Payment"

**Expected Result:** 
- Receipt prints/displays
- Cart clears
- Sale saved to transactions
- Cash drawer balance increases by ₱500

---

### TC-POS-008: Checkout with Discount
**Preconditions:** Items in cart, discount configured (e.g., "Senior Citizen 20%")

**Steps:**
1. Click "Checkout & Pay"
2. Select discount from dropdown
3. Verify total amount updates
4. Enter payment amount
5. Complete payment

**Expected Result:** 
- Discount applied correctly
- Final amount shows discounted price
- Receipt shows discount details

---

### TC-POS-009: Checkout with Service Charge
**Preconditions:** Service charge configured (e.g., "Service Charge 10%")

**Steps:**
1. Click "Checkout & Pay"
2. Select service charge from dropdown
3. Verify total amount increases
4. Complete payment

**Expected Result:** 
- Service charge added correctly
- Receipt shows service charge

---

### TC-POS-010: Send to Kitchen
**Preconditions:** Dine-in order with items

**Steps:**
1. Add items to cart
2. Click "Send to Kitchen" button
3. View kitchen receipt modal

**Expected Result:** 
- Kitchen receipt displays
- Shows table number
- Lists all items with quantities
- Print button available

---

### TC-POS-011: Print Bill (Before Payment)
**Preconditions:** Items in cart

**Steps:**
1. Click "Print Bill" button

**Expected Result:** 
- Bill preview displayed
- Shows all items, quantities, prices
- Shows subtotal (no payment details yet)

---

### TC-POS-012: Void Parked Sale
**Preconditions:** Parked sale exists

**Steps:**
1. Open Parked Orders drawer
2. Click void icon on a parked sale
3. Enter reason: "Customer cancelled"
4. Confirm void

**Expected Result:** 
- Parked sale removed from list
- Voided sale appears in transaction history with status "VOIDED"

---

### TC-POS-013: Clear Cart
**Steps:**
1. Add multiple items to cart
2. Press ESC key or click clear button

**Expected Result:** 
- Cart empties completely
- Total shows ₱0.00

---

### TC-POS-014: Product with Missing Ingredients
**Preconditions:** Product has inactive/missing ingredients

**Steps:**
1. Click on product with missing ingredients

**Expected Result:** 
- Warning modal appears
- Lists missing ingredient names
- Message: "Please restore the inactive ingredients"
- Product NOT added to cart

---

### TC-POS-015: Keyboard Shortcuts
**Steps:**
1. Press F2 (Park)
2. Press F3 (Pay)
3. Press F4 (Parked Orders)
4. Press ESC (Clear Cart)

**Expected Result:** Each shortcut triggers corresponding action

---

## Product Management

### TC-PROD-001: Add New Product
**Preconditions:** Logged in with product management permission

**Steps:**
1. Navigate to Product page
2. Click "Add Product"
3. Fill in:
   - Name: "Fried Rice"
   - Price: 120.00
   - Category: "Main Course"
   - Description: "Delicious fried rice"
4. Click "Add Product"

**Expected Result:** 
- Product created successfully
- Appears in product list
- **CRITICAL: POS page shows new product immediately (refetch)**

---

### TC-PROD-002: Add Product with Ingredients
**Steps:**
1. Click "Add Product"
2. Fill product details
3. Click "Add Ingredient"
4. Select ingredient from inventory
5. Enter quantity: 0.25 (decimal support)
6. Save product

**Expected Result:** 
- Product saved with ingredient link
- Decimal quantities accepted (0.01 precision)
- When product sold, ingredient quantity deducted

---

### TC-PROD-003: Edit Product
**Steps:**
1. Find product in list
2. Click edit icon
3. Modify price: 150.00
4. Save changes

**Expected Result:** 
- Product updated
- New price reflects in POS immediately

---

### TC-PROD-004: Archive Product
**Steps:**
1. Click archive icon on product
2. Confirm archive

**Expected Result:** 
- Product removed from POS view
- Still visible in product list (with archive indicator)
- Cannot be sold

---

### TC-PROD-005: Upload Product Image
**Steps:**
1. Edit product
2. Click image upload area
3. Select image file
4. Save

**Expected Result:** 
- Image uploaded successfully
- Displays in product card

---

## Inventory Management

### TC-INV-001: Add Inventory Item
**Steps:**
1. Navigate to Inventory page
2. Click "Add Item"
3. Fill:
   - Name: "Rice"
   - Unit: "kg"
   - Initial quantity: 50
   - Price: 45.00
4. Save

**Expected Result:** 
- Item added to inventory
- Quantity shows 50 kg
- Active status

---

### TC-INV-002: Update Inventory Quantity
**Steps:**
1. Find item in list
2. Click edit
3. Change quantity to 75
4. Save

**Expected Result:** 
- Quantity updated
- History log created

---

### TC-INV-003: Low Stock Alert
**Preconditions:** Item quantity ≤ 10 units

**Expected Result:** 
- Item shown with warning indicator
- Dashboard shows low stock alert

---

### TC-INV-004: Deactivate Inventory Item
**Steps:**
1. Click archive/deactivate on item
2. Confirm

**Expected Result:** 
- Item marked inactive
- Not available for new product ingredients
- Products using this ingredient show warning

---

### TC-INV-005: Search Inventory
**Steps:**
1. Enter "Rice" in search box
2. Press Enter

**Expected Result:** Only matching items displayed

---

## Transaction Management

### TC-TXN-001: View Sales History
**Steps:**
1. Navigate to Transactions page
2. View sales list

**Expected Result:** 
- All completed sales displayed
- Shows: Date, Order #, Type, Payment Method, Total, Status

---

### TC-TXN-002: Filter by Date Range
**Steps:**
1. Select date range (e.g., last 7 days)
2. Apply filter

**Expected Result:** Only sales within date range shown

---

### TC-TXN-003: Void Transaction
**Steps:**
1. Find completed sale
2. Click void icon
3. Enter reason: "Wrong order"
4. Confirm

**Expected Result:** 
- Transaction marked as VOIDED
- Amount refunded to cash drawer
- **CRITICAL: Sales list updates immediately (refetch)**

---

### TC-TXN-004: Refund Transaction
**Steps:**
1. Find completed sale
2. Click refund icon
3. Enter reason
4. Confirm

**Expected Result:** 
- Transaction marked as REFUNDED
- Cash drawer balance adjusted
- **CRITICAL: Sales list updates immediately (refetch)**

---

### TC-TXN-005: Export Sales Report
**Steps:**
1. Select date range
2. Click "Export" button
3. Choose format (Excel/PDF)

**Expected Result:** 
- File downloads
- Contains all sales data for period

---

### TC-TXN-006: View Transaction Details
**Steps:**
1. Click on a transaction
2. View details modal

**Expected Result:** 
- Shows all items purchased
- Payment details
- Timestamps
- User who processed

---

## Cash Drawer

### TC-CASH-001: Open Cash Drawer
**Preconditions:** No cash drawer currently open

**Steps:**
1. Navigate to Cash Drawer page
2. Click "Open Drawer"
3. Enter opening balance: 5000
4. Confirm

**Expected Result:** 
- Cash drawer opens
- Status shows "OPEN"
- Opening balance recorded
- POS operations enabled

---

### TC-CASH-002: Add Cash (Cash In)
**Preconditions:** Drawer is open

**Steps:**
1. Click "Cash In"
2. Enter amount: 1000
3. Enter reason: "Bank withdrawal"
4. Submit

**Expected Result:** 
- Current balance increases by 1000
- Transaction logged

---

### TC-CASH-003: Remove Cash (Cash Out)
**Steps:**
1. Click "Cash Out"
2. Enter amount: 500
3. Enter reason: "Supplies purchase"
4. Submit

**Expected Result:** 
- Current balance decreases by 500
- Transaction logged

---

### TC-CASH-004: Close Cash Drawer
**Preconditions:** Drawer is open, shift ended

**Steps:**
1. Click "Close Drawer"
2. Enter actual counted cash: 5450
3. Review expected vs actual
4. Confirm close

**Expected Result:** 
- Drawer status: CLOSED
- Variance calculated (if any)
- Final report generated
- POS disabled until new drawer opened

---

### TC-CASH-005: Cash Drawer Discrepancy
**Steps:**
1. Close drawer
2. Enter counted amount different from expected
3. Review discrepancy alert

**Expected Result:** 
- System highlights over/short amount
- Requires confirmation to proceed
- Logged for audit

---

## Settings & Configuration

### TC-SET-001: Create Shift Schedule
**Steps:**
1. Navigate to Settings > Shift Schedules
2. Click "Add Schedule"
3. Fill:
   - Name: "Morning Shift"
   - Start: 08:00
   - Lunch Start: 12:00
   - Lunch End: 13:00
   - End: 17:00
4. Save

**Expected Result:** Schedule created and available for user assignment

---

### TC-SET-002: Assign Shift Schedule to User
**Steps:**
1. Navigate to User Management
2. Edit user
3. Select shift schedule
4. Save

**Expected Result:** User's shift times updated

---

### TC-SET-003: Create Discount
**Steps:**
1. Navigate to Settings > Discounts
2. Click "Add Discount"
3. Fill:
   - Title: "Senior Citizen"
   - Value: 20 (%)
4. Save

**Expected Result:** Discount available in POS checkout

---

### TC-SET-004: Create Service Charge
**Steps:**
1. Navigate to Settings > Service Charges
2. Add new service charge
3. Fill:
   - Title: "Service Charge"
   - Value: 10 (%)
4. Save

**Expected Result:** Service charge available in POS checkout

---

### TC-SET-005: Configure Table Numbers
**Steps:**
1. Navigate to Settings
2. Add table numbers (1-20)
3. Save configuration

**Expected Result:** Tables available for dine-in orders

---

## Offline Functionality

### TC-OFF-001: Offline Sale
**Preconditions:** Network disconnected

**Steps:**
1. Disconnect from internet
2. Add items to cart
3. Complete checkout

**Expected Result:** 
- Sale processed locally
- Saved to IndexedDB
- "Offline" indicator visible
- Sync status shows pending

---

### TC-OFF-002: Sync When Online
**Preconditions:** Offline sales exist

**Steps:**
1. Reconnect to internet
2. Observe sync status

**Expected Result:** 
- Automatic sync initiated
- Pending sales uploaded to server
- Sync status: "Synced"
- Local data cleared after successful sync

---

### TC-OFF-003: Offline Conflict Resolution
**Steps:**
1. Create sale offline
2. Another user modifies same product online
3. Reconnect and sync

**Expected Result:** 
- Conflict detected
- User notified
- Resolution options provided

---

## Responsive Design

### TC-RESP-001: Mobile View - POS
**Steps:**
1. Resize browser to 375px width (mobile)
2. Navigate to POS page

**Expected Result:** 
- Product cards show 2 columns
- Cart section stacks below products
- Buttons full-width
- Font sizes reduced appropriately
- All features accessible

---

### TC-RESP-002: Tablet View - POS
**Steps:**
1. Resize browser to 768px width (tablet)
2. Navigate to POS page

**Expected Result:** 
- Product cards show 3-4 columns
- Cart visible side-by-side
- Table columns responsive
- Moderate font sizes

---

### TC-RESP-003: Desktop View - POS
**Steps:**
1. View at 1024px+ width
2. Navigate to POS page

**Expected Result:** 
- Products section: 60% width
- Cart section: 40% width
- All columns visible in tables
- Full pagination
- Keyboard shortcuts hint visible

---

### TC-RESP-004: Resize Reactivity
**Steps:**
1. Start at desktop width
2. Slowly resize to mobile
3. Observe component changes

**Expected Result:** 
- Components adjust smoothly using useMediaQuery
- No flickering or layout breaks
- Responsive breakpoints trigger correctly (768px, 1024px)

---

## Performance & Edge Cases

### TC-PERF-001: Large Cart (50+ items)
**Steps:**
1. Add 50 different products to cart

**Expected Result:** 
- UI remains responsive
- Scroll works smoothly
- Calculations accurate

---

### TC-PERF-002: Product Search with 1000+ Products
**Steps:**
1. Search in large product database

**Expected Result:** 
- Results appear within 1 second
- Pagination works correctly

---

### TC-EDGE-001: Zero Inventory Sale
**Steps:**
1. Try to sell product when ingredient quantity is 0

**Expected Result:** 
- Warning shown
- Sale prevented
- Notification to restock

---

### TC-EDGE-002: Negative Quantity Prevention
**Steps:**
1. Try to enter negative quantity in cart

**Expected Result:** Minimum value enforced (1)

---

### TC-EDGE-003: Concurrent Sales
**Steps:**
1. Two users sell last unit of same product simultaneously

**Expected Result:** 
- One sale succeeds
- Other gets "out of stock" error
- Inventory accurately decremented

---

## Security Tests

### TC-SEC-001: Session Timeout
**Steps:**
1. Login
2. Wait for session timeout period
3. Try to perform action

**Expected Result:** Redirected to login page

---

### TC-SEC-002: SQL Injection Prevention
**Steps:**
1. Enter: `'; DROP TABLE products; --` in search field
2. Submit

**Expected Result:** Input sanitized, no database damage

---

### TC-SEC-003: XSS Prevention
**Steps:**
1. Enter: `<script>alert('XSS')</script>` in product name
2. Save and view

**Expected Result:** Script not executed, displayed as text

---

## Automated Test Template

```typescript
// Example Jest test structure
describe('POS Module', () => {
  describe('TC-POS-001: Add Product to Cart', () => {
    it('should add product to cart when clicked', async () => {
      // Arrange
      const product = { id: '1', name: 'Fried Rice', price: 120 };
      
      // Act
      await addToCart(product);
      
      // Assert
      expect(cart).toContainEqual({ ...product, quantity: 1 });
      expect(totalAmount).toBe(120);
    });
  });
});
```

---

## Test Execution Checklist

- [ ] All authentication tests passed
- [ ] Shift management late tracking working
- [ ] POS refetch queries working
- [ ] Decimal quantities in ingredients working
- [ ] Responsive design on all breakpoints
- [ ] Offline sync functioning
- [ ] Cash drawer calculations accurate
- [ ] All mutations refetching data
- [ ] No console errors or warnings
- [ ] Performance acceptable on large datasets

---

**Last Updated:** December 23, 2025  
**Version:** 1.0  
**Tester:** _________________  
**Date:** _________________
