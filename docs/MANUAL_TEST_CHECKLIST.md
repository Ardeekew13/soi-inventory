# Quick Manual Testing Checklist

Use this checklist for rapid manual testing of critical features.

## ✅ Pre-Testing Setup

- [ ] Database seeded with test data
- [ ] At least one user account (admin, manager, cashier)
- [ ] Shift schedule assigned to test user
- [ ] Some products and inventory items created
- [ ] Cash drawer can be opened

---

## 🔐 Authentication (5 min)

- [ ] Login with valid credentials → Success
- [ ] Login with invalid credentials → Error shown
- [ ] Logout → Returns to login page
- [ ] Access protected route without login → Redirected to login

---

## ⏰ Shift Management - CRITICAL: Late Tracking (10 min)

### Test Late Arrival Detection

**Scenario 1: On Time**
- [ ] Shift schedule: 8:00 AM start
- [ ] Start shift between 7:45 - 8:15 AM
- [ ] **Expected:** Status = "ON TIME"
- [ ] Check server console for debug logs

**Scenario 2: Late (15-120 min)**
- [ ] Current time: 8:30 AM (30 min after scheduled 8:00 AM)
- [ ] Click "Start Shift"
- [ ] Upload photo
- [ ] Submit
- [ ] **Expected:** 
  - Status = "LATE" ✅
  - System note: "Arrived 30 minutes late (scheduled: 08:00)" ✅
  - Check console logs for calculation details
- [ ] Verify in shift history table

**Scenario 3: Very Late (>120 min)**
- [ ] Current time: 11:00 AM (3 hours late)
- [ ] Start shift
- [ ] **Expected:** 
  - Status = "HALF_DAY"
  - System note: "Arrived 3h 0m late"

**Other Events:**
- [ ] Start lunch late → System note added
- [ ] End lunch late → System note added
- [ ] End shift early → System note added

---

## 🛒 Point of Sale - CRITICAL: Refetch & Responsive (15 min)

### Product Addition Refetch Test
- [ ] Open POS page in one tab
- [ ] Open Product page in another tab
- [ ] Add new product "Test Item - ₱99"
- [ ] **Go back to POS tab**
- [ ] **Expected:** New product appears immediately without manual refresh ✅

### Cart Operations
- [ ] Add product to cart → Appears in cart section
- [ ] Click same product again → Quantity increases
- [ ] Change quantity in cart → Total updates
- [ ] Search for product → Filters correctly
- [ ] Press ESC → Cart clears

### Park & Retrieve
- [ ] Add items to cart
- [ ] Select "Dine In" + Table 5
- [ ] Press F2 (or click Park) → Success message
- [ ] Cart clears
- [ ] Press F4 (or click Parked Orders)
- [ ] Click "Load Order" → Cart restores with items + table

### Checkout Flow
- [ ] Add items (total: ₱270)
- [ ] Press F3 (or click Checkout)
- [ ] Select "Cash"
- [ ] Click ₱500 bill button
- [ ] Change shows: ₱230
- [ ] Select discount (if available)
- [ ] Click "Complete Payment"
- [ ] Receipt displays
- [ ] Cart clears
- [ ] **Go to Transactions page**
- [ ] **Expected:** New sale appears immediately ✅

### Responsive Design Test
- [ ] Desktop (1024px+):
  - Products: 60% width
  - Cart: 40% width
  - All table columns visible
  - Keyboard shortcuts hint visible
  
- [ ] Tablet (768px):
  - Products: Full width, stacked
  - Cart: Below products
  - Table shows fewer columns
  - No keyboard hint
  
- [ ] Mobile (375px):
  - Product cards: 2 columns
  - Buttons: Full width, smaller size
  - Fonts: Smaller (12-14px)
  - Table: Minimal columns only

### Resize Test
- [ ] Start at desktop width
- [ ] Slowly resize to mobile
- [ ] **Expected:** Components adjust smoothly in real-time ✅
- [ ] No layout breaks or flickering

---

## 📦 Product Management - CRITICAL: Decimal Quantities (5 min)

