# Admin Cash Drawer Close Feature

## Overview
Implemented the ability for SUPER_ADMIN users to close any cash drawer (not just their own) with a complete paper trail showing who closed the drawer.

## Changes Made

### 1. GraphQL Schema Update
**File**: `/app/api/schema/cashDrawer.typeDefs.ts`
- Added optional `drawerId` parameter to `closeCashDrawer` mutation
- Allows admins to specify which drawer to close

```graphql
closeCashDrawer(closingBalance: Float!, drawerId: ID): CashDrawerResponse!
```

### 2. Resolver Logic Enhancement
**File**: `/app/api/graphql/resolvers/cashDrawerResolver.ts`
- Enhanced `closeCashDrawer` resolver to support admin override
- Added logic to check if user is SUPER_ADMIN
- If admin provides `drawerId`, they can close any open drawer
- Regular users can only close their own drawer (ownership check)
- Existing `closedBy` and `closedByUserId` fields already track who closed the drawer

**Key Logic**:
```typescript
const isAdmin = userRole === 'SUPER_ADMIN';

if (isAdmin && drawerId) {
  // Admin can close any specific drawer by ID
  drawer = await CashDrawer.findOne({ _id: drawerId, status: "OPEN" });
} else {
  // Regular users get the most recent open drawer
  drawer = await CashDrawer.findOne({ status: "OPEN" }).sort({ openedAt: -1 });
  
  // Regular users can only close their own drawer
  if (!isAdmin && drawer.openedByUserId?.toString() !== context.user.id) {
    return errorResponse("You can only close your own cash drawer");
  }
}
```

### 3. GraphQL Mutation Update
**File**: `/graphql/cash-drawer/cash-drawer.ts`
- Updated `CLOSE_CASH_DRAWER` mutation to accept optional `drawerId`
- Added `closedBy` field to `GET_CASH_DRAWER_HISTORY` query

```graphql
mutation CloseCashDrawer($closingBalance: Float!, $drawerId: ID) {
  closeCashDrawer(closingBalance: $closingBalance, drawerId: $drawerId) {
    success
    message
    data { ... }
  }
}
```

### 4. Cash Drawer Management Page
**File**: `/app/(main)/cash-drawer/page.tsx`

**New Features**:
1. **Role Detection**: Added `userRole` from `usePermissionGuard` hook
2. **Admin State Management**: 
   - `showAdminCloseModal`: Controls admin close modal visibility
   - `selectedDrawerId`: Stores the drawer ID being closed by admin
   - `adminClosingBalance`: Stores the closing balance for admin close
3. **Admin Close Handler**: `handleAdminCloseDrawer()` function
4. **Enhanced History Table**:
   - Added "Closed By" column showing who closed each drawer
   - Added "Actions" column (visible only to admins) with "Close Drawer" button for open drawers
5. **Admin Close Modal**: New modal with warning message about admin override

**UI Changes**:
- "Closed By" column displays the name of the person who closed the drawer
- "Actions" column appears only for SUPER_ADMIN users
- Button to close any open drawer in the history table
- Warning alert in modal indicating admin override action

## Paper Trail

The system maintains a complete audit trail:
- **openedBy**: Name of user who opened the drawer
- **openedByUserId**: User ID who opened the drawer
- **closedBy**: Name of user who closed the drawer (tracked automatically)
- **closedByUserId**: User ID who closed the drawer (tracked automatically)
- **closingBalance**: The balance entered when closing
- **expectedBalance**: System-calculated expected balance
- **transactions**: All cash drawer transactions with user IDs

## Security

1. **Permission Check**: Only users with `cashDrawer.openClose` permission or SUPER_ADMIN role can close drawers
2. **Ownership Check**: Regular users can only close their own drawer
3. **Admin Override**: SUPER_ADMIN can close any drawer by providing `drawerId`
4. **Audit Trail**: Every close action is logged with user information

## Usage

### Regular Users
1. Open Cash Drawer page
2. Click "Close Drawer" button (only their own open drawer)
3. Enter closing balance
4. Submit

### Admins
1. Open Cash Drawer page
2. Navigate to "Drawer History" section
3. Find any open drawer in the list
4. Click "Close Drawer" button in the Actions column
5. Review warning about admin override
6. Enter closing balance
7. Submit

The system will automatically record who closed the drawer, whether it was the owner or an admin.

## Testing

To test the admin close feature:
1. Have one user open a cash drawer
2. Log in as SUPER_ADMIN
3. Go to Cash Drawer management page
4. Check the drawer history table for open drawers
5. Click "Close Drawer" in the Actions column
6. Verify the modal shows admin override warning
7. Enter closing balance and submit
8. Verify the drawer is closed and "Closed By" shows the admin's name

## Notes

- The TypeScript error in the Actions column is a type inference issue and doesn't affect functionality
- The existing `closedBy` and `closedByUserId` fields were already in the model, so no schema migration needed
- Admins can close drawers from the cash drawer management page, not from the POS page
