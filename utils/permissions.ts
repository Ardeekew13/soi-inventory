// Centralized permission configuration
// This file defines all modules and their associated actions in the system

export type PermissionAction = 
  | 'view'
  | 'addEdit'
  | 'delete'
  | 'void'
  | 'changeItem'
  | 'refund'
  | 'openClose'
  | 'cashInOut'
  | 'manageUsers'
  | 'managePermissions';

export interface ModulePermission {
  key: string;
  label: string;
  actions: {
    key: PermissionAction;
    label: string;
    description?: string;
  }[];
}

export const PERMISSION_MODULES: ModulePermission[] = [
  {
    key: 'dashboard',
    label: 'Dashboard',
    actions: [
      { key: 'view', label: 'View Dashboard', description: 'View dashboard page and statistics' },
    ],
  },
  {
    key: 'inventory',
    label: 'Inventory',
    actions: [
      { key: 'view', label: 'View Inventory', description: 'View inventory items list' },
      { key: 'addEdit', label: 'Add/Edit Items', description: 'Create and edit inventory items' },
      { key: 'delete', label: 'Delete Items', description: 'Delete inventory items' },
    ],
  },
  {
    key: 'product',
    label: 'Product',
    actions: [
      { key: 'view', label: 'View Products', description: 'View products list' },
      { key: 'addEdit', label: 'Add/Edit Products', description: 'Create and edit products' },
      { key: 'delete', label: 'Delete Products', description: 'Delete products' },
    ],
  },
  {
    key: 'pointOfSale',
    label: 'Point of Sale',
    actions: [
      { key: 'view', label: 'View POS', description: 'Access point of sale page' },
      { key: 'addEdit', label: 'Process Sales', description: 'Create and park sales' },
      { key: 'void', label: 'Void Orders', description: 'Void parked orders' },
    ],
  },
  {
    key: 'transaction',
    label: 'Transactions',
    actions: [
      { key: 'view', label: 'View Transactions', description: 'View sales transactions list' },
      { key: 'void', label: 'Void Transactions', description: 'Void completed transactions' },
      { key: 'changeItem', label: 'Change Items', description: 'Modify items in transactions' },
      { key: 'refund', label: 'Process Refunds', description: 'Refund transactions' },
    ],
  },
  {
    key: 'cashDrawer',
    label: 'Cash Drawer',
    actions: [
      { key: 'view', label: 'View Cash Drawer', description: 'View cash drawer status and history' },
      { key: 'openClose', label: 'Open/Close Drawer', description: 'Open and close cash drawer' },
      { key: 'cashInOut', label: 'Cash In/Out', description: 'Add cash in or cash out' },
    ],
  },
  {
    key: 'discount',
    label: 'Discounts',
    actions: [
      { key: 'view', label: 'View Discounts', description: 'View discount configurations' },
      { key: 'addEdit', label: 'Manage Discounts', description: 'Create, edit, and toggle discounts' },
      { key: 'delete', label: 'Delete Discounts', description: 'Delete discount configurations' },
    ],
  },
  {
    key: 'serviceCharge',
    label: 'Service Charges',
    actions: [
      { key: 'view', label: 'View Service Charges', description: 'View service charge configurations' },
      { key: 'addEdit', label: 'Manage Service Charges', description: 'Create, edit, and toggle service charges' },
      { key: 'delete', label: 'Delete Service Charges', description: 'Delete service charge configurations' },
    ],
  },
  {
    key: 'settings',
    label: 'Settings',
    actions: [
      { key: 'view', label: 'View Settings', description: 'Access settings page' },
      { key: 'manageUsers', label: 'Manage Users', description: 'Create, edit, and delete users' },
      { key: 'managePermissions', label: 'Manage Permissions', description: 'Assign and modify user permissions' },
    ],
  },
];

// Helper function to get all permissions for SUPER_ADMIN
export const getFullPermissions = (): Record<string, PermissionAction[]> => {
  const fullPermissions: Record<string, PermissionAction[]> = {};
  PERMISSION_MODULES.forEach(module => {
    fullPermissions[module.key] = module.actions.map(action => action.key);
  });
  return fullPermissions;
};

// Helper function to check if user has specific permission
export const hasPermission = (
  userPermissions: Record<string, string[]> | undefined,
  module: string,
  action: PermissionAction
): boolean => {
  if (!userPermissions) return false;
  const modulePermissions = userPermissions[module];
  return Array.isArray(modulePermissions) && modulePermissions.includes(action);
};

// Helper function to check if user has any of the specified permissions
export const hasAnyPermission = (
  userPermissions: Record<string, string[]> | undefined,
  module: string,
  actions: PermissionAction[]
): boolean => {
  if (!userPermissions) return false;
  const modulePermissions = userPermissions[module];
  if (!Array.isArray(modulePermissions)) return false;
  return actions.some(action => modulePermissions.includes(action));
};

// Get module by key
export const getModuleByKey = (key: string): ModulePermission | undefined => {
  return PERMISSION_MODULES.find(module => module.key === key);
};

// Get actions for a module
export const getModuleActions = (moduleKey: string): ModulePermission['actions'] => {
  const module = getModuleByKey(moduleKey);
  return module?.actions || [];
};