### Add Product with Ingredients
- [ ] Click "Add Product"
- [ ] Name: "Special Dish"
- [ ] Price: 250
- [ ] Click "Add Ingredient"
- [ ] Select ingredient "Rice"
- [ ] Enter quantity: **0.25** (decimal)
- [ ] Try entering: **0.01** → Should accept ✅
- [ ] Try entering: **0.5** → Should accept ✅
- [ ] Save product
- [ ] **Expected:** Product saved with decimal ingredient quantities

### Missing Ingredients Warning
- [ ] Archive an inventory item
- [ ] Try to sell product using that item
- [ ] **Expected:** Warning modal, product NOT added to cart

---

## 📊 Transaction Management - CRITICAL: Void Refetch (5 min)

### Void Transaction
- [ ] Open Transactions page
- [ ] Note the number of transactions
- [ ] Click void icon on a transaction
- [ ] Enter reason: "Test void"
- [ ] Confirm
- [ ] **Expected:** 
  - Transaction status changes to "VOIDED" immediately ✅
  - List updates without manual refresh ✅
  - No delay or stale data

### Refund Transaction
- [ ] Click refund icon
- [ ] Enter reason
- [ ] Confirm
- [ ] **Expected:** Status = "REFUNDED", list updates immediately ✅

---

## 💰 Cash Drawer (5 min)

- [ ] Open drawer with ₱5,000
- [ ] Make sale of ₱120
- [ ] Balance shows: ₱5,120
- [ ] Cash out ₱500
- [ ] Balance shows: ₱4,620
- [ ] Close drawer
- [ ] Enter counted: ₱4,620
- [ ] No discrepancy
- [ ] Drawer status: CLOSED
- [ ] POS disabled until new drawer opened

---

## 🌐 Offline Mode (Optional - 10 min)

- [ ] Disconnect internet
- [ ] "Offline" indicator appears
- [ ] Make a sale
- [ ] Sale saved locally
- [ ] Reconnect internet
- [ ] Automatic sync starts
- [ ] Sale appears on server
- [ ] Offline indicator disappears

---

## 📱 Mobile Testing (10 min)

Test on actual mobile device or Chrome DevTools mobile view:

- [ ] Login on mobile
- [ ] Navigate to POS
- [ ] All buttons accessible
- [ ] Product cards display correctly (2 columns)
- [ ] Can add to cart
- [ ] Can checkout
- [ ] Touch interactions work
- [ ] No horizontal scroll
- [ ] Text readable (not too small)

---

## 🐛 Bug Check

Common issues to watch for:

- [ ] No console errors (F12)
- [ ] No "bodyStyle is deprecated" warnings
- [ ] Tables paginate correctly
- [ ] Images load properly
- [ ] Modals close correctly
- [ ] Forms validate properly
- [ ] Dates display in correct timezone
- [ ] Currency formatting consistent (₱)

---

## 🎯 Critical Issues Found

Document any failures here:

**Issue 1:**
- Feature: ___________
- Expected: ___________
- Actual: ___________
- Steps to reproduce: ___________

**Issue 2:**
- Feature: ___________
- Expected: ___________
- Actual: ___________
- Steps to reproduce: ___________

---

## ✅ Sign-Off

**Tested By:** _________________  
**Date:** _________________  
**Time Spent:** _______ minutes  
**Pass Rate:** _____ / _____ tests  

**Overall Status:** [ ] PASS  [ ] FAIL  [ ] NEEDS FIXES

**Notes:**
_____________________________________________
_____________________________________________
_____________________________________________

---

## 🚀 Quick Test (5 min version)

If you only have 5 minutes, test these CRITICAL features:

1. [ ] Login
2. [ ] Start shift LATE → Check status is "LATE" not "ON TIME"
3. [ ] Add product → Appears in POS immediately
4. [ ] Complete sale → Appears in transactions immediately
5. [ ] Void sale → List updates immediately
6. [ ] Resize browser → Components adjust smoothly
7. [ ] Add product with 0.25 quantity ingredient → Saves correctly

**If all 7 pass → Core functionality working! ✅**
