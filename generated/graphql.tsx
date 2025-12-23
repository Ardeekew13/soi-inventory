import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
export type MakeEmpty<T extends { [key: string]: unknown }, K extends keyof T> = { [_ in K]?: never };
export type Incremental<T> = T | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };
const defaultOptions = {} as const;
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: { input: string; output: string; }
  String: { input: string; output: string; }
  Boolean: { input: boolean; output: boolean; }
  Int: { input: number; output: number; }
  Float: { input: number; output: number; }
  Date: { input: any; output: any; }
  JSON: { input: any; output: any; }
};

export enum AttendanceStatus {
  Absent = 'ABSENT',
  HalfDay = 'HALF_DAY',
  Late = 'LATE',
  OnTime = 'ON_TIME'
}

export type BaseResponse = {
  __typename?: 'BaseResponse';
  message?: Maybe<Scalars['String']['output']>;
  success: Scalars['Boolean']['output'];
};

export type CashDrawer = {
  __typename?: 'CashDrawer';
  _id: Scalars['ID']['output'];
  bankTransferSales: Scalars['Float']['output'];
  cardSales: Scalars['Float']['output'];
  cashSales: Scalars['Float']['output'];
  closedAt?: Maybe<Scalars['String']['output']>;
  closedBy?: Maybe<Scalars['String']['output']>;
  closedByUser?: Maybe<User>;
  closedByUserId?: Maybe<Scalars['ID']['output']>;
  closingBalance?: Maybe<Scalars['Float']['output']>;
  createdAt: Scalars['String']['output'];
  creditSales: Scalars['Float']['output'];
  currentBalance: Scalars['Float']['output'];
  expectedBalance?: Maybe<Scalars['Float']['output']>;
  gcashSales: Scalars['Float']['output'];
  openedAt: Scalars['String']['output'];
  openedBy: Scalars['String']['output'];
  openedByUser?: Maybe<User>;
  openedByUserId?: Maybe<Scalars['ID']['output']>;
  openingBalance: Scalars['Float']['output'];
  status: DrawerStatus;
  totalCashIn: Scalars['Float']['output'];
  totalCashOut: Scalars['Float']['output'];
  totalRefunds: Scalars['Float']['output'];
  totalSales: Scalars['Float']['output'];
  totalVoids: Scalars['Float']['output'];
  transactions: Array<CashTransaction>;
  updatedAt: Scalars['String']['output'];
};

export type CashDrawerResponse = {
  __typename?: 'CashDrawerResponse';
  data?: Maybe<CashDrawer>;
  message: Scalars['String']['output'];
  success: Scalars['Boolean']['output'];
};

export type CashTransaction = {
  __typename?: 'CashTransaction';
  _id: Scalars['ID']['output'];
  amount: Scalars['Float']['output'];
  createdAt: Scalars['String']['output'];
  description?: Maybe<Scalars['String']['output']>;
  paymentMethod?: Maybe<PaymentMethod>;
  saleId?: Maybe<Scalars['ID']['output']>;
  type: TransactionType;
  user?: Maybe<User>;
  userId?: Maybe<Scalars['ID']['output']>;
};

export type CashierStat = {
  __typename?: 'CashierStat';
  cashierName: Scalars['String']['output'];
  count: Scalars['Int']['output'];
  totalAmount: Scalars['Float']['output'];
};

export type CategoryStat = {
  __typename?: 'CategoryStat';
  category: Scalars['String']['output'];
  count: Scalars['Int']['output'];
  totalAmount: Scalars['Float']['output'];
};

export type CollectionStats = {
  __typename?: 'CollectionStats';
  avgDocSizeKB: Scalars['Float']['output'];
  documentCount: Scalars['Int']['output'];
  name: Scalars['String']['output'];
  sizeMB: Scalars['Float']['output'];
};

export type CreateShiftScheduleInput = {
  breakEndTime: Scalars['String']['input'];
  breakStartTime: Scalars['String']['input'];
  isDefault?: InputMaybe<Scalars['Boolean']['input']>;
  name: Scalars['String']['input'];
  shiftEndTime: Scalars['String']['input'];
  shiftStartTime: Scalars['String']['input'];
};

export type DatabaseStats = {
  __typename?: 'DatabaseStats';
  activeUsers: Scalars['Int']['output'];
  cashDrawersCount: Scalars['Int']['output'];
  collections: Array<CollectionStats>;
  completedSales: Scalars['Int']['output'];
  currentUsagePercent: Scalars['Float']['output'];
  dataSizeMB: Scalars['Float']['output'];
  databaseName: Scalars['String']['output'];
  estimatedDaysToFull: Scalars['Int']['output'];
  freeSpaceMB: Scalars['Float']['output'];
  indexSizeMB: Scalars['Float']['output'];
  itemsCount: Scalars['Int']['output'];
  openDrawers: Scalars['Int']['output'];
  parkedSales: Scalars['Int']['output'];
  productsCount: Scalars['Int']['output'];
  salesCount: Scalars['Int']['output'];
  storageSizeMB: Scalars['Float']['output'];
  totalCollections: Scalars['Int']['output'];
  totalDocuments: Scalars['Int']['output'];
  totalSizeMB: Scalars['Float']['output'];
  usersCount: Scalars['Int']['output'];
};

export type DeletionResult = {
  __typename?: 'DeletionResult';
  message?: Maybe<Scalars['String']['output']>;
  success: Scalars['Boolean']['output'];
};

export type Discount = {
  __typename?: 'Discount';
  _id: Scalars['ID']['output'];
  createdAt: Scalars['String']['output'];
  id: Scalars['ID']['output'];
  isActive: Scalars['Boolean']['output'];
  title: Scalars['String']['output'];
  updatedAt: Scalars['String']['output'];
  value: Scalars['Float']['output'];
};

export type DiscountInput = {
  title: Scalars['String']['input'];
  value: Scalars['Float']['input'];
};

export enum DrawerStatus {
  Closed = 'CLOSED',
  Open = 'OPEN'
}

export type EmployeeShift = {
  __typename?: 'EmployeeShift';
  _id: Scalars['ID']['output'];
  actualStartTime?: Maybe<Scalars['String']['output']>;
  attendanceStatus: AttendanceStatus;
  createdAt: Scalars['String']['output'];
  date: Scalars['String']['output'];
  employeeName: Scalars['String']['output'];
  events: Array<ShiftEvent>;
  scheduledStartTime?: Maybe<Scalars['String']['output']>;
  status: ShiftStatus;
  totalHoursWorked: Scalars['Float']['output'];
  updatedAt: Scalars['String']['output'];
  userId: Scalars['ID']['output'];
};

export type HourlyStat = {
  __typename?: 'HourlyStat';
  count: Scalars['Int']['output'];
  hour: Scalars['String']['output'];
  totalAmount: Scalars['Float']['output'];
};

export type Item = {
  __typename?: 'Item';
  _id: Scalars['ID']['output'];
  createdAt: Scalars['String']['output'];
  currentStock: Scalars['Float']['output'];
  id: Scalars['ID']['output'];
  isActive: Scalars['Boolean']['output'];
  name: Scalars['String']['output'];
  pricePerUnit: Scalars['Float']['output'];
  unit: Scalars['String']['output'];
  updatedAt: Scalars['String']['output'];
};

export type ItemResultResponse = {
  __typename?: 'ItemResultResponse';
  data?: Maybe<Item>;
  message?: Maybe<Scalars['String']['output']>;
  success: Scalars['Boolean']['output'];
};

export type ItemStat = {
  __typename?: 'ItemStat';
  itemName: Scalars['String']['output'];
  quantity: Scalars['Int']['output'];
  totalAmount: Scalars['Float']['output'];
};

export type ItemsResponse = {
  __typename?: 'ItemsResponse';
  items: Array<Item>;
  totalCount: Scalars['Int']['output'];
};

export type LoginResponse = {
  __typename?: 'LoginResponse';
  message: Scalars['String']['output'];
  success: Scalars['Boolean']['output'];
  token?: Maybe<Scalars['String']['output']>;
  user?: Maybe<User>;
};

export type MonthlySaleReport = {
  __typename?: 'MonthlySaleReport';
  grossProfit?: Maybe<Scalars['Float']['output']>;
  month?: Maybe<Scalars['String']['output']>;
  totalAmountSales?: Maybe<Scalars['Float']['output']>;
  totalCostOfGoods?: Maybe<Scalars['Float']['output']>;
  totalItemsSold?: Maybe<Scalars['Float']['output']>;
};

export type Mutation = {
  __typename?: 'Mutation';
  addCashIn: CashDrawerResponse;
  addCashOut: CashDrawerResponse;
  addItem: ItemResultResponse;
  addProduct: ProductMutationResponse;
  changeItem: DeletionResult;
  checkoutSale: SaleResponse;
  closeCashDrawer: CashDrawerResponse;
  createDiscount: DeletionResult;
  createServiceCharge: DeletionResult;
  createShiftSchedule: ShiftSchedule;
  createUser: UserResponse;
  deleteDiscount: DeletionResult;
  deleteItem: DeletionResult;
  deleteParkedSale: DeletionResult;
  deleteProduct: DeletionResult;
  deleteServiceCharge: DeletionResult;
  deleteShiftSchedule: Scalars['Boolean']['output'];
  deleteUser: UserResponse;
  login: LoginResponse;
  logout: Scalars['Boolean']['output'];
  openCashDrawer: CashDrawerResponse;
  parkSale: SaleResponse;
  reactivateItem: ItemResultResponse;
  reactivateProduct: ProductMutationResponse;
  recordSale: SaleResponse;
  recordShiftEvent: EmployeeShift;
  refundSale: DeletionResult;
  sendToKitchen: DeletionResult;
  updateDiscount: DeletionResult;
  updateServiceCharge: DeletionResult;
  updateShiftSchedule: ShiftSchedule;
  updateUser: UserResponse;
  verifyPassword: VerifyPasswordResponse;
  voidParkedSale: DeletionResult;
  voidSale: DeletionResult;
};


export type MutationAddCashInArgs = {
  amount: Scalars['Float']['input'];
  description: Scalars['String']['input'];
};


export type MutationAddCashOutArgs = {
  amount: Scalars['Float']['input'];
  description: Scalars['String']['input'];
};


export type MutationAddItemArgs = {
  _id?: InputMaybe<Scalars['ID']['input']>;
  currentStock: Scalars['Float']['input'];
  name: Scalars['String']['input'];
  pricePerUnit: Scalars['Float']['input'];
  unit: Scalars['String']['input'];
};


export type MutationAddProductArgs = {
  id?: InputMaybe<Scalars['ID']['input']>;
  items: Array<ProductIngredientInput>;
  name: Scalars['String']['input'];
  price: Scalars['Float']['input'];
};


export type MutationChangeItemArgs = {
  newProductId: Scalars['ID']['input'];
  newQuantity: Scalars['Float']['input'];
  oldSaleItemId: Scalars['ID']['input'];
  reason: Scalars['String']['input'];
  saleId: Scalars['ID']['input'];
};


export type MutationCheckoutSaleArgs = {
  id?: InputMaybe<Scalars['ID']['input']>;
  items: Array<SaleItemInput>;
  orderType: OrderType;
  paymentMethod?: InputMaybe<Scalars['String']['input']>;
  tableNumber?: InputMaybe<Scalars['String']['input']>;
};


export type MutationCloseCashDrawerArgs = {
  closingBalance: Scalars['Float']['input'];
};


export type MutationCreateDiscountArgs = {
  input: DiscountInput;
};


export type MutationCreateServiceChargeArgs = {
  input: ServiceChargeInput;
};


export type MutationCreateShiftScheduleArgs = {
  input: CreateShiftScheduleInput;
};


export type MutationCreateUserArgs = {
  firstName?: InputMaybe<Scalars['String']['input']>;
  lastName?: InputMaybe<Scalars['String']['input']>;
  password: Scalars['String']['input'];
  permissions?: InputMaybe<Scalars['JSON']['input']>;
  role: UserRole;
  shiftScheduleId?: InputMaybe<Scalars['ID']['input']>;
  username: Scalars['String']['input'];
};


export type MutationDeleteDiscountArgs = {
  id: Scalars['ID']['input'];
};


export type MutationDeleteItemArgs = {
  _id: Scalars['ID']['input'];
};


export type MutationDeleteParkedSaleArgs = {
  id: Scalars['ID']['input'];
};


export type MutationDeleteProductArgs = {
  id: Scalars['ID']['input'];
};


export type MutationDeleteServiceChargeArgs = {
  id: Scalars['ID']['input'];
};


export type MutationDeleteShiftScheduleArgs = {
  id: Scalars['ID']['input'];
};


export type MutationDeleteUserArgs = {
  id: Scalars['ID']['input'];
};


export type MutationLoginArgs = {
  password: Scalars['String']['input'];
  username: Scalars['String']['input'];
};


export type MutationOpenCashDrawerArgs = {
  openingBalance: Scalars['Float']['input'];
};


export type MutationParkSaleArgs = {
  id?: InputMaybe<Scalars['ID']['input']>;
  items: Array<SaleItemInput>;
  orderType: OrderType;
  tableNumber?: InputMaybe<Scalars['String']['input']>;
};


export type MutationReactivateItemArgs = {
  _id: Scalars['ID']['input'];
};


export type MutationReactivateProductArgs = {
  id: Scalars['ID']['input'];
};


export type MutationRecordSaleArgs = {
  items: Array<SaleItemInput>;
};


export type MutationRecordShiftEventArgs = {
  input: RecordShiftEventInput;
};


export type MutationRefundSaleArgs = {
  id: Scalars['ID']['input'];
  refundReason: Scalars['String']['input'];
};


export type MutationSendToKitchenArgs = {
  itemIds: Array<Scalars['ID']['input']>;
  saleId: Scalars['ID']['input'];
};


export type MutationUpdateDiscountArgs = {
  id: Scalars['ID']['input'];
  input: DiscountInput;
};


export type MutationUpdateServiceChargeArgs = {
  id: Scalars['ID']['input'];
  input: ServiceChargeInput;
};


export type MutationUpdateShiftScheduleArgs = {
  input: UpdateShiftScheduleInput;
};


export type MutationUpdateUserArgs = {
  firstName?: InputMaybe<Scalars['String']['input']>;
  id: Scalars['ID']['input'];
  isActive?: InputMaybe<Scalars['Boolean']['input']>;
  lastName?: InputMaybe<Scalars['String']['input']>;
  password?: InputMaybe<Scalars['String']['input']>;
  permissions?: InputMaybe<Scalars['JSON']['input']>;
  role?: InputMaybe<UserRole>;
  shiftScheduleId?: InputMaybe<Scalars['ID']['input']>;
  username?: InputMaybe<Scalars['String']['input']>;
};


export type MutationVerifyPasswordArgs = {
  password: Scalars['String']['input'];
};


export type MutationVoidParkedSaleArgs = {
  id: Scalars['ID']['input'];
  voidReason: Scalars['String']['input'];
};


export type MutationVoidSaleArgs = {
  id: Scalars['ID']['input'];
  voidReason: Scalars['String']['input'];
};

export enum OrderType {
  DineIn = 'DINE_IN',
  TakeOut = 'TAKE_OUT'
}

export enum PaymentMethod {
  BankTransfer = 'BANK_TRANSFER',
  Card = 'CARD',
  Cash = 'CASH',
  Credit = 'CREDIT',
  Gcash = 'GCASH'
}

export type PaymentMethodStat = {
  __typename?: 'PaymentMethodStat';
  count: Scalars['Int']['output'];
  paymentMethod: Scalars['String']['output'];
  totalAmount: Scalars['Float']['output'];
};

export type Product = {
  __typename?: 'Product';
  _id: Scalars['ID']['output'];
  createdAt: Scalars['String']['output'];
  id: Scalars['ID']['output'];
  ingredientsUsed: Array<ProductIngredient>;
  isActive: Scalars['Boolean']['output'];
  name: Scalars['String']['output'];
  price: Scalars['Float']['output'];
  updatedAt: Scalars['String']['output'];
};

export type ProductIngredient = {
  __typename?: 'ProductIngredient';
  _id: Scalars['ID']['output'];
  id: Scalars['ID']['output'];
  item: Item;
  itemId: Scalars['ID']['output'];
  productId: Scalars['ID']['output'];
  quantityUsed: Scalars['Float']['output'];
};

export type ProductIngredientInput = {
  itemId: Scalars['ID']['input'];
  quantityUsed: Scalars['Float']['input'];
};

export type ProductMutationResponse = {
  __typename?: 'ProductMutationResponse';
  data?: Maybe<Product>;
  message: Scalars['String']['output'];
  success: Scalars['Boolean']['output'];
};

export type ProductResponse = {
  __typename?: 'ProductResponse';
  data?: Maybe<Product>;
  message?: Maybe<Scalars['String']['output']>;
  products: Array<Product>;
  success: Scalars['Boolean']['output'];
  totalCount: Scalars['Int']['output'];
};

export type Query = {
  __typename?: 'Query';
  allShifts: Array<EmployeeShift>;
  cashDrawerHistory: Array<CashDrawer>;
  currentCashDrawer?: Maybe<CashDrawer>;
  databaseStats: DatabaseStats;
  discount?: Maybe<Discount>;
  discounts: Array<Discount>;
  inactiveItemsList: ItemsResponse;
  inactiveProductsList: ProductResponse;
  itemsList: ItemsResponse;
  me: User;
  myCurrentShift?: Maybe<EmployeeShift>;
  myShiftHistory: Array<EmployeeShift>;
  parkedSales: Array<Sale>;
  productsByIngredient: Array<Product>;
  productsList: ProductResponse;
  saleReport?: Maybe<SaleReportGroup>;
  sales: Array<Sale>;
  serviceCharge?: Maybe<ServiceCharge>;
  serviceCharges: Array<ServiceCharge>;
  shiftById?: Maybe<EmployeeShift>;
  shiftScheduleById?: Maybe<ShiftSchedule>;
  shiftSchedules: Array<ShiftSchedule>;
  user?: Maybe<User>;
  users: Array<User>;
};


export type QueryAllShiftsArgs = {
  date?: InputMaybe<Scalars['String']['input']>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  status?: InputMaybe<ShiftStatus>;
};


export type QueryCashDrawerHistoryArgs = {
  limit?: InputMaybe<Scalars['Int']['input']>;
};


export type QueryDiscountArgs = {
  id: Scalars['ID']['input'];
};


export type QueryInactiveItemsListArgs = {
  limit?: InputMaybe<Scalars['Int']['input']>;
  search?: InputMaybe<Scalars['String']['input']>;
  skip?: InputMaybe<Scalars['Int']['input']>;
};


export type QueryInactiveProductsListArgs = {
  limit?: InputMaybe<Scalars['Int']['input']>;
  search?: InputMaybe<Scalars['String']['input']>;
  skip?: InputMaybe<Scalars['Int']['input']>;
};


export type QueryItemsListArgs = {
  limit?: InputMaybe<Scalars['Int']['input']>;
  search?: InputMaybe<Scalars['String']['input']>;
  skip?: InputMaybe<Scalars['Int']['input']>;
};


export type QueryMyShiftHistoryArgs = {
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
};


export type QueryProductsByIngredientArgs = {
  itemId: Scalars['ID']['input'];
};


export type QueryProductsListArgs = {
  limit?: InputMaybe<Scalars['Int']['input']>;
  search?: InputMaybe<Scalars['String']['input']>;
  skip?: InputMaybe<Scalars['Int']['input']>;
};


export type QuerySaleReportArgs = {
  endDate?: InputMaybe<Scalars['String']['input']>;
  startDate?: InputMaybe<Scalars['String']['input']>;
  year?: InputMaybe<Scalars['String']['input']>;
};


export type QuerySalesArgs = {
  search?: InputMaybe<Scalars['String']['input']>;
};


export type QueryServiceChargeArgs = {
  id: Scalars['ID']['input'];
};


export type QueryShiftByIdArgs = {
  id: Scalars['ID']['input'];
};


export type QueryShiftScheduleByIdArgs = {
  id: Scalars['ID']['input'];
};


export type QueryUserArgs = {
  id: Scalars['ID']['input'];
};

export type RecordShiftEventInput = {
  eventType: ShiftEventType;
  notes?: InputMaybe<Scalars['String']['input']>;
  photo?: InputMaybe<Scalars['String']['input']>;
};

export type Sale = {
  __typename?: 'Sale';
  _id: Scalars['ID']['output'];
  cashierId?: Maybe<Scalars['ID']['output']>;
  cashierName?: Maybe<Scalars['String']['output']>;
  costOfGoods: Scalars['Float']['output'];
  createdAt: Scalars['String']['output'];
  customerName?: Maybe<Scalars['String']['output']>;
  grossProfit: Scalars['Float']['output'];
  id: Scalars['ID']['output'];
  isDeleted: Scalars['Boolean']['output'];
  orderNo?: Maybe<Scalars['String']['output']>;
  orderType?: Maybe<OrderType>;
  saleItems: Array<SaleItem>;
  status: Scalars['String']['output'];
  tableNumber?: Maybe<Scalars['String']['output']>;
  totalAmount: Scalars['Float']['output'];
  updatedAt: Scalars['String']['output'];
  voidReason: Scalars['String']['output'];
};

export type SaleItem = {
  __typename?: 'SaleItem';
  _id: Scalars['ID']['output'];
  priceAtSale: Scalars['Float']['output'];
  product?: Maybe<Product>;
  productId: Scalars['ID']['output'];
  quantity: Scalars['Float']['output'];
  quantityPrinted?: Maybe<Scalars['Float']['output']>;
};

export type SaleItemInput = {
  productId: Scalars['ID']['input'];
  quantity: Scalars['Float']['input'];
};

export type SaleReportGroup = {
  __typename?: 'SaleReportGroup';
  availableYears: Array<Scalars['Int']['output']>;
  grossProfit?: Maybe<Scalars['Float']['output']>;
  grossProfitPercentage?: Maybe<Scalars['Float']['output']>;
  groupSales: Array<MonthlySaleReport>;
  numberOfRefunds?: Maybe<Scalars['Int']['output']>;
  numberOfTransactions?: Maybe<Scalars['Int']['output']>;
  salesByCashier: Array<CashierStat>;
  salesByHour: Array<HourlyStat>;
  salesByItem: Array<ItemStat>;
  salesByPaymentMethod: Array<PaymentMethodStat>;
  topProductSold: Array<TopProduct>;
  totalAmountSales?: Maybe<Scalars['Float']['output']>;
  totalCostOfGoods?: Maybe<Scalars['Float']['output']>;
  totalCostPercentage?: Maybe<Scalars['Float']['output']>;
  totalDiscounts?: Maybe<Scalars['Float']['output']>;
  totalItemsSold?: Maybe<Scalars['Float']['output']>;
  totalNetSales?: Maybe<Scalars['Float']['output']>;
  totalRefunds?: Maybe<Scalars['Float']['output']>;
  totalSalesPercentage?: Maybe<Scalars['Float']['output']>;
};

export type SaleResponse = {
  __typename?: 'SaleResponse';
  _id: Scalars['ID']['output'];
  data?: Maybe<Sale>;
  grossProfit: Scalars['Float']['output'];
  message: Scalars['String']['output'];
  orderNo?: Maybe<Scalars['String']['output']>;
  status: Scalars['String']['output'];
  success: Scalars['Boolean']['output'];
  totalAmount: Scalars['Float']['output'];
};

export enum SaleStatus {
  Completed = 'COMPLETED',
  ItemChanged = 'ITEM_CHANGED',
  Parked = 'PARKED',
  Refunded = 'REFUNDED',
  Void = 'VOID'
}

export type ServiceCharge = {
  __typename?: 'ServiceCharge';
  _id: Scalars['ID']['output'];
  createdAt: Scalars['String']['output'];
  id: Scalars['ID']['output'];
  isActive: Scalars['Boolean']['output'];
  title: Scalars['String']['output'];
  updatedAt: Scalars['String']['output'];
  value: Scalars['Float']['output'];
};

export type ServiceChargeInput = {
  title: Scalars['String']['input'];
  value: Scalars['Float']['input'];
};

export type ShiftEvent = {
  __typename?: 'ShiftEvent';
  _id: Scalars['ID']['output'];
  eventType: ShiftEventType;
  notes?: Maybe<Scalars['String']['output']>;
  photo?: Maybe<Scalars['String']['output']>;
  timestamp: Scalars['String']['output'];
};

export enum ShiftEventType {
  LunchBreakEnd = 'LUNCH_BREAK_END',
  LunchBreakStart = 'LUNCH_BREAK_START',
  ShiftEnd = 'SHIFT_END',
  ShiftStart = 'SHIFT_START'
}

export type ShiftSchedule = {
  __typename?: 'ShiftSchedule';
  _id: Scalars['ID']['output'];
  breakEndTime: Scalars['String']['output'];
  breakStartTime: Scalars['String']['output'];
  createdAt: Scalars['String']['output'];
  isActive: Scalars['Boolean']['output'];
  isDefault?: Maybe<Scalars['Boolean']['output']>;
  name: Scalars['String']['output'];
  shiftEndTime: Scalars['String']['output'];
  shiftStartTime: Scalars['String']['output'];
  updatedAt: Scalars['String']['output'];
};

export enum ShiftStatus {
  Completed = 'COMPLETED',
  InProgress = 'IN_PROGRESS'
}

export type TopProduct = {
  __typename?: 'TopProduct';
  name: Scalars['String']['output'];
  quantity: Scalars['Int']['output'];
};

export enum TransactionType {
  CashIn = 'CASH_IN',
  CashOut = 'CASH_OUT',
  Closing = 'CLOSING',
  Opening = 'OPENING',
  Refund = 'REFUND',
  Sale = 'SALE',
  Void = 'VOID'
}

export type UpdateShiftScheduleInput = {
  breakEndTime?: InputMaybe<Scalars['String']['input']>;
  breakStartTime?: InputMaybe<Scalars['String']['input']>;
  id: Scalars['ID']['input'];
  isActive?: InputMaybe<Scalars['Boolean']['input']>;
  isDefault?: InputMaybe<Scalars['Boolean']['input']>;
  name?: InputMaybe<Scalars['String']['input']>;
  shiftEndTime?: InputMaybe<Scalars['String']['input']>;
  shiftStartTime?: InputMaybe<Scalars['String']['input']>;
};

export type User = {
  __typename?: 'User';
  _id: Scalars['ID']['output'];
  createdAt: Scalars['String']['output'];
  firstName?: Maybe<Scalars['String']['output']>;
  isActive: Scalars['Boolean']['output'];
  lastName?: Maybe<Scalars['String']['output']>;
  permissions?: Maybe<Scalars['JSON']['output']>;
  role: UserRole;
  shiftSchedule?: Maybe<ShiftSchedule>;
  shiftScheduleId?: Maybe<Scalars['ID']['output']>;
  updatedAt: Scalars['String']['output'];
  username: Scalars['String']['output'];
};

export type UserResponse = {
  __typename?: 'UserResponse';
  data?: Maybe<User>;
  message: Scalars['String']['output'];
  success: Scalars['Boolean']['output'];
};

export enum UserRole {
  Cashier = 'CASHIER',
  Manager = 'MANAGER',
  SuperAdmin = 'SUPER_ADMIN'
}

export type VerifyPasswordResponse = {
  __typename?: 'VerifyPasswordResponse';
  message: Scalars['String']['output'];
  success: Scalars['Boolean']['output'];
};

export type MeQueryVariables = Exact<{ [key: string]: never; }>;


export type MeQuery = { __typename?: 'Query', me: { __typename?: 'User', _id: string, username: string, role: UserRole, firstName?: string | null, lastName?: string | null, isActive: boolean, permissions?: any | null } };

export type CurrentCashDrawerQueryVariables = Exact<{ [key: string]: never; }>;


export type CurrentCashDrawerQuery = { __typename?: 'Query', currentCashDrawer?: { __typename?: 'CashDrawer', _id: string, openedBy: string, openedAt: string, openingBalance: number, status: DrawerStatus, currentBalance: number, totalCashIn: number, totalCashOut: number, totalSales: number, cashSales: number, bankTransferSales: number, cardSales: number, creditSales: number, gcashSales: number, transactions: Array<{ __typename?: 'CashTransaction', _id: string, type: TransactionType, amount: number, description?: string | null, saleId?: string | null, paymentMethod?: PaymentMethod | null, createdAt: string }> } | null };

export type CashDrawerHistoryQueryVariables = Exact<{
  limit?: InputMaybe<Scalars['Int']['input']>;
}>;


export type CashDrawerHistoryQuery = { __typename?: 'Query', cashDrawerHistory: Array<{ __typename?: 'CashDrawer', _id: string, openedBy: string, openedAt: string, closedAt?: string | null, openingBalance: number, closingBalance?: number | null, expectedBalance?: number | null, status: DrawerStatus, currentBalance: number, totalCashIn: number, totalCashOut: number, totalSales: number, cashSales: number, bankTransferSales: number, cardSales: number, creditSales: number, gcashSales: number }> };

export type OpenCashDrawerMutationVariables = Exact<{
  openingBalance: Scalars['Float']['input'];
}>;


export type OpenCashDrawerMutation = { __typename?: 'Mutation', openCashDrawer: { __typename?: 'CashDrawerResponse', success: boolean, message: string, data?: { __typename?: 'CashDrawer', _id: string, openedBy: string, openedAt: string, openingBalance: number, status: DrawerStatus, currentBalance: number } | null } };

export type CloseCashDrawerMutationVariables = Exact<{
  closingBalance: Scalars['Float']['input'];
}>;


export type CloseCashDrawerMutation = { __typename?: 'Mutation', closeCashDrawer: { __typename?: 'CashDrawerResponse', success: boolean, message: string, data?: { __typename?: 'CashDrawer', _id: string, closedAt?: string | null, closingBalance?: number | null, expectedBalance?: number | null, status: DrawerStatus } | null } };

export type AddCashInMutationVariables = Exact<{
  amount: Scalars['Float']['input'];
  description: Scalars['String']['input'];
}>;


export type AddCashInMutation = { __typename?: 'Mutation', addCashIn: { __typename?: 'CashDrawerResponse', success: boolean, message: string, data?: { __typename?: 'CashDrawer', _id: string, currentBalance: number, totalCashIn: number } | null } };

export type AddCashOutMutationVariables = Exact<{
  amount: Scalars['Float']['input'];
  description: Scalars['String']['input'];
}>;


export type AddCashOutMutation = { __typename?: 'Mutation', addCashOut: { __typename?: 'CashDrawerResponse', success: boolean, message: string, data?: { __typename?: 'CashDrawer', _id: string, currentBalance: number, totalCashOut: number } | null } };

export type SaleReportQueryVariables = Exact<{
  startDate?: InputMaybe<Scalars['String']['input']>;
  endDate?: InputMaybe<Scalars['String']['input']>;
  year?: InputMaybe<Scalars['String']['input']>;
}>;


export type SaleReportQuery = { __typename?: 'Query', saleReport?: { __typename?: 'SaleReportGroup', totalAmountSales?: number | null, totalCostOfGoods?: number | null, grossProfit?: number | null, totalItemsSold?: number | null, totalSalesPercentage?: number | null, totalCostPercentage?: number | null, grossProfitPercentage?: number | null, availableYears: Array<number>, numberOfTransactions?: number | null, totalDiscounts?: number | null, totalNetSales?: number | null, totalRefunds?: number | null, numberOfRefunds?: number | null, topProductSold: Array<{ __typename?: 'TopProduct', name: string, quantity: number }>, groupSales: Array<{ __typename?: 'MonthlySaleReport', month?: string | null, totalAmountSales?: number | null, totalCostOfGoods?: number | null, grossProfit?: number | null, totalItemsSold?: number | null }>, salesByPaymentMethod: Array<{ __typename?: 'PaymentMethodStat', paymentMethod: string, totalAmount: number, count: number }>, salesByItem: Array<{ __typename?: 'ItemStat', itemName: string, totalAmount: number, quantity: number }>, salesByCashier: Array<{ __typename?: 'CashierStat', cashierName: string, totalAmount: number, count: number }>, salesByHour: Array<{ __typename?: 'HourlyStat', hour: string, totalAmount: number, count: number }> } | null };

export type GetItemsQueryVariables = Exact<{
  search?: InputMaybe<Scalars['String']['input']>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  skip?: InputMaybe<Scalars['Int']['input']>;
}>;


export type GetItemsQuery = { __typename?: 'Query', itemsList: { __typename?: 'ItemsResponse', totalCount: number, items: Array<{ __typename?: 'Item', _id: string, name: string, unit: string, pricePerUnit: number, currentStock: number, updatedAt: string, createdAt: string, isActive: boolean }> } };

export type AddItemMutationVariables = Exact<{
  id?: InputMaybe<Scalars['ID']['input']>;
  name: Scalars['String']['input'];
  unit: Scalars['String']['input'];
  pricePerUnit: Scalars['Float']['input'];
  currentStock: Scalars['Float']['input'];
}>;


export type AddItemMutation = { __typename?: 'Mutation', addItem: { __typename?: 'ItemResultResponse', success: boolean, message?: string | null, data?: { __typename?: 'Item', _id: string, name: string, unit: string, pricePerUnit: number, currentStock: number, createdAt: string, updatedAt: string } | null } };

export type DeleteItemMutationVariables = Exact<{
  id: Scalars['ID']['input'];
}>;


export type DeleteItemMutation = { __typename?: 'Mutation', deleteItem: { __typename?: 'DeletionResult', success: boolean, message?: string | null } };

export type GetInactiveItemsQueryVariables = Exact<{
  search?: InputMaybe<Scalars['String']['input']>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  skip?: InputMaybe<Scalars['Int']['input']>;
}>;


export type GetInactiveItemsQuery = { __typename?: 'Query', inactiveItemsList: { __typename?: 'ItemsResponse', totalCount: number, items: Array<{ __typename?: 'Item', _id: string, name: string, unit: string, pricePerUnit: number, currentStock: number, updatedAt: string, createdAt: string }> } };

export type ReactivateItemMutationVariables = Exact<{
  id: Scalars['ID']['input'];
}>;


export type ReactivateItemMutation = { __typename?: 'Mutation', reactivateItem: { __typename?: 'ItemResultResponse', success: boolean, message?: string | null, data?: { __typename?: 'Item', _id: string, name: string, unit: string, pricePerUnit: number, currentStock: number, isActive: boolean } | null } };

export type ParkSaleMutationVariables = Exact<{
  id?: InputMaybe<Scalars['ID']['input']>;
  items: Array<SaleItemInput> | SaleItemInput;
  orderType: OrderType;
  tableNumber?: InputMaybe<Scalars['String']['input']>;
}>;


export type ParkSaleMutation = { __typename?: 'Mutation', parkSale: { __typename?: 'SaleResponse', success: boolean, message: string, data?: { __typename?: 'Sale', _id: string, totalAmount: number, grossProfit: number, orderNo?: string | null, status: string } | null } };

export type CheckoutSaleMutationVariables = Exact<{
  id?: InputMaybe<Scalars['ID']['input']>;
  items: Array<SaleItemInput> | SaleItemInput;
  orderType: OrderType;
  tableNumber?: InputMaybe<Scalars['String']['input']>;
  paymentMethod?: InputMaybe<Scalars['String']['input']>;
}>;


export type CheckoutSaleMutation = { __typename?: 'Mutation', checkoutSale: { __typename?: 'SaleResponse', success: boolean, message: string, data?: { __typename?: 'Sale', _id: string, totalAmount: number, grossProfit: number, orderNo?: string | null, status: string } | null } };

export type SendToKitchenMutationVariables = Exact<{
  saleId: Scalars['ID']['input'];
  itemIds: Array<Scalars['ID']['input']> | Scalars['ID']['input'];
}>;


export type SendToKitchenMutation = { __typename?: 'Mutation', sendToKitchen: { __typename?: 'DeletionResult', success: boolean, message?: string | null } };

export type ParkedSalesQueryVariables = Exact<{ [key: string]: never; }>;


export type ParkedSalesQuery = { __typename?: 'Query', parkedSales: Array<{ __typename?: 'Sale', _id: string, totalAmount: number, orderNo?: string | null, orderType?: OrderType | null, tableNumber?: string | null, createdAt: string, updatedAt: string, saleItems: Array<{ __typename?: 'SaleItem', _id: string, quantity: number, priceAtSale: number, quantityPrinted?: number | null, product?: { __typename?: 'Product', _id: string, name: string, price: number, createdAt: string, updatedAt: string, ingredientsUsed: Array<{ __typename?: 'ProductIngredient', _id: string, itemId: string, productId: string, quantityUsed: number, item: { __typename?: 'Item', _id: string, name: string } }> } | null }> }> };

export type DeleteParkedSaleMutationVariables = Exact<{
  id: Scalars['ID']['input'];
}>;


export type DeleteParkedSaleMutation = { __typename?: 'Mutation', deleteParkedSale: { __typename?: 'DeletionResult', success: boolean, message?: string | null } };

export type RecordSaleMutationVariables = Exact<{
  items: Array<SaleItemInput> | SaleItemInput;
}>;


export type RecordSaleMutation = { __typename?: 'Mutation', recordSale: { __typename?: 'SaleResponse', success: boolean, message: string, data?: { __typename?: 'Sale', _id: string, totalAmount: number, grossProfit: number, orderNo?: string | null, status: string } | null } };

export type ProductsQueryVariables = Exact<{
  search?: InputMaybe<Scalars['String']['input']>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  skip?: InputMaybe<Scalars['Int']['input']>;
}>;


export type ProductsQuery = { __typename?: 'Query', productsList: { __typename?: 'ProductResponse', totalCount: number, products: Array<{ __typename?: 'Product', _id: string, name: string, price: number, createdAt: string, updatedAt: string, ingredientsUsed: Array<{ __typename?: 'ProductIngredient', _id: string, productId: string, itemId: string, quantityUsed: number, item: { __typename?: 'Item', _id: string, name: string, unit: string, pricePerUnit: number, isActive: boolean } }> }> } };

export type AddProductMutationVariables = Exact<{
  id?: InputMaybe<Scalars['ID']['input']>;
  name: Scalars['String']['input'];
  price: Scalars['Float']['input'];
  items: Array<ProductIngredientInput> | ProductIngredientInput;
}>;


export type AddProductMutation = { __typename?: 'Mutation', addProduct: { __typename?: 'ProductMutationResponse', success: boolean, message: string, data?: { __typename?: 'Product', _id: string, name: string, price: number, createdAt: string, updatedAt: string, ingredientsUsed: Array<{ __typename?: 'ProductIngredient', _id: string, productId: string, itemId: string, quantityUsed: number, item: { __typename?: 'Item', _id: string, name: string, unit: string, pricePerUnit: number } }> } | null } };

export type DeleteProductMutationVariables = Exact<{
  id: Scalars['ID']['input'];
}>;


export type DeleteProductMutation = { __typename?: 'Mutation', deleteProduct: { __typename?: 'DeletionResult', success: boolean, message?: string | null } };

export type GetInactiveProductsQueryVariables = Exact<{
  search?: InputMaybe<Scalars['String']['input']>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  skip?: InputMaybe<Scalars['Int']['input']>;
}>;


export type GetInactiveProductsQuery = { __typename?: 'Query', inactiveProductsList: { __typename?: 'ProductResponse', totalCount: number, products: Array<{ __typename?: 'Product', _id: string, name: string, price: number, createdAt: string, updatedAt: string, ingredientsUsed: Array<{ __typename?: 'ProductIngredient', _id: string, productId: string, itemId: string, quantityUsed: number, item: { __typename?: 'Item', _id: string, name: string, unit: string, pricePerUnit: number } }> }> } };

export type ReactivateProductMutationVariables = Exact<{
  id: Scalars['ID']['input'];
}>;


export type ReactivateProductMutation = { __typename?: 'Mutation', reactivateProduct: { __typename?: 'ProductMutationResponse', success: boolean, message: string, data?: { __typename?: 'Product', _id: string, name: string, price: number, isActive: boolean } | null } };

export type ProductsByIngredientQueryVariables = Exact<{
  itemId: Scalars['ID']['input'];
}>;


export type ProductsByIngredientQuery = { __typename?: 'Query', productsByIngredient: Array<{ __typename?: 'Product', _id: string, id: string, name: string, price: number, createdAt: string, updatedAt: string, ingredientsUsed: Array<{ __typename?: 'ProductIngredient', _id: string, id: string, itemId: string, quantityUsed: number, item: { __typename?: 'Item', _id: string, id: string, name: string, unit: string } }> }> };

export type SalesQueryVariables = Exact<{
  search?: InputMaybe<Scalars['String']['input']>;
}>;


export type SalesQuery = { __typename?: 'Query', sales: Array<{ __typename?: 'Sale', _id: string, tableNumber?: string | null, orderNo?: string | null, createdAt: string, id: string, orderType?: OrderType | null, status: string, costOfGoods: number, grossProfit: number, totalAmount: number, saleItems: Array<{ __typename?: 'SaleItem', _id: string, priceAtSale: number, productId: string, quantity: number, product?: { __typename?: 'Product', id: string, name: string, price: number, updatedAt: string, createdAt: string } | null }> }> };

export type VoidSaleMutationVariables = Exact<{
  id: Scalars['ID']['input'];
  voidReason: Scalars['String']['input'];
}>;


export type VoidSaleMutation = { __typename?: 'Mutation', voidSale: { __typename?: 'DeletionResult', success: boolean, message?: string | null } };

export type RefundSaleMutationVariables = Exact<{
  id: Scalars['ID']['input'];
  refundReason: Scalars['String']['input'];
}>;


export type RefundSaleMutation = { __typename?: 'Mutation', refundSale: { __typename?: 'DeletionResult', success: boolean, message?: string | null } };

export type ChangeItemMutationVariables = Exact<{
  saleId: Scalars['ID']['input'];
  oldSaleItemId: Scalars['ID']['input'];
  newProductId: Scalars['ID']['input'];
  newQuantity: Scalars['Float']['input'];
  reason: Scalars['String']['input'];
}>;


export type ChangeItemMutation = { __typename?: 'Mutation', changeItem: { __typename?: 'DeletionResult', success: boolean, message?: string | null } };

export type LoginMutationVariables = Exact<{
  username: Scalars['String']['input'];
  password: Scalars['String']['input'];
}>;


export type LoginMutation = { __typename?: 'Mutation', login: { __typename?: 'LoginResponse', token?: string | null, success: boolean, message: string } };

export type LogoutMutationVariables = Exact<{ [key: string]: never; }>;


export type LogoutMutation = { __typename?: 'Mutation', logout: boolean };

export type VerifyPasswordMutationVariables = Exact<{
  password: Scalars['String']['input'];
}>;


export type VerifyPasswordMutation = { __typename?: 'Mutation', verifyPassword: { __typename?: 'VerifyPasswordResponse', success: boolean, message: string } };

export type DatabaseStatsQueryVariables = Exact<{ [key: string]: never; }>;


export type DatabaseStatsQuery = { __typename?: 'Query', databaseStats: { __typename?: 'DatabaseStats', databaseName: string, totalCollections: number, dataSizeMB: number, storageSizeMB: number, indexSizeMB: number, totalSizeMB: number, totalDocuments: number, salesCount: number, completedSales: number, parkedSales: number, productsCount: number, itemsCount: number, cashDrawersCount: number, openDrawers: number, usersCount: number, activeUsers: number, currentUsagePercent: number, freeSpaceMB: number, estimatedDaysToFull: number, collections: Array<{ __typename?: 'CollectionStats', name: string, documentCount: number, sizeMB: number, avgDocSizeKB: number }> } };

export type DiscountsQueryVariables = Exact<{ [key: string]: never; }>;


export type DiscountsQuery = { __typename?: 'Query', discounts: Array<{ __typename?: 'Discount', _id: string, id: string, title: string, value: number, isActive: boolean, createdAt: string, updatedAt: string }> };

export type CreateDiscountMutationVariables = Exact<{
  input: DiscountInput;
}>;


export type CreateDiscountMutation = { __typename?: 'Mutation', createDiscount: { __typename?: 'DeletionResult', success: boolean, message?: string | null } };

export type UpdateDiscountMutationVariables = Exact<{
  id: Scalars['ID']['input'];
  input: DiscountInput;
}>;


export type UpdateDiscountMutation = { __typename?: 'Mutation', updateDiscount: { __typename?: 'DeletionResult', success: boolean, message?: string | null } };

export type DeleteDiscountMutationVariables = Exact<{
  id: Scalars['ID']['input'];
}>;


export type DeleteDiscountMutation = { __typename?: 'Mutation', deleteDiscount: { __typename?: 'DeletionResult', success: boolean, message?: string | null } };

export type ServiceChargesQueryVariables = Exact<{ [key: string]: never; }>;


export type ServiceChargesQuery = { __typename?: 'Query', serviceCharges: Array<{ __typename?: 'ServiceCharge', _id: string, id: string, title: string, value: number, isActive: boolean, createdAt: string, updatedAt: string }> };

export type CreateServiceChargeMutationVariables = Exact<{
  input: ServiceChargeInput;
}>;


export type CreateServiceChargeMutation = { __typename?: 'Mutation', createServiceCharge: { __typename?: 'DeletionResult', success: boolean, message?: string | null } };

export type UpdateServiceChargeMutationVariables = Exact<{
  id: Scalars['ID']['input'];
  input: ServiceChargeInput;
}>;


export type UpdateServiceChargeMutation = { __typename?: 'Mutation', updateServiceCharge: { __typename?: 'DeletionResult', success: boolean, message?: string | null } };

export type DeleteServiceChargeMutationVariables = Exact<{
  id: Scalars['ID']['input'];
}>;


export type DeleteServiceChargeMutation = { __typename?: 'Mutation', deleteServiceCharge: { __typename?: 'DeletionResult', success: boolean, message?: string | null } };

export type UsersQueryVariables = Exact<{ [key: string]: never; }>;


export type UsersQuery = { __typename?: 'Query', users: Array<{ __typename?: 'User', _id: string, username: string, role: UserRole, firstName?: string | null, lastName?: string | null, isActive: boolean, permissions?: any | null, shiftScheduleId?: string | null, createdAt: string, updatedAt: string }> };

export type CreateUserMutationVariables = Exact<{
  username: Scalars['String']['input'];
  password: Scalars['String']['input'];
  role: UserRole;
  firstName?: InputMaybe<Scalars['String']['input']>;
  lastName?: InputMaybe<Scalars['String']['input']>;
  permissions?: InputMaybe<Scalars['JSON']['input']>;
  shiftScheduleId?: InputMaybe<Scalars['ID']['input']>;
}>;


export type CreateUserMutation = { __typename?: 'Mutation', createUser: { __typename?: 'UserResponse', success: boolean, message: string, data?: { __typename?: 'User', _id: string, username: string, role: UserRole, firstName?: string | null, lastName?: string | null, isActive: boolean, permissions?: any | null, shiftScheduleId?: string | null } | null } };

export type UpdateUserMutationVariables = Exact<{
  id: Scalars['ID']['input'];
  username?: InputMaybe<Scalars['String']['input']>;
  password?: InputMaybe<Scalars['String']['input']>;
  role?: InputMaybe<UserRole>;
  isActive?: InputMaybe<Scalars['Boolean']['input']>;
  firstName?: InputMaybe<Scalars['String']['input']>;
  lastName?: InputMaybe<Scalars['String']['input']>;
  permissions?: InputMaybe<Scalars['JSON']['input']>;
  shiftScheduleId?: InputMaybe<Scalars['ID']['input']>;
}>;


export type UpdateUserMutation = { __typename?: 'Mutation', updateUser: { __typename?: 'UserResponse', success: boolean, message: string, data?: { __typename?: 'User', _id: string, username: string, role: UserRole, firstName?: string | null, lastName?: string | null, isActive: boolean, permissions?: any | null, shiftScheduleId?: string | null } | null } };

export type DeleteUserMutationVariables = Exact<{
  id: Scalars['ID']['input'];
}>;


export type DeleteUserMutation = { __typename?: 'Mutation', deleteUser: { __typename?: 'UserResponse', success: boolean, message: string } };

export type ShiftSchedulesQueryVariables = Exact<{ [key: string]: never; }>;


export type ShiftSchedulesQuery = { __typename?: 'Query', shiftSchedules: Array<{ __typename?: 'ShiftSchedule', _id: string, name: string, shiftStartTime: string, breakStartTime: string, breakEndTime: string, shiftEndTime: string, isActive: boolean, isDefault?: boolean | null, createdAt: string, updatedAt: string }> };

export type ShiftScheduleByIdQueryVariables = Exact<{
  id: Scalars['ID']['input'];
}>;


export type ShiftScheduleByIdQuery = { __typename?: 'Query', shiftScheduleById?: { __typename?: 'ShiftSchedule', _id: string, name: string, shiftStartTime: string, breakStartTime: string, breakEndTime: string, shiftEndTime: string, isActive: boolean, isDefault?: boolean | null, createdAt: string, updatedAt: string } | null };

export type CreateShiftScheduleMutationVariables = Exact<{
  input: CreateShiftScheduleInput;
}>;


export type CreateShiftScheduleMutation = { __typename?: 'Mutation', createShiftSchedule: { __typename?: 'ShiftSchedule', _id: string, name: string, shiftStartTime: string, breakStartTime: string, breakEndTime: string, shiftEndTime: string, isActive: boolean, isDefault?: boolean | null, createdAt: string, updatedAt: string } };

export type UpdateShiftScheduleMutationVariables = Exact<{
  input: UpdateShiftScheduleInput;
}>;


export type UpdateShiftScheduleMutation = { __typename?: 'Mutation', updateShiftSchedule: { __typename?: 'ShiftSchedule', _id: string, name: string, shiftStartTime: string, breakStartTime: string, breakEndTime: string, shiftEndTime: string, isActive: boolean, isDefault?: boolean | null, createdAt: string, updatedAt: string } };

export type DeleteShiftScheduleMutationVariables = Exact<{
  id: Scalars['ID']['input'];
}>;


export type DeleteShiftScheduleMutation = { __typename?: 'Mutation', deleteShiftSchedule: boolean };

export type RecordShiftEventMutationVariables = Exact<{
  input: RecordShiftEventInput;
}>;


export type RecordShiftEventMutation = { __typename?: 'Mutation', recordShiftEvent: { __typename?: 'EmployeeShift', _id: string, userId: string, employeeName: string, date: string, attendanceStatus: AttendanceStatus, scheduledStartTime?: string | null, actualStartTime?: string | null, totalHoursWorked: number, status: ShiftStatus, createdAt: string, updatedAt: string, events: Array<{ __typename?: 'ShiftEvent', _id: string, eventType: ShiftEventType, timestamp: string, photo?: string | null, notes?: string | null }> } };

export type MyCurrentShiftQueryVariables = Exact<{ [key: string]: never; }>;


export type MyCurrentShiftQuery = { __typename?: 'Query', myCurrentShift?: { __typename?: 'EmployeeShift', _id: string, userId: string, employeeName: string, date: string, attendanceStatus: AttendanceStatus, scheduledStartTime?: string | null, actualStartTime?: string | null, totalHoursWorked: number, status: ShiftStatus, createdAt: string, updatedAt: string, events: Array<{ __typename?: 'ShiftEvent', _id: string, eventType: ShiftEventType, timestamp: string, photo?: string | null, notes?: string | null }> } | null };

export type MyShiftHistoryQueryVariables = Exact<{
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
}>;


export type MyShiftHistoryQuery = { __typename?: 'Query', myShiftHistory: Array<{ __typename?: 'EmployeeShift', _id: string, userId: string, employeeName: string, date: string, attendanceStatus: AttendanceStatus, scheduledStartTime?: string | null, actualStartTime?: string | null, totalHoursWorked: number, status: ShiftStatus, createdAt: string, updatedAt: string, events: Array<{ __typename?: 'ShiftEvent', _id: string, eventType: ShiftEventType, timestamp: string, photo?: string | null, notes?: string | null }> }> };

export type AllShiftsQueryVariables = Exact<{
  date?: InputMaybe<Scalars['String']['input']>;
  status?: InputMaybe<ShiftStatus>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
}>;


export type AllShiftsQuery = { __typename?: 'Query', allShifts: Array<{ __typename?: 'EmployeeShift', _id: string, userId: string, employeeName: string, date: string, attendanceStatus: AttendanceStatus, scheduledStartTime?: string | null, actualStartTime?: string | null, totalHoursWorked: number, status: ShiftStatus, createdAt: string, updatedAt: string, events: Array<{ __typename?: 'ShiftEvent', _id: string, eventType: ShiftEventType, timestamp: string, photo?: string | null, notes?: string | null }> }> };

export type ShiftByIdQueryVariables = Exact<{
  id: Scalars['ID']['input'];
}>;


export type ShiftByIdQuery = { __typename?: 'Query', shiftById?: { __typename?: 'EmployeeShift', _id: string, userId: string, employeeName: string, date: string, totalHoursWorked: number, status: ShiftStatus, createdAt: string, updatedAt: string, events: Array<{ __typename?: 'ShiftEvent', _id: string, eventType: ShiftEventType, timestamp: string, photo?: string | null, notes?: string | null }> } | null };


export const MeDocument = gql`
    query Me {
  me {
    _id
    username
    role
    firstName
    lastName
    isActive
    permissions
  }
}
    `;

/**
 * __useMeQuery__
 *
 * To run a query within a React component, call `useMeQuery` and pass it any options that fit your needs.
 * When your component renders, `useMeQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useMeQuery({
 *   variables: {
 *   },
 * });
 */
export function useMeQuery(baseOptions?: Apollo.QueryHookOptions<MeQuery, MeQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<MeQuery, MeQueryVariables>(MeDocument, options);
      }
export function useMeLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<MeQuery, MeQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<MeQuery, MeQueryVariables>(MeDocument, options);
        }
export function useMeSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<MeQuery, MeQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<MeQuery, MeQueryVariables>(MeDocument, options);
        }
export type MeQueryHookResult = ReturnType<typeof useMeQuery>;
export type MeLazyQueryHookResult = ReturnType<typeof useMeLazyQuery>;
export type MeSuspenseQueryHookResult = ReturnType<typeof useMeSuspenseQuery>;
export type MeQueryResult = Apollo.QueryResult<MeQuery, MeQueryVariables>;
export const CurrentCashDrawerDocument = gql`
    query CurrentCashDrawer {
  currentCashDrawer {
    _id
    openedBy
    openedAt
    openingBalance
    status
    currentBalance
    totalCashIn
    totalCashOut
    totalSales
    cashSales
    bankTransferSales
    cardSales
    creditSales
    gcashSales
    transactions {
      _id
      type
      amount
      description
      saleId
      paymentMethod
      createdAt
    }
  }
}
    `;

/**
 * __useCurrentCashDrawerQuery__
 *
 * To run a query within a React component, call `useCurrentCashDrawerQuery` and pass it any options that fit your needs.
 * When your component renders, `useCurrentCashDrawerQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useCurrentCashDrawerQuery({
 *   variables: {
 *   },
 * });
 */
export function useCurrentCashDrawerQuery(baseOptions?: Apollo.QueryHookOptions<CurrentCashDrawerQuery, CurrentCashDrawerQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<CurrentCashDrawerQuery, CurrentCashDrawerQueryVariables>(CurrentCashDrawerDocument, options);
      }
export function useCurrentCashDrawerLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<CurrentCashDrawerQuery, CurrentCashDrawerQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<CurrentCashDrawerQuery, CurrentCashDrawerQueryVariables>(CurrentCashDrawerDocument, options);
        }
export function useCurrentCashDrawerSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<CurrentCashDrawerQuery, CurrentCashDrawerQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<CurrentCashDrawerQuery, CurrentCashDrawerQueryVariables>(CurrentCashDrawerDocument, options);
        }
export type CurrentCashDrawerQueryHookResult = ReturnType<typeof useCurrentCashDrawerQuery>;
export type CurrentCashDrawerLazyQueryHookResult = ReturnType<typeof useCurrentCashDrawerLazyQuery>;
export type CurrentCashDrawerSuspenseQueryHookResult = ReturnType<typeof useCurrentCashDrawerSuspenseQuery>;
export type CurrentCashDrawerQueryResult = Apollo.QueryResult<CurrentCashDrawerQuery, CurrentCashDrawerQueryVariables>;
export const CashDrawerHistoryDocument = gql`
    query CashDrawerHistory($limit: Int) {
  cashDrawerHistory(limit: $limit) {
    _id
    openedBy
    openedAt
    closedAt
    openingBalance
    closingBalance
    expectedBalance
    status
    currentBalance
    totalCashIn
    totalCashOut
    totalSales
    cashSales
    bankTransferSales
    cardSales
    creditSales
    gcashSales
  }
}
    `;

/**
 * __useCashDrawerHistoryQuery__
 *
 * To run a query within a React component, call `useCashDrawerHistoryQuery` and pass it any options that fit your needs.
 * When your component renders, `useCashDrawerHistoryQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useCashDrawerHistoryQuery({
 *   variables: {
 *      limit: // value for 'limit'
 *   },
 * });
 */
export function useCashDrawerHistoryQuery(baseOptions?: Apollo.QueryHookOptions<CashDrawerHistoryQuery, CashDrawerHistoryQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<CashDrawerHistoryQuery, CashDrawerHistoryQueryVariables>(CashDrawerHistoryDocument, options);
      }
export function useCashDrawerHistoryLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<CashDrawerHistoryQuery, CashDrawerHistoryQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<CashDrawerHistoryQuery, CashDrawerHistoryQueryVariables>(CashDrawerHistoryDocument, options);
        }
export function useCashDrawerHistorySuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<CashDrawerHistoryQuery, CashDrawerHistoryQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<CashDrawerHistoryQuery, CashDrawerHistoryQueryVariables>(CashDrawerHistoryDocument, options);
        }
export type CashDrawerHistoryQueryHookResult = ReturnType<typeof useCashDrawerHistoryQuery>;
export type CashDrawerHistoryLazyQueryHookResult = ReturnType<typeof useCashDrawerHistoryLazyQuery>;
export type CashDrawerHistorySuspenseQueryHookResult = ReturnType<typeof useCashDrawerHistorySuspenseQuery>;
export type CashDrawerHistoryQueryResult = Apollo.QueryResult<CashDrawerHistoryQuery, CashDrawerHistoryQueryVariables>;
export const OpenCashDrawerDocument = gql`
    mutation OpenCashDrawer($openingBalance: Float!) {
  openCashDrawer(openingBalance: $openingBalance) {
    success
    message
    data {
      _id
      openedBy
      openedAt
      openingBalance
      status
      currentBalance
    }
  }
}
    `;
export type OpenCashDrawerMutationFn = Apollo.MutationFunction<OpenCashDrawerMutation, OpenCashDrawerMutationVariables>;

/**
 * __useOpenCashDrawerMutation__
 *
 * To run a mutation, you first call `useOpenCashDrawerMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useOpenCashDrawerMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [openCashDrawerMutation, { data, loading, error }] = useOpenCashDrawerMutation({
 *   variables: {
 *      openingBalance: // value for 'openingBalance'
 *   },
 * });
 */
export function useOpenCashDrawerMutation(baseOptions?: Apollo.MutationHookOptions<OpenCashDrawerMutation, OpenCashDrawerMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<OpenCashDrawerMutation, OpenCashDrawerMutationVariables>(OpenCashDrawerDocument, options);
      }
export type OpenCashDrawerMutationHookResult = ReturnType<typeof useOpenCashDrawerMutation>;
export type OpenCashDrawerMutationResult = Apollo.MutationResult<OpenCashDrawerMutation>;
export type OpenCashDrawerMutationOptions = Apollo.BaseMutationOptions<OpenCashDrawerMutation, OpenCashDrawerMutationVariables>;
export const CloseCashDrawerDocument = gql`
    mutation CloseCashDrawer($closingBalance: Float!) {
  closeCashDrawer(closingBalance: $closingBalance) {
    success
    message
    data {
      _id
      closedAt
      closingBalance
      expectedBalance
      status
    }
  }
}
    `;
export type CloseCashDrawerMutationFn = Apollo.MutationFunction<CloseCashDrawerMutation, CloseCashDrawerMutationVariables>;

/**
 * __useCloseCashDrawerMutation__
 *
 * To run a mutation, you first call `useCloseCashDrawerMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useCloseCashDrawerMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [closeCashDrawerMutation, { data, loading, error }] = useCloseCashDrawerMutation({
 *   variables: {
 *      closingBalance: // value for 'closingBalance'
 *   },
 * });
 */
export function useCloseCashDrawerMutation(baseOptions?: Apollo.MutationHookOptions<CloseCashDrawerMutation, CloseCashDrawerMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<CloseCashDrawerMutation, CloseCashDrawerMutationVariables>(CloseCashDrawerDocument, options);
      }
export type CloseCashDrawerMutationHookResult = ReturnType<typeof useCloseCashDrawerMutation>;
export type CloseCashDrawerMutationResult = Apollo.MutationResult<CloseCashDrawerMutation>;
export type CloseCashDrawerMutationOptions = Apollo.BaseMutationOptions<CloseCashDrawerMutation, CloseCashDrawerMutationVariables>;
export const AddCashInDocument = gql`
    mutation AddCashIn($amount: Float!, $description: String!) {
  addCashIn(amount: $amount, description: $description) {
    success
    message
    data {
      _id
      currentBalance
      totalCashIn
    }
  }
}
    `;
export type AddCashInMutationFn = Apollo.MutationFunction<AddCashInMutation, AddCashInMutationVariables>;

/**
 * __useAddCashInMutation__
 *
 * To run a mutation, you first call `useAddCashInMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useAddCashInMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [addCashInMutation, { data, loading, error }] = useAddCashInMutation({
 *   variables: {
 *      amount: // value for 'amount'
 *      description: // value for 'description'
 *   },
 * });
 */
export function useAddCashInMutation(baseOptions?: Apollo.MutationHookOptions<AddCashInMutation, AddCashInMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<AddCashInMutation, AddCashInMutationVariables>(AddCashInDocument, options);
      }
export type AddCashInMutationHookResult = ReturnType<typeof useAddCashInMutation>;
export type AddCashInMutationResult = Apollo.MutationResult<AddCashInMutation>;
export type AddCashInMutationOptions = Apollo.BaseMutationOptions<AddCashInMutation, AddCashInMutationVariables>;
export const AddCashOutDocument = gql`
    mutation AddCashOut($amount: Float!, $description: String!) {
  addCashOut(amount: $amount, description: $description) {
    success
    message
    data {
      _id
      currentBalance
      totalCashOut
    }
  }
}
    `;
export type AddCashOutMutationFn = Apollo.MutationFunction<AddCashOutMutation, AddCashOutMutationVariables>;

/**
 * __useAddCashOutMutation__
 *
 * To run a mutation, you first call `useAddCashOutMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useAddCashOutMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [addCashOutMutation, { data, loading, error }] = useAddCashOutMutation({
 *   variables: {
 *      amount: // value for 'amount'
 *      description: // value for 'description'
 *   },
 * });
 */
export function useAddCashOutMutation(baseOptions?: Apollo.MutationHookOptions<AddCashOutMutation, AddCashOutMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<AddCashOutMutation, AddCashOutMutationVariables>(AddCashOutDocument, options);
      }
export type AddCashOutMutationHookResult = ReturnType<typeof useAddCashOutMutation>;
export type AddCashOutMutationResult = Apollo.MutationResult<AddCashOutMutation>;
export type AddCashOutMutationOptions = Apollo.BaseMutationOptions<AddCashOutMutation, AddCashOutMutationVariables>;
export const SaleReportDocument = gql`
    query SaleReport($startDate: String, $endDate: String, $year: String) {
  saleReport(startDate: $startDate, endDate: $endDate, year: $year) {
    totalAmountSales
    totalCostOfGoods
    grossProfit
    totalItemsSold
    totalSalesPercentage
    totalCostPercentage
    grossProfitPercentage
    availableYears
    numberOfTransactions
    totalDiscounts
    totalNetSales
    topProductSold {
      name
      quantity
    }
    groupSales {
      month
      totalAmountSales
      totalCostOfGoods
      grossProfit
      totalItemsSold
    }
    salesByPaymentMethod {
      paymentMethod
      totalAmount
      count
    }
    totalRefunds
    numberOfRefunds
    salesByItem {
      itemName
      totalAmount
      quantity
    }
    salesByCashier {
      cashierName
      totalAmount
      count
    }
    salesByHour {
      hour
      totalAmount
      count
    }
  }
}
    `;

/**
 * __useSaleReportQuery__
 *
 * To run a query within a React component, call `useSaleReportQuery` and pass it any options that fit your needs.
 * When your component renders, `useSaleReportQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useSaleReportQuery({
 *   variables: {
 *      startDate: // value for 'startDate'
 *      endDate: // value for 'endDate'
 *      year: // value for 'year'
 *   },
 * });
 */
export function useSaleReportQuery(baseOptions?: Apollo.QueryHookOptions<SaleReportQuery, SaleReportQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<SaleReportQuery, SaleReportQueryVariables>(SaleReportDocument, options);
      }
export function useSaleReportLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<SaleReportQuery, SaleReportQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<SaleReportQuery, SaleReportQueryVariables>(SaleReportDocument, options);
        }
export function useSaleReportSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<SaleReportQuery, SaleReportQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<SaleReportQuery, SaleReportQueryVariables>(SaleReportDocument, options);
        }
export type SaleReportQueryHookResult = ReturnType<typeof useSaleReportQuery>;
export type SaleReportLazyQueryHookResult = ReturnType<typeof useSaleReportLazyQuery>;
export type SaleReportSuspenseQueryHookResult = ReturnType<typeof useSaleReportSuspenseQuery>;
export type SaleReportQueryResult = Apollo.QueryResult<SaleReportQuery, SaleReportQueryVariables>;
export const GetItemsDocument = gql`
    query GetItems($search: String, $limit: Int, $skip: Int) {
  itemsList(search: $search, limit: $limit, skip: $skip) {
    items {
      _id
      name
      unit
      pricePerUnit
      currentStock
      updatedAt
      createdAt
      isActive
    }
    totalCount
  }
}
    `;

/**
 * __useGetItemsQuery__
 *
 * To run a query within a React component, call `useGetItemsQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetItemsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetItemsQuery({
 *   variables: {
 *      search: // value for 'search'
 *      limit: // value for 'limit'
 *      skip: // value for 'skip'
 *   },
 * });
 */
export function useGetItemsQuery(baseOptions?: Apollo.QueryHookOptions<GetItemsQuery, GetItemsQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetItemsQuery, GetItemsQueryVariables>(GetItemsDocument, options);
      }
export function useGetItemsLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetItemsQuery, GetItemsQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetItemsQuery, GetItemsQueryVariables>(GetItemsDocument, options);
        }
export function useGetItemsSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetItemsQuery, GetItemsQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<GetItemsQuery, GetItemsQueryVariables>(GetItemsDocument, options);
        }
export type GetItemsQueryHookResult = ReturnType<typeof useGetItemsQuery>;
export type GetItemsLazyQueryHookResult = ReturnType<typeof useGetItemsLazyQuery>;
export type GetItemsSuspenseQueryHookResult = ReturnType<typeof useGetItemsSuspenseQuery>;
export type GetItemsQueryResult = Apollo.QueryResult<GetItemsQuery, GetItemsQueryVariables>;
export const AddItemDocument = gql`
    mutation AddItem($id: ID, $name: String!, $unit: String!, $pricePerUnit: Float!, $currentStock: Float!) {
  addItem(
    _id: $id
    name: $name
    unit: $unit
    pricePerUnit: $pricePerUnit
    currentStock: $currentStock
  ) {
    success
    message
    data {
      _id
      name
      unit
      pricePerUnit
      currentStock
      createdAt
      updatedAt
    }
  }
}
    `;
export type AddItemMutationFn = Apollo.MutationFunction<AddItemMutation, AddItemMutationVariables>;

/**
 * __useAddItemMutation__
 *
 * To run a mutation, you first call `useAddItemMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useAddItemMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [addItemMutation, { data, loading, error }] = useAddItemMutation({
 *   variables: {
 *      id: // value for 'id'
 *      name: // value for 'name'
 *      unit: // value for 'unit'
 *      pricePerUnit: // value for 'pricePerUnit'
 *      currentStock: // value for 'currentStock'
 *   },
 * });
 */
export function useAddItemMutation(baseOptions?: Apollo.MutationHookOptions<AddItemMutation, AddItemMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<AddItemMutation, AddItemMutationVariables>(AddItemDocument, options);
      }
export type AddItemMutationHookResult = ReturnType<typeof useAddItemMutation>;
export type AddItemMutationResult = Apollo.MutationResult<AddItemMutation>;
export type AddItemMutationOptions = Apollo.BaseMutationOptions<AddItemMutation, AddItemMutationVariables>;
export const DeleteItemDocument = gql`
    mutation DeleteItem($id: ID!) {
  deleteItem(_id: $id) {
    success
    message
  }
}
    `;
export type DeleteItemMutationFn = Apollo.MutationFunction<DeleteItemMutation, DeleteItemMutationVariables>;

/**
 * __useDeleteItemMutation__
 *
 * To run a mutation, you first call `useDeleteItemMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useDeleteItemMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [deleteItemMutation, { data, loading, error }] = useDeleteItemMutation({
 *   variables: {
 *      id: // value for 'id'
 *   },
 * });
 */
export function useDeleteItemMutation(baseOptions?: Apollo.MutationHookOptions<DeleteItemMutation, DeleteItemMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<DeleteItemMutation, DeleteItemMutationVariables>(DeleteItemDocument, options);
      }
export type DeleteItemMutationHookResult = ReturnType<typeof useDeleteItemMutation>;
export type DeleteItemMutationResult = Apollo.MutationResult<DeleteItemMutation>;
export type DeleteItemMutationOptions = Apollo.BaseMutationOptions<DeleteItemMutation, DeleteItemMutationVariables>;
export const GetInactiveItemsDocument = gql`
    query GetInactiveItems($search: String, $limit: Int, $skip: Int) {
  inactiveItemsList(search: $search, limit: $limit, skip: $skip) {
    items {
      _id
      name
      unit
      pricePerUnit
      currentStock
      updatedAt
      createdAt
    }
    totalCount
  }
}
    `;

/**
 * __useGetInactiveItemsQuery__
 *
 * To run a query within a React component, call `useGetInactiveItemsQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetInactiveItemsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetInactiveItemsQuery({
 *   variables: {
 *      search: // value for 'search'
 *      limit: // value for 'limit'
 *      skip: // value for 'skip'
 *   },
 * });
 */
export function useGetInactiveItemsQuery(baseOptions?: Apollo.QueryHookOptions<GetInactiveItemsQuery, GetInactiveItemsQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetInactiveItemsQuery, GetInactiveItemsQueryVariables>(GetInactiveItemsDocument, options);
      }
export function useGetInactiveItemsLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetInactiveItemsQuery, GetInactiveItemsQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetInactiveItemsQuery, GetInactiveItemsQueryVariables>(GetInactiveItemsDocument, options);
        }
export function useGetInactiveItemsSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetInactiveItemsQuery, GetInactiveItemsQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<GetInactiveItemsQuery, GetInactiveItemsQueryVariables>(GetInactiveItemsDocument, options);
        }
export type GetInactiveItemsQueryHookResult = ReturnType<typeof useGetInactiveItemsQuery>;
export type GetInactiveItemsLazyQueryHookResult = ReturnType<typeof useGetInactiveItemsLazyQuery>;
export type GetInactiveItemsSuspenseQueryHookResult = ReturnType<typeof useGetInactiveItemsSuspenseQuery>;
export type GetInactiveItemsQueryResult = Apollo.QueryResult<GetInactiveItemsQuery, GetInactiveItemsQueryVariables>;
export const ReactivateItemDocument = gql`
    mutation ReactivateItem($id: ID!) {
  reactivateItem(_id: $id) {
    success
    message
    data {
      _id
      name
      unit
      pricePerUnit
      currentStock
      isActive
    }
  }
}
    `;
export type ReactivateItemMutationFn = Apollo.MutationFunction<ReactivateItemMutation, ReactivateItemMutationVariables>;

/**
 * __useReactivateItemMutation__
 *
 * To run a mutation, you first call `useReactivateItemMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useReactivateItemMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [reactivateItemMutation, { data, loading, error }] = useReactivateItemMutation({
 *   variables: {
 *      id: // value for 'id'
 *   },
 * });
 */
export function useReactivateItemMutation(baseOptions?: Apollo.MutationHookOptions<ReactivateItemMutation, ReactivateItemMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<ReactivateItemMutation, ReactivateItemMutationVariables>(ReactivateItemDocument, options);
      }
export type ReactivateItemMutationHookResult = ReturnType<typeof useReactivateItemMutation>;
export type ReactivateItemMutationResult = Apollo.MutationResult<ReactivateItemMutation>;
export type ReactivateItemMutationOptions = Apollo.BaseMutationOptions<ReactivateItemMutation, ReactivateItemMutationVariables>;
export const ParkSaleDocument = gql`
    mutation ParkSale($id: ID, $items: [SaleItemInput!]!, $orderType: OrderType!, $tableNumber: String) {
  parkSale(
    id: $id
    items: $items
    orderType: $orderType
    tableNumber: $tableNumber
  ) {
    success
    message
    data {
      _id
      totalAmount
      grossProfit
      orderNo
      status
    }
  }
}
    `;
export type ParkSaleMutationFn = Apollo.MutationFunction<ParkSaleMutation, ParkSaleMutationVariables>;

/**
 * __useParkSaleMutation__
 *
 * To run a mutation, you first call `useParkSaleMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useParkSaleMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [parkSaleMutation, { data, loading, error }] = useParkSaleMutation({
 *   variables: {
 *      id: // value for 'id'
 *      items: // value for 'items'
 *      orderType: // value for 'orderType'
 *      tableNumber: // value for 'tableNumber'
 *   },
 * });
 */
export function useParkSaleMutation(baseOptions?: Apollo.MutationHookOptions<ParkSaleMutation, ParkSaleMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<ParkSaleMutation, ParkSaleMutationVariables>(ParkSaleDocument, options);
      }
export type ParkSaleMutationHookResult = ReturnType<typeof useParkSaleMutation>;
export type ParkSaleMutationResult = Apollo.MutationResult<ParkSaleMutation>;
export type ParkSaleMutationOptions = Apollo.BaseMutationOptions<ParkSaleMutation, ParkSaleMutationVariables>;
export const CheckoutSaleDocument = gql`
    mutation CheckoutSale($id: ID, $items: [SaleItemInput!]!, $orderType: OrderType!, $tableNumber: String, $paymentMethod: String) {
  checkoutSale(
    id: $id
    items: $items
    orderType: $orderType
    tableNumber: $tableNumber
    paymentMethod: $paymentMethod
  ) {
    success
    message
    data {
      _id
      totalAmount
      grossProfit
      orderNo
      status
    }
  }
}
    `;
export type CheckoutSaleMutationFn = Apollo.MutationFunction<CheckoutSaleMutation, CheckoutSaleMutationVariables>;

/**
 * __useCheckoutSaleMutation__
 *
 * To run a mutation, you first call `useCheckoutSaleMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useCheckoutSaleMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [checkoutSaleMutation, { data, loading, error }] = useCheckoutSaleMutation({
 *   variables: {
 *      id: // value for 'id'
 *      items: // value for 'items'
 *      orderType: // value for 'orderType'
 *      tableNumber: // value for 'tableNumber'
 *      paymentMethod: // value for 'paymentMethod'
 *   },
 * });
 */
export function useCheckoutSaleMutation(baseOptions?: Apollo.MutationHookOptions<CheckoutSaleMutation, CheckoutSaleMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<CheckoutSaleMutation, CheckoutSaleMutationVariables>(CheckoutSaleDocument, options);
      }
export type CheckoutSaleMutationHookResult = ReturnType<typeof useCheckoutSaleMutation>;
export type CheckoutSaleMutationResult = Apollo.MutationResult<CheckoutSaleMutation>;
export type CheckoutSaleMutationOptions = Apollo.BaseMutationOptions<CheckoutSaleMutation, CheckoutSaleMutationVariables>;
export const SendToKitchenDocument = gql`
    mutation SendToKitchen($saleId: ID!, $itemIds: [ID!]!) {
  sendToKitchen(saleId: $saleId, itemIds: $itemIds) {
    success
    message
  }
}
    `;
export type SendToKitchenMutationFn = Apollo.MutationFunction<SendToKitchenMutation, SendToKitchenMutationVariables>;

/**
 * __useSendToKitchenMutation__
 *
 * To run a mutation, you first call `useSendToKitchenMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useSendToKitchenMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [sendToKitchenMutation, { data, loading, error }] = useSendToKitchenMutation({
 *   variables: {
 *      saleId: // value for 'saleId'
 *      itemIds: // value for 'itemIds'
 *   },
 * });
 */
export function useSendToKitchenMutation(baseOptions?: Apollo.MutationHookOptions<SendToKitchenMutation, SendToKitchenMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<SendToKitchenMutation, SendToKitchenMutationVariables>(SendToKitchenDocument, options);
      }
export type SendToKitchenMutationHookResult = ReturnType<typeof useSendToKitchenMutation>;
export type SendToKitchenMutationResult = Apollo.MutationResult<SendToKitchenMutation>;
export type SendToKitchenMutationOptions = Apollo.BaseMutationOptions<SendToKitchenMutation, SendToKitchenMutationVariables>;
export const ParkedSalesDocument = gql`
    query ParkedSales {
  parkedSales {
    _id
    totalAmount
    orderNo
    orderType
    tableNumber
    createdAt
    updatedAt
    saleItems {
      _id
      quantity
      priceAtSale
      quantityPrinted
      product {
        _id
        name
        price
        createdAt
        updatedAt
        ingredientsUsed {
          _id
          itemId
          productId
          quantityUsed
          item {
            _id
            name
          }
        }
      }
    }
  }
}
    `;

/**
 * __useParkedSalesQuery__
 *
 * To run a query within a React component, call `useParkedSalesQuery` and pass it any options that fit your needs.
 * When your component renders, `useParkedSalesQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useParkedSalesQuery({
 *   variables: {
 *   },
 * });
 */
export function useParkedSalesQuery(baseOptions?: Apollo.QueryHookOptions<ParkedSalesQuery, ParkedSalesQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<ParkedSalesQuery, ParkedSalesQueryVariables>(ParkedSalesDocument, options);
      }
export function useParkedSalesLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<ParkedSalesQuery, ParkedSalesQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<ParkedSalesQuery, ParkedSalesQueryVariables>(ParkedSalesDocument, options);
        }
export function useParkedSalesSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<ParkedSalesQuery, ParkedSalesQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<ParkedSalesQuery, ParkedSalesQueryVariables>(ParkedSalesDocument, options);
        }
export type ParkedSalesQueryHookResult = ReturnType<typeof useParkedSalesQuery>;
export type ParkedSalesLazyQueryHookResult = ReturnType<typeof useParkedSalesLazyQuery>;
export type ParkedSalesSuspenseQueryHookResult = ReturnType<typeof useParkedSalesSuspenseQuery>;
export type ParkedSalesQueryResult = Apollo.QueryResult<ParkedSalesQuery, ParkedSalesQueryVariables>;
export const DeleteParkedSaleDocument = gql`
    mutation DeleteParkedSale($id: ID!) {
  deleteParkedSale(id: $id) {
    success
    message
  }
}
    `;
export type DeleteParkedSaleMutationFn = Apollo.MutationFunction<DeleteParkedSaleMutation, DeleteParkedSaleMutationVariables>;

/**
 * __useDeleteParkedSaleMutation__
 *
 * To run a mutation, you first call `useDeleteParkedSaleMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useDeleteParkedSaleMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [deleteParkedSaleMutation, { data, loading, error }] = useDeleteParkedSaleMutation({
 *   variables: {
 *      id: // value for 'id'
 *   },
 * });
 */
export function useDeleteParkedSaleMutation(baseOptions?: Apollo.MutationHookOptions<DeleteParkedSaleMutation, DeleteParkedSaleMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<DeleteParkedSaleMutation, DeleteParkedSaleMutationVariables>(DeleteParkedSaleDocument, options);
      }
export type DeleteParkedSaleMutationHookResult = ReturnType<typeof useDeleteParkedSaleMutation>;
export type DeleteParkedSaleMutationResult = Apollo.MutationResult<DeleteParkedSaleMutation>;
export type DeleteParkedSaleMutationOptions = Apollo.BaseMutationOptions<DeleteParkedSaleMutation, DeleteParkedSaleMutationVariables>;
export const RecordSaleDocument = gql`
    mutation RecordSale($items: [SaleItemInput!]!) {
  recordSale(items: $items) {
    success
    message
    data {
      _id
      totalAmount
      grossProfit
      orderNo
      status
    }
  }
}
    `;
export type RecordSaleMutationFn = Apollo.MutationFunction<RecordSaleMutation, RecordSaleMutationVariables>;

/**
 * __useRecordSaleMutation__
 *
 * To run a mutation, you first call `useRecordSaleMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useRecordSaleMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [recordSaleMutation, { data, loading, error }] = useRecordSaleMutation({
 *   variables: {
 *      items: // value for 'items'
 *   },
 * });
 */
export function useRecordSaleMutation(baseOptions?: Apollo.MutationHookOptions<RecordSaleMutation, RecordSaleMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<RecordSaleMutation, RecordSaleMutationVariables>(RecordSaleDocument, options);
      }
export type RecordSaleMutationHookResult = ReturnType<typeof useRecordSaleMutation>;
export type RecordSaleMutationResult = Apollo.MutationResult<RecordSaleMutation>;
export type RecordSaleMutationOptions = Apollo.BaseMutationOptions<RecordSaleMutation, RecordSaleMutationVariables>;
export const ProductsDocument = gql`
    query Products($search: String, $limit: Int, $skip: Int) {
  productsList(search: $search, limit: $limit, skip: $skip) {
    products {
      _id
      name
      price
      ingredientsUsed {
        _id
        productId
        itemId
        quantityUsed
        item {
          _id
          name
          unit
          pricePerUnit
          isActive
        }
      }
      createdAt
      updatedAt
    }
    totalCount
  }
}
    `;

/**
 * __useProductsQuery__
 *
 * To run a query within a React component, call `useProductsQuery` and pass it any options that fit your needs.
 * When your component renders, `useProductsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useProductsQuery({
 *   variables: {
 *      search: // value for 'search'
 *      limit: // value for 'limit'
 *      skip: // value for 'skip'
 *   },
 * });
 */
export function useProductsQuery(baseOptions?: Apollo.QueryHookOptions<ProductsQuery, ProductsQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<ProductsQuery, ProductsQueryVariables>(ProductsDocument, options);
      }
export function useProductsLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<ProductsQuery, ProductsQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<ProductsQuery, ProductsQueryVariables>(ProductsDocument, options);
        }
export function useProductsSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<ProductsQuery, ProductsQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<ProductsQuery, ProductsQueryVariables>(ProductsDocument, options);
        }
export type ProductsQueryHookResult = ReturnType<typeof useProductsQuery>;
export type ProductsLazyQueryHookResult = ReturnType<typeof useProductsLazyQuery>;
export type ProductsSuspenseQueryHookResult = ReturnType<typeof useProductsSuspenseQuery>;
export type ProductsQueryResult = Apollo.QueryResult<ProductsQuery, ProductsQueryVariables>;
export const AddProductDocument = gql`
    mutation addProduct($id: ID, $name: String!, $price: Float!, $items: [ProductIngredientInput!]!) {
  addProduct(id: $id, name: $name, price: $price, items: $items) {
    success
    message
    data {
      _id
      name
      price
      ingredientsUsed {
        _id
        productId
        itemId
        quantityUsed
        item {
          _id
          name
          unit
          pricePerUnit
        }
      }
      createdAt
      updatedAt
    }
  }
}
    `;
export type AddProductMutationFn = Apollo.MutationFunction<AddProductMutation, AddProductMutationVariables>;

/**
 * __useAddProductMutation__
 *
 * To run a mutation, you first call `useAddProductMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useAddProductMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [addProductMutation, { data, loading, error }] = useAddProductMutation({
 *   variables: {
 *      id: // value for 'id'
 *      name: // value for 'name'
 *      price: // value for 'price'
 *      items: // value for 'items'
 *   },
 * });
 */
export function useAddProductMutation(baseOptions?: Apollo.MutationHookOptions<AddProductMutation, AddProductMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<AddProductMutation, AddProductMutationVariables>(AddProductDocument, options);
      }
export type AddProductMutationHookResult = ReturnType<typeof useAddProductMutation>;
export type AddProductMutationResult = Apollo.MutationResult<AddProductMutation>;
export type AddProductMutationOptions = Apollo.BaseMutationOptions<AddProductMutation, AddProductMutationVariables>;
export const DeleteProductDocument = gql`
    mutation DeleteProduct($id: ID!) {
  deleteProduct(id: $id) {
    success
    message
  }
}
    `;
export type DeleteProductMutationFn = Apollo.MutationFunction<DeleteProductMutation, DeleteProductMutationVariables>;

/**
 * __useDeleteProductMutation__
 *
 * To run a mutation, you first call `useDeleteProductMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useDeleteProductMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [deleteProductMutation, { data, loading, error }] = useDeleteProductMutation({
 *   variables: {
 *      id: // value for 'id'
 *   },
 * });
 */
export function useDeleteProductMutation(baseOptions?: Apollo.MutationHookOptions<DeleteProductMutation, DeleteProductMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<DeleteProductMutation, DeleteProductMutationVariables>(DeleteProductDocument, options);
      }
export type DeleteProductMutationHookResult = ReturnType<typeof useDeleteProductMutation>;
export type DeleteProductMutationResult = Apollo.MutationResult<DeleteProductMutation>;
export type DeleteProductMutationOptions = Apollo.BaseMutationOptions<DeleteProductMutation, DeleteProductMutationVariables>;
export const GetInactiveProductsDocument = gql`
    query GetInactiveProducts($search: String, $limit: Int, $skip: Int) {
  inactiveProductsList(search: $search, limit: $limit, skip: $skip) {
    products {
      _id
      name
      price
      ingredientsUsed {
        _id
        productId
        itemId
        quantityUsed
        item {
          _id
          name
          unit
          pricePerUnit
        }
      }
      createdAt
      updatedAt
    }
    totalCount
  }
}
    `;

/**
 * __useGetInactiveProductsQuery__
 *
 * To run a query within a React component, call `useGetInactiveProductsQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetInactiveProductsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetInactiveProductsQuery({
 *   variables: {
 *      search: // value for 'search'
 *      limit: // value for 'limit'
 *      skip: // value for 'skip'
 *   },
 * });
 */
export function useGetInactiveProductsQuery(baseOptions?: Apollo.QueryHookOptions<GetInactiveProductsQuery, GetInactiveProductsQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetInactiveProductsQuery, GetInactiveProductsQueryVariables>(GetInactiveProductsDocument, options);
      }
export function useGetInactiveProductsLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetInactiveProductsQuery, GetInactiveProductsQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetInactiveProductsQuery, GetInactiveProductsQueryVariables>(GetInactiveProductsDocument, options);
        }
export function useGetInactiveProductsSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetInactiveProductsQuery, GetInactiveProductsQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<GetInactiveProductsQuery, GetInactiveProductsQueryVariables>(GetInactiveProductsDocument, options);
        }
export type GetInactiveProductsQueryHookResult = ReturnType<typeof useGetInactiveProductsQuery>;
export type GetInactiveProductsLazyQueryHookResult = ReturnType<typeof useGetInactiveProductsLazyQuery>;
export type GetInactiveProductsSuspenseQueryHookResult = ReturnType<typeof useGetInactiveProductsSuspenseQuery>;
export type GetInactiveProductsQueryResult = Apollo.QueryResult<GetInactiveProductsQuery, GetInactiveProductsQueryVariables>;
export const ReactivateProductDocument = gql`
    mutation ReactivateProduct($id: ID!) {
  reactivateProduct(id: $id) {
    success
    message
    data {
      _id
      name
      price
      isActive
    }
  }
}
    `;
export type ReactivateProductMutationFn = Apollo.MutationFunction<ReactivateProductMutation, ReactivateProductMutationVariables>;

/**
 * __useReactivateProductMutation__
 *
 * To run a mutation, you first call `useReactivateProductMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useReactivateProductMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [reactivateProductMutation, { data, loading, error }] = useReactivateProductMutation({
 *   variables: {
 *      id: // value for 'id'
 *   },
 * });
 */
export function useReactivateProductMutation(baseOptions?: Apollo.MutationHookOptions<ReactivateProductMutation, ReactivateProductMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<ReactivateProductMutation, ReactivateProductMutationVariables>(ReactivateProductDocument, options);
      }
export type ReactivateProductMutationHookResult = ReturnType<typeof useReactivateProductMutation>;
export type ReactivateProductMutationResult = Apollo.MutationResult<ReactivateProductMutation>;
export type ReactivateProductMutationOptions = Apollo.BaseMutationOptions<ReactivateProductMutation, ReactivateProductMutationVariables>;
export const ProductsByIngredientDocument = gql`
    query ProductsByIngredient($itemId: ID!) {
  productsByIngredient(itemId: $itemId) {
    _id
    id
    name
    price
    ingredientsUsed {
      _id
      id
      itemId
      quantityUsed
      item {
        _id
        id
        name
        unit
      }
    }
    createdAt
    updatedAt
  }
}
    `;

/**
 * __useProductsByIngredientQuery__
 *
 * To run a query within a React component, call `useProductsByIngredientQuery` and pass it any options that fit your needs.
 * When your component renders, `useProductsByIngredientQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useProductsByIngredientQuery({
 *   variables: {
 *      itemId: // value for 'itemId'
 *   },
 * });
 */
export function useProductsByIngredientQuery(baseOptions: Apollo.QueryHookOptions<ProductsByIngredientQuery, ProductsByIngredientQueryVariables> & ({ variables: ProductsByIngredientQueryVariables; skip?: boolean; } | { skip: boolean; }) ) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<ProductsByIngredientQuery, ProductsByIngredientQueryVariables>(ProductsByIngredientDocument, options);
      }
export function useProductsByIngredientLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<ProductsByIngredientQuery, ProductsByIngredientQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<ProductsByIngredientQuery, ProductsByIngredientQueryVariables>(ProductsByIngredientDocument, options);
        }
export function useProductsByIngredientSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<ProductsByIngredientQuery, ProductsByIngredientQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<ProductsByIngredientQuery, ProductsByIngredientQueryVariables>(ProductsByIngredientDocument, options);
        }
export type ProductsByIngredientQueryHookResult = ReturnType<typeof useProductsByIngredientQuery>;
export type ProductsByIngredientLazyQueryHookResult = ReturnType<typeof useProductsByIngredientLazyQuery>;
export type ProductsByIngredientSuspenseQueryHookResult = ReturnType<typeof useProductsByIngredientSuspenseQuery>;
export type ProductsByIngredientQueryResult = Apollo.QueryResult<ProductsByIngredientQuery, ProductsByIngredientQueryVariables>;
export const SalesDocument = gql`
    query Sales($search: String) {
  sales(search: $search) {
    _id
    tableNumber
    orderNo
    createdAt
    id
    orderType
    status
    orderNo
    costOfGoods
    grossProfit
    saleItems {
      _id
      priceAtSale
      product {
        id
        name
        price
        updatedAt
        createdAt
      }
      productId
      quantity
    }
    totalAmount
  }
}
    `;

/**
 * __useSalesQuery__
 *
 * To run a query within a React component, call `useSalesQuery` and pass it any options that fit your needs.
 * When your component renders, `useSalesQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useSalesQuery({
 *   variables: {
 *      search: // value for 'search'
 *   },
 * });
 */
export function useSalesQuery(baseOptions?: Apollo.QueryHookOptions<SalesQuery, SalesQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<SalesQuery, SalesQueryVariables>(SalesDocument, options);
      }
export function useSalesLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<SalesQuery, SalesQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<SalesQuery, SalesQueryVariables>(SalesDocument, options);
        }
export function useSalesSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<SalesQuery, SalesQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<SalesQuery, SalesQueryVariables>(SalesDocument, options);
        }
export type SalesQueryHookResult = ReturnType<typeof useSalesQuery>;
export type SalesLazyQueryHookResult = ReturnType<typeof useSalesLazyQuery>;
export type SalesSuspenseQueryHookResult = ReturnType<typeof useSalesSuspenseQuery>;
export type SalesQueryResult = Apollo.QueryResult<SalesQuery, SalesQueryVariables>;
export const VoidSaleDocument = gql`
    mutation voidSale($id: ID!, $voidReason: String!) {
  voidSale(id: $id, voidReason: $voidReason) {
    success
    message
  }
}
    `;
export type VoidSaleMutationFn = Apollo.MutationFunction<VoidSaleMutation, VoidSaleMutationVariables>;

/**
 * __useVoidSaleMutation__
 *
 * To run a mutation, you first call `useVoidSaleMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useVoidSaleMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [voidSaleMutation, { data, loading, error }] = useVoidSaleMutation({
 *   variables: {
 *      id: // value for 'id'
 *      voidReason: // value for 'voidReason'
 *   },
 * });
 */
export function useVoidSaleMutation(baseOptions?: Apollo.MutationHookOptions<VoidSaleMutation, VoidSaleMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<VoidSaleMutation, VoidSaleMutationVariables>(VoidSaleDocument, options);
      }
export type VoidSaleMutationHookResult = ReturnType<typeof useVoidSaleMutation>;
export type VoidSaleMutationResult = Apollo.MutationResult<VoidSaleMutation>;
export type VoidSaleMutationOptions = Apollo.BaseMutationOptions<VoidSaleMutation, VoidSaleMutationVariables>;
export const RefundSaleDocument = gql`
    mutation refundSale($id: ID!, $refundReason: String!) {
  refundSale(id: $id, refundReason: $refundReason) {
    success
    message
  }
}
    `;
export type RefundSaleMutationFn = Apollo.MutationFunction<RefundSaleMutation, RefundSaleMutationVariables>;

/**
 * __useRefundSaleMutation__
 *
 * To run a mutation, you first call `useRefundSaleMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useRefundSaleMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [refundSaleMutation, { data, loading, error }] = useRefundSaleMutation({
 *   variables: {
 *      id: // value for 'id'
 *      refundReason: // value for 'refundReason'
 *   },
 * });
 */
export function useRefundSaleMutation(baseOptions?: Apollo.MutationHookOptions<RefundSaleMutation, RefundSaleMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<RefundSaleMutation, RefundSaleMutationVariables>(RefundSaleDocument, options);
      }
export type RefundSaleMutationHookResult = ReturnType<typeof useRefundSaleMutation>;
export type RefundSaleMutationResult = Apollo.MutationResult<RefundSaleMutation>;
export type RefundSaleMutationOptions = Apollo.BaseMutationOptions<RefundSaleMutation, RefundSaleMutationVariables>;
export const ChangeItemDocument = gql`
    mutation changeItem($saleId: ID!, $oldSaleItemId: ID!, $newProductId: ID!, $newQuantity: Float!, $reason: String!) {
  changeItem(
    saleId: $saleId
    oldSaleItemId: $oldSaleItemId
    newProductId: $newProductId
    newQuantity: $newQuantity
    reason: $reason
  ) {
    success
    message
  }
}
    `;
export type ChangeItemMutationFn = Apollo.MutationFunction<ChangeItemMutation, ChangeItemMutationVariables>;

/**
 * __useChangeItemMutation__
 *
 * To run a mutation, you first call `useChangeItemMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useChangeItemMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [changeItemMutation, { data, loading, error }] = useChangeItemMutation({
 *   variables: {
 *      saleId: // value for 'saleId'
 *      oldSaleItemId: // value for 'oldSaleItemId'
 *      newProductId: // value for 'newProductId'
 *      newQuantity: // value for 'newQuantity'
 *      reason: // value for 'reason'
 *   },
 * });
 */
export function useChangeItemMutation(baseOptions?: Apollo.MutationHookOptions<ChangeItemMutation, ChangeItemMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<ChangeItemMutation, ChangeItemMutationVariables>(ChangeItemDocument, options);
      }
export type ChangeItemMutationHookResult = ReturnType<typeof useChangeItemMutation>;
export type ChangeItemMutationResult = Apollo.MutationResult<ChangeItemMutation>;
export type ChangeItemMutationOptions = Apollo.BaseMutationOptions<ChangeItemMutation, ChangeItemMutationVariables>;
export const LoginDocument = gql`
    mutation Login($username: String!, $password: String!) {
  login(username: $username, password: $password) {
    token
    success
    message
  }
}
    `;
export type LoginMutationFn = Apollo.MutationFunction<LoginMutation, LoginMutationVariables>;

/**
 * __useLoginMutation__
 *
 * To run a mutation, you first call `useLoginMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useLoginMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [loginMutation, { data, loading, error }] = useLoginMutation({
 *   variables: {
 *      username: // value for 'username'
 *      password: // value for 'password'
 *   },
 * });
 */
export function useLoginMutation(baseOptions?: Apollo.MutationHookOptions<LoginMutation, LoginMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<LoginMutation, LoginMutationVariables>(LoginDocument, options);
      }
export type LoginMutationHookResult = ReturnType<typeof useLoginMutation>;
export type LoginMutationResult = Apollo.MutationResult<LoginMutation>;
export type LoginMutationOptions = Apollo.BaseMutationOptions<LoginMutation, LoginMutationVariables>;
export const LogoutDocument = gql`
    mutation Logout {
  logout
}
    `;
export type LogoutMutationFn = Apollo.MutationFunction<LogoutMutation, LogoutMutationVariables>;

/**
 * __useLogoutMutation__
 *
 * To run a mutation, you first call `useLogoutMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useLogoutMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [logoutMutation, { data, loading, error }] = useLogoutMutation({
 *   variables: {
 *   },
 * });
 */
export function useLogoutMutation(baseOptions?: Apollo.MutationHookOptions<LogoutMutation, LogoutMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<LogoutMutation, LogoutMutationVariables>(LogoutDocument, options);
      }
export type LogoutMutationHookResult = ReturnType<typeof useLogoutMutation>;
export type LogoutMutationResult = Apollo.MutationResult<LogoutMutation>;
export type LogoutMutationOptions = Apollo.BaseMutationOptions<LogoutMutation, LogoutMutationVariables>;
export const VerifyPasswordDocument = gql`
    mutation VerifyPassword($password: String!) {
  verifyPassword(password: $password) {
    success
    message
  }
}
    `;
export type VerifyPasswordMutationFn = Apollo.MutationFunction<VerifyPasswordMutation, VerifyPasswordMutationVariables>;

/**
 * __useVerifyPasswordMutation__
 *
 * To run a mutation, you first call `useVerifyPasswordMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useVerifyPasswordMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [verifyPasswordMutation, { data, loading, error }] = useVerifyPasswordMutation({
 *   variables: {
 *      password: // value for 'password'
 *   },
 * });
 */
export function useVerifyPasswordMutation(baseOptions?: Apollo.MutationHookOptions<VerifyPasswordMutation, VerifyPasswordMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<VerifyPasswordMutation, VerifyPasswordMutationVariables>(VerifyPasswordDocument, options);
      }
export type VerifyPasswordMutationHookResult = ReturnType<typeof useVerifyPasswordMutation>;
export type VerifyPasswordMutationResult = Apollo.MutationResult<VerifyPasswordMutation>;
export type VerifyPasswordMutationOptions = Apollo.BaseMutationOptions<VerifyPasswordMutation, VerifyPasswordMutationVariables>;
export const DatabaseStatsDocument = gql`
    query DatabaseStats {
  databaseStats {
    databaseName
    totalCollections
    dataSizeMB
    storageSizeMB
    indexSizeMB
    totalSizeMB
    totalDocuments
    collections {
      name
      documentCount
      sizeMB
      avgDocSizeKB
    }
    salesCount
    completedSales
    parkedSales
    productsCount
    itemsCount
    cashDrawersCount
    openDrawers
    usersCount
    activeUsers
    currentUsagePercent
    freeSpaceMB
    estimatedDaysToFull
  }
}
    `;

/**
 * __useDatabaseStatsQuery__
 *
 * To run a query within a React component, call `useDatabaseStatsQuery` and pass it any options that fit your needs.
 * When your component renders, `useDatabaseStatsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useDatabaseStatsQuery({
 *   variables: {
 *   },
 * });
 */
export function useDatabaseStatsQuery(baseOptions?: Apollo.QueryHookOptions<DatabaseStatsQuery, DatabaseStatsQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<DatabaseStatsQuery, DatabaseStatsQueryVariables>(DatabaseStatsDocument, options);
      }
export function useDatabaseStatsLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<DatabaseStatsQuery, DatabaseStatsQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<DatabaseStatsQuery, DatabaseStatsQueryVariables>(DatabaseStatsDocument, options);
        }
export function useDatabaseStatsSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<DatabaseStatsQuery, DatabaseStatsQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<DatabaseStatsQuery, DatabaseStatsQueryVariables>(DatabaseStatsDocument, options);
        }
export type DatabaseStatsQueryHookResult = ReturnType<typeof useDatabaseStatsQuery>;
export type DatabaseStatsLazyQueryHookResult = ReturnType<typeof useDatabaseStatsLazyQuery>;
export type DatabaseStatsSuspenseQueryHookResult = ReturnType<typeof useDatabaseStatsSuspenseQuery>;
export type DatabaseStatsQueryResult = Apollo.QueryResult<DatabaseStatsQuery, DatabaseStatsQueryVariables>;
export const DiscountsDocument = gql`
    query Discounts {
  discounts {
    _id
    id
    title
    value
    isActive
    createdAt
    updatedAt
  }
}
    `;

/**
 * __useDiscountsQuery__
 *
 * To run a query within a React component, call `useDiscountsQuery` and pass it any options that fit your needs.
 * When your component renders, `useDiscountsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useDiscountsQuery({
 *   variables: {
 *   },
 * });
 */
export function useDiscountsQuery(baseOptions?: Apollo.QueryHookOptions<DiscountsQuery, DiscountsQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<DiscountsQuery, DiscountsQueryVariables>(DiscountsDocument, options);
      }
export function useDiscountsLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<DiscountsQuery, DiscountsQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<DiscountsQuery, DiscountsQueryVariables>(DiscountsDocument, options);
        }
export function useDiscountsSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<DiscountsQuery, DiscountsQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<DiscountsQuery, DiscountsQueryVariables>(DiscountsDocument, options);
        }
export type DiscountsQueryHookResult = ReturnType<typeof useDiscountsQuery>;
export type DiscountsLazyQueryHookResult = ReturnType<typeof useDiscountsLazyQuery>;
export type DiscountsSuspenseQueryHookResult = ReturnType<typeof useDiscountsSuspenseQuery>;
export type DiscountsQueryResult = Apollo.QueryResult<DiscountsQuery, DiscountsQueryVariables>;
export const CreateDiscountDocument = gql`
    mutation CreateDiscount($input: DiscountInput!) {
  createDiscount(input: $input) {
    success
    message
  }
}
    `;
export type CreateDiscountMutationFn = Apollo.MutationFunction<CreateDiscountMutation, CreateDiscountMutationVariables>;

/**
 * __useCreateDiscountMutation__
 *
 * To run a mutation, you first call `useCreateDiscountMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useCreateDiscountMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [createDiscountMutation, { data, loading, error }] = useCreateDiscountMutation({
 *   variables: {
 *      input: // value for 'input'
 *   },
 * });
 */
export function useCreateDiscountMutation(baseOptions?: Apollo.MutationHookOptions<CreateDiscountMutation, CreateDiscountMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<CreateDiscountMutation, CreateDiscountMutationVariables>(CreateDiscountDocument, options);
      }
export type CreateDiscountMutationHookResult = ReturnType<typeof useCreateDiscountMutation>;
export type CreateDiscountMutationResult = Apollo.MutationResult<CreateDiscountMutation>;
export type CreateDiscountMutationOptions = Apollo.BaseMutationOptions<CreateDiscountMutation, CreateDiscountMutationVariables>;
export const UpdateDiscountDocument = gql`
    mutation UpdateDiscount($id: ID!, $input: DiscountInput!) {
  updateDiscount(id: $id, input: $input) {
    success
    message
  }
}
    `;
export type UpdateDiscountMutationFn = Apollo.MutationFunction<UpdateDiscountMutation, UpdateDiscountMutationVariables>;

/**
 * __useUpdateDiscountMutation__
 *
 * To run a mutation, you first call `useUpdateDiscountMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUpdateDiscountMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [updateDiscountMutation, { data, loading, error }] = useUpdateDiscountMutation({
 *   variables: {
 *      id: // value for 'id'
 *      input: // value for 'input'
 *   },
 * });
 */
export function useUpdateDiscountMutation(baseOptions?: Apollo.MutationHookOptions<UpdateDiscountMutation, UpdateDiscountMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<UpdateDiscountMutation, UpdateDiscountMutationVariables>(UpdateDiscountDocument, options);
      }
export type UpdateDiscountMutationHookResult = ReturnType<typeof useUpdateDiscountMutation>;
export type UpdateDiscountMutationResult = Apollo.MutationResult<UpdateDiscountMutation>;
export type UpdateDiscountMutationOptions = Apollo.BaseMutationOptions<UpdateDiscountMutation, UpdateDiscountMutationVariables>;
export const DeleteDiscountDocument = gql`
    mutation DeleteDiscount($id: ID!) {
  deleteDiscount(id: $id) {
    success
    message
  }
}
    `;
export type DeleteDiscountMutationFn = Apollo.MutationFunction<DeleteDiscountMutation, DeleteDiscountMutationVariables>;

/**
 * __useDeleteDiscountMutation__
 *
 * To run a mutation, you first call `useDeleteDiscountMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useDeleteDiscountMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [deleteDiscountMutation, { data, loading, error }] = useDeleteDiscountMutation({
 *   variables: {
 *      id: // value for 'id'
 *   },
 * });
 */
export function useDeleteDiscountMutation(baseOptions?: Apollo.MutationHookOptions<DeleteDiscountMutation, DeleteDiscountMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<DeleteDiscountMutation, DeleteDiscountMutationVariables>(DeleteDiscountDocument, options);
      }
export type DeleteDiscountMutationHookResult = ReturnType<typeof useDeleteDiscountMutation>;
export type DeleteDiscountMutationResult = Apollo.MutationResult<DeleteDiscountMutation>;
export type DeleteDiscountMutationOptions = Apollo.BaseMutationOptions<DeleteDiscountMutation, DeleteDiscountMutationVariables>;
export const ServiceChargesDocument = gql`
    query ServiceCharges {
  serviceCharges {
    _id
    id
    title
    value
    isActive
    createdAt
    updatedAt
  }
}
    `;

/**
 * __useServiceChargesQuery__
 *
 * To run a query within a React component, call `useServiceChargesQuery` and pass it any options that fit your needs.
 * When your component renders, `useServiceChargesQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useServiceChargesQuery({
 *   variables: {
 *   },
 * });
 */
export function useServiceChargesQuery(baseOptions?: Apollo.QueryHookOptions<ServiceChargesQuery, ServiceChargesQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<ServiceChargesQuery, ServiceChargesQueryVariables>(ServiceChargesDocument, options);
      }
export function useServiceChargesLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<ServiceChargesQuery, ServiceChargesQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<ServiceChargesQuery, ServiceChargesQueryVariables>(ServiceChargesDocument, options);
        }
export function useServiceChargesSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<ServiceChargesQuery, ServiceChargesQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<ServiceChargesQuery, ServiceChargesQueryVariables>(ServiceChargesDocument, options);
        }
export type ServiceChargesQueryHookResult = ReturnType<typeof useServiceChargesQuery>;
export type ServiceChargesLazyQueryHookResult = ReturnType<typeof useServiceChargesLazyQuery>;
export type ServiceChargesSuspenseQueryHookResult = ReturnType<typeof useServiceChargesSuspenseQuery>;
export type ServiceChargesQueryResult = Apollo.QueryResult<ServiceChargesQuery, ServiceChargesQueryVariables>;
export const CreateServiceChargeDocument = gql`
    mutation CreateServiceCharge($input: ServiceChargeInput!) {
  createServiceCharge(input: $input) {
    success
    message
  }
}
    `;
export type CreateServiceChargeMutationFn = Apollo.MutationFunction<CreateServiceChargeMutation, CreateServiceChargeMutationVariables>;

/**
 * __useCreateServiceChargeMutation__
 *
 * To run a mutation, you first call `useCreateServiceChargeMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useCreateServiceChargeMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [createServiceChargeMutation, { data, loading, error }] = useCreateServiceChargeMutation({
 *   variables: {
 *      input: // value for 'input'
 *   },
 * });
 */
export function useCreateServiceChargeMutation(baseOptions?: Apollo.MutationHookOptions<CreateServiceChargeMutation, CreateServiceChargeMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<CreateServiceChargeMutation, CreateServiceChargeMutationVariables>(CreateServiceChargeDocument, options);
      }
export type CreateServiceChargeMutationHookResult = ReturnType<typeof useCreateServiceChargeMutation>;
export type CreateServiceChargeMutationResult = Apollo.MutationResult<CreateServiceChargeMutation>;
export type CreateServiceChargeMutationOptions = Apollo.BaseMutationOptions<CreateServiceChargeMutation, CreateServiceChargeMutationVariables>;
export const UpdateServiceChargeDocument = gql`
    mutation UpdateServiceCharge($id: ID!, $input: ServiceChargeInput!) {
  updateServiceCharge(id: $id, input: $input) {
    success
    message
  }
}
    `;
export type UpdateServiceChargeMutationFn = Apollo.MutationFunction<UpdateServiceChargeMutation, UpdateServiceChargeMutationVariables>;

/**
 * __useUpdateServiceChargeMutation__
 *
 * To run a mutation, you first call `useUpdateServiceChargeMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUpdateServiceChargeMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [updateServiceChargeMutation, { data, loading, error }] = useUpdateServiceChargeMutation({
 *   variables: {
 *      id: // value for 'id'
 *      input: // value for 'input'
 *   },
 * });
 */
export function useUpdateServiceChargeMutation(baseOptions?: Apollo.MutationHookOptions<UpdateServiceChargeMutation, UpdateServiceChargeMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<UpdateServiceChargeMutation, UpdateServiceChargeMutationVariables>(UpdateServiceChargeDocument, options);
      }
export type UpdateServiceChargeMutationHookResult = ReturnType<typeof useUpdateServiceChargeMutation>;
export type UpdateServiceChargeMutationResult = Apollo.MutationResult<UpdateServiceChargeMutation>;
export type UpdateServiceChargeMutationOptions = Apollo.BaseMutationOptions<UpdateServiceChargeMutation, UpdateServiceChargeMutationVariables>;
export const DeleteServiceChargeDocument = gql`
    mutation DeleteServiceCharge($id: ID!) {
  deleteServiceCharge(id: $id) {
    success
    message
  }
}
    `;
export type DeleteServiceChargeMutationFn = Apollo.MutationFunction<DeleteServiceChargeMutation, DeleteServiceChargeMutationVariables>;

/**
 * __useDeleteServiceChargeMutation__
 *
 * To run a mutation, you first call `useDeleteServiceChargeMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useDeleteServiceChargeMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [deleteServiceChargeMutation, { data, loading, error }] = useDeleteServiceChargeMutation({
 *   variables: {
 *      id: // value for 'id'
 *   },
 * });
 */
export function useDeleteServiceChargeMutation(baseOptions?: Apollo.MutationHookOptions<DeleteServiceChargeMutation, DeleteServiceChargeMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<DeleteServiceChargeMutation, DeleteServiceChargeMutationVariables>(DeleteServiceChargeDocument, options);
      }
export type DeleteServiceChargeMutationHookResult = ReturnType<typeof useDeleteServiceChargeMutation>;
export type DeleteServiceChargeMutationResult = Apollo.MutationResult<DeleteServiceChargeMutation>;
export type DeleteServiceChargeMutationOptions = Apollo.BaseMutationOptions<DeleteServiceChargeMutation, DeleteServiceChargeMutationVariables>;
export const UsersDocument = gql`
    query Users {
  users {
    _id
    username
    role
    firstName
    lastName
    isActive
    permissions
    shiftScheduleId
    createdAt
    updatedAt
  }
}
    `;

/**
 * __useUsersQuery__
 *
 * To run a query within a React component, call `useUsersQuery` and pass it any options that fit your needs.
 * When your component renders, `useUsersQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useUsersQuery({
 *   variables: {
 *   },
 * });
 */
export function useUsersQuery(baseOptions?: Apollo.QueryHookOptions<UsersQuery, UsersQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<UsersQuery, UsersQueryVariables>(UsersDocument, options);
      }
export function useUsersLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<UsersQuery, UsersQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<UsersQuery, UsersQueryVariables>(UsersDocument, options);
        }
export function useUsersSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<UsersQuery, UsersQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<UsersQuery, UsersQueryVariables>(UsersDocument, options);
        }
export type UsersQueryHookResult = ReturnType<typeof useUsersQuery>;
export type UsersLazyQueryHookResult = ReturnType<typeof useUsersLazyQuery>;
export type UsersSuspenseQueryHookResult = ReturnType<typeof useUsersSuspenseQuery>;
export type UsersQueryResult = Apollo.QueryResult<UsersQuery, UsersQueryVariables>;
export const CreateUserDocument = gql`
    mutation CreateUser($username: String!, $password: String!, $role: UserRole!, $firstName: String, $lastName: String, $permissions: JSON, $shiftScheduleId: ID) {
  createUser(
    username: $username
    password: $password
    role: $role
    firstName: $firstName
    lastName: $lastName
    permissions: $permissions
    shiftScheduleId: $shiftScheduleId
  ) {
    success
    message
    data {
      _id
      username
      role
      firstName
      lastName
      isActive
      permissions
      shiftScheduleId
    }
  }
}
    `;
export type CreateUserMutationFn = Apollo.MutationFunction<CreateUserMutation, CreateUserMutationVariables>;

/**
 * __useCreateUserMutation__
 *
 * To run a mutation, you first call `useCreateUserMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useCreateUserMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [createUserMutation, { data, loading, error }] = useCreateUserMutation({
 *   variables: {
 *      username: // value for 'username'
 *      password: // value for 'password'
 *      role: // value for 'role'
 *      firstName: // value for 'firstName'
 *      lastName: // value for 'lastName'
 *      permissions: // value for 'permissions'
 *      shiftScheduleId: // value for 'shiftScheduleId'
 *   },
 * });
 */
export function useCreateUserMutation(baseOptions?: Apollo.MutationHookOptions<CreateUserMutation, CreateUserMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<CreateUserMutation, CreateUserMutationVariables>(CreateUserDocument, options);
      }
export type CreateUserMutationHookResult = ReturnType<typeof useCreateUserMutation>;
export type CreateUserMutationResult = Apollo.MutationResult<CreateUserMutation>;
export type CreateUserMutationOptions = Apollo.BaseMutationOptions<CreateUserMutation, CreateUserMutationVariables>;
export const UpdateUserDocument = gql`
    mutation UpdateUser($id: ID!, $username: String, $password: String, $role: UserRole, $isActive: Boolean, $firstName: String, $lastName: String, $permissions: JSON, $shiftScheduleId: ID) {
  updateUser(
    id: $id
    username: $username
    password: $password
    role: $role
    isActive: $isActive
    firstName: $firstName
    lastName: $lastName
    permissions: $permissions
    shiftScheduleId: $shiftScheduleId
  ) {
    success
    message
    data {
      _id
      username
      role
      firstName
      lastName
      isActive
      permissions
      shiftScheduleId
    }
  }
}
    `;
export type UpdateUserMutationFn = Apollo.MutationFunction<UpdateUserMutation, UpdateUserMutationVariables>;

/**
 * __useUpdateUserMutation__
 *
 * To run a mutation, you first call `useUpdateUserMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUpdateUserMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [updateUserMutation, { data, loading, error }] = useUpdateUserMutation({
 *   variables: {
 *      id: // value for 'id'
 *      username: // value for 'username'
 *      password: // value for 'password'
 *      role: // value for 'role'
 *      isActive: // value for 'isActive'
 *      firstName: // value for 'firstName'
 *      lastName: // value for 'lastName'
 *      permissions: // value for 'permissions'
 *      shiftScheduleId: // value for 'shiftScheduleId'
 *   },
 * });
 */
export function useUpdateUserMutation(baseOptions?: Apollo.MutationHookOptions<UpdateUserMutation, UpdateUserMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<UpdateUserMutation, UpdateUserMutationVariables>(UpdateUserDocument, options);
      }
export type UpdateUserMutationHookResult = ReturnType<typeof useUpdateUserMutation>;
export type UpdateUserMutationResult = Apollo.MutationResult<UpdateUserMutation>;
export type UpdateUserMutationOptions = Apollo.BaseMutationOptions<UpdateUserMutation, UpdateUserMutationVariables>;
export const DeleteUserDocument = gql`
    mutation DeleteUser($id: ID!) {
  deleteUser(id: $id) {
    success
    message
  }
}
    `;
export type DeleteUserMutationFn = Apollo.MutationFunction<DeleteUserMutation, DeleteUserMutationVariables>;

/**
 * __useDeleteUserMutation__
 *
 * To run a mutation, you first call `useDeleteUserMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useDeleteUserMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [deleteUserMutation, { data, loading, error }] = useDeleteUserMutation({
 *   variables: {
 *      id: // value for 'id'
 *   },
 * });
 */
export function useDeleteUserMutation(baseOptions?: Apollo.MutationHookOptions<DeleteUserMutation, DeleteUserMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<DeleteUserMutation, DeleteUserMutationVariables>(DeleteUserDocument, options);
      }
export type DeleteUserMutationHookResult = ReturnType<typeof useDeleteUserMutation>;
export type DeleteUserMutationResult = Apollo.MutationResult<DeleteUserMutation>;
export type DeleteUserMutationOptions = Apollo.BaseMutationOptions<DeleteUserMutation, DeleteUserMutationVariables>;
export const ShiftSchedulesDocument = gql`
    query ShiftSchedules {
  shiftSchedules {
    _id
    name
    shiftStartTime
    breakStartTime
    breakEndTime
    shiftEndTime
    isActive
    isDefault
    createdAt
    updatedAt
  }
}
    `;

/**
 * __useShiftSchedulesQuery__
 *
 * To run a query within a React component, call `useShiftSchedulesQuery` and pass it any options that fit your needs.
 * When your component renders, `useShiftSchedulesQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useShiftSchedulesQuery({
 *   variables: {
 *   },
 * });
 */
export function useShiftSchedulesQuery(baseOptions?: Apollo.QueryHookOptions<ShiftSchedulesQuery, ShiftSchedulesQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<ShiftSchedulesQuery, ShiftSchedulesQueryVariables>(ShiftSchedulesDocument, options);
      }
export function useShiftSchedulesLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<ShiftSchedulesQuery, ShiftSchedulesQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<ShiftSchedulesQuery, ShiftSchedulesQueryVariables>(ShiftSchedulesDocument, options);
        }
export function useShiftSchedulesSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<ShiftSchedulesQuery, ShiftSchedulesQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<ShiftSchedulesQuery, ShiftSchedulesQueryVariables>(ShiftSchedulesDocument, options);
        }
export type ShiftSchedulesQueryHookResult = ReturnType<typeof useShiftSchedulesQuery>;
export type ShiftSchedulesLazyQueryHookResult = ReturnType<typeof useShiftSchedulesLazyQuery>;
export type ShiftSchedulesSuspenseQueryHookResult = ReturnType<typeof useShiftSchedulesSuspenseQuery>;
export type ShiftSchedulesQueryResult = Apollo.QueryResult<ShiftSchedulesQuery, ShiftSchedulesQueryVariables>;
export const ShiftScheduleByIdDocument = gql`
    query ShiftScheduleById($id: ID!) {
  shiftScheduleById(id: $id) {
    _id
    name
    shiftStartTime
    breakStartTime
    breakEndTime
    shiftEndTime
    isActive
    isDefault
    createdAt
    updatedAt
  }
}
    `;

/**
 * __useShiftScheduleByIdQuery__
 *
 * To run a query within a React component, call `useShiftScheduleByIdQuery` and pass it any options that fit your needs.
 * When your component renders, `useShiftScheduleByIdQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useShiftScheduleByIdQuery({
 *   variables: {
 *      id: // value for 'id'
 *   },
 * });
 */
export function useShiftScheduleByIdQuery(baseOptions: Apollo.QueryHookOptions<ShiftScheduleByIdQuery, ShiftScheduleByIdQueryVariables> & ({ variables: ShiftScheduleByIdQueryVariables; skip?: boolean; } | { skip: boolean; }) ) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<ShiftScheduleByIdQuery, ShiftScheduleByIdQueryVariables>(ShiftScheduleByIdDocument, options);
      }
export function useShiftScheduleByIdLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<ShiftScheduleByIdQuery, ShiftScheduleByIdQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<ShiftScheduleByIdQuery, ShiftScheduleByIdQueryVariables>(ShiftScheduleByIdDocument, options);
        }
export function useShiftScheduleByIdSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<ShiftScheduleByIdQuery, ShiftScheduleByIdQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<ShiftScheduleByIdQuery, ShiftScheduleByIdQueryVariables>(ShiftScheduleByIdDocument, options);
        }
export type ShiftScheduleByIdQueryHookResult = ReturnType<typeof useShiftScheduleByIdQuery>;
export type ShiftScheduleByIdLazyQueryHookResult = ReturnType<typeof useShiftScheduleByIdLazyQuery>;
export type ShiftScheduleByIdSuspenseQueryHookResult = ReturnType<typeof useShiftScheduleByIdSuspenseQuery>;
export type ShiftScheduleByIdQueryResult = Apollo.QueryResult<ShiftScheduleByIdQuery, ShiftScheduleByIdQueryVariables>;
export const CreateShiftScheduleDocument = gql`
    mutation CreateShiftSchedule($input: CreateShiftScheduleInput!) {
  createShiftSchedule(input: $input) {
    _id
    name
    shiftStartTime
    breakStartTime
    breakEndTime
    shiftEndTime
    isActive
    isDefault
    createdAt
    updatedAt
  }
}
    `;
export type CreateShiftScheduleMutationFn = Apollo.MutationFunction<CreateShiftScheduleMutation, CreateShiftScheduleMutationVariables>;

/**
 * __useCreateShiftScheduleMutation__
 *
 * To run a mutation, you first call `useCreateShiftScheduleMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useCreateShiftScheduleMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [createShiftScheduleMutation, { data, loading, error }] = useCreateShiftScheduleMutation({
 *   variables: {
 *      input: // value for 'input'
 *   },
 * });
 */
export function useCreateShiftScheduleMutation(baseOptions?: Apollo.MutationHookOptions<CreateShiftScheduleMutation, CreateShiftScheduleMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<CreateShiftScheduleMutation, CreateShiftScheduleMutationVariables>(CreateShiftScheduleDocument, options);
      }
export type CreateShiftScheduleMutationHookResult = ReturnType<typeof useCreateShiftScheduleMutation>;
export type CreateShiftScheduleMutationResult = Apollo.MutationResult<CreateShiftScheduleMutation>;
export type CreateShiftScheduleMutationOptions = Apollo.BaseMutationOptions<CreateShiftScheduleMutation, CreateShiftScheduleMutationVariables>;
export const UpdateShiftScheduleDocument = gql`
    mutation UpdateShiftSchedule($input: UpdateShiftScheduleInput!) {
  updateShiftSchedule(input: $input) {
    _id
    name
    shiftStartTime
    breakStartTime
    breakEndTime
    shiftEndTime
    isActive
    isDefault
    createdAt
    updatedAt
  }
}
    `;
export type UpdateShiftScheduleMutationFn = Apollo.MutationFunction<UpdateShiftScheduleMutation, UpdateShiftScheduleMutationVariables>;

/**
 * __useUpdateShiftScheduleMutation__
 *
 * To run a mutation, you first call `useUpdateShiftScheduleMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUpdateShiftScheduleMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [updateShiftScheduleMutation, { data, loading, error }] = useUpdateShiftScheduleMutation({
 *   variables: {
 *      input: // value for 'input'
 *   },
 * });
 */
export function useUpdateShiftScheduleMutation(baseOptions?: Apollo.MutationHookOptions<UpdateShiftScheduleMutation, UpdateShiftScheduleMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<UpdateShiftScheduleMutation, UpdateShiftScheduleMutationVariables>(UpdateShiftScheduleDocument, options);
      }
export type UpdateShiftScheduleMutationHookResult = ReturnType<typeof useUpdateShiftScheduleMutation>;
export type UpdateShiftScheduleMutationResult = Apollo.MutationResult<UpdateShiftScheduleMutation>;
export type UpdateShiftScheduleMutationOptions = Apollo.BaseMutationOptions<UpdateShiftScheduleMutation, UpdateShiftScheduleMutationVariables>;
export const DeleteShiftScheduleDocument = gql`
    mutation DeleteShiftSchedule($id: ID!) {
  deleteShiftSchedule(id: $id)
}
    `;
export type DeleteShiftScheduleMutationFn = Apollo.MutationFunction<DeleteShiftScheduleMutation, DeleteShiftScheduleMutationVariables>;

/**
 * __useDeleteShiftScheduleMutation__
 *
 * To run a mutation, you first call `useDeleteShiftScheduleMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useDeleteShiftScheduleMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [deleteShiftScheduleMutation, { data, loading, error }] = useDeleteShiftScheduleMutation({
 *   variables: {
 *      id: // value for 'id'
 *   },
 * });
 */
export function useDeleteShiftScheduleMutation(baseOptions?: Apollo.MutationHookOptions<DeleteShiftScheduleMutation, DeleteShiftScheduleMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<DeleteShiftScheduleMutation, DeleteShiftScheduleMutationVariables>(DeleteShiftScheduleDocument, options);
      }
export type DeleteShiftScheduleMutationHookResult = ReturnType<typeof useDeleteShiftScheduleMutation>;
export type DeleteShiftScheduleMutationResult = Apollo.MutationResult<DeleteShiftScheduleMutation>;
export type DeleteShiftScheduleMutationOptions = Apollo.BaseMutationOptions<DeleteShiftScheduleMutation, DeleteShiftScheduleMutationVariables>;
export const RecordShiftEventDocument = gql`
    mutation RecordShiftEvent($input: RecordShiftEventInput!) {
  recordShiftEvent(input: $input) {
    _id
    userId
    employeeName
    date
    attendanceStatus
    scheduledStartTime
    actualStartTime
    events {
      _id
      eventType
      timestamp
      photo
      notes
    }
    totalHoursWorked
    status
    createdAt
    updatedAt
  }
}
    `;
export type RecordShiftEventMutationFn = Apollo.MutationFunction<RecordShiftEventMutation, RecordShiftEventMutationVariables>;

/**
 * __useRecordShiftEventMutation__
 *
 * To run a mutation, you first call `useRecordShiftEventMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useRecordShiftEventMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [recordShiftEventMutation, { data, loading, error }] = useRecordShiftEventMutation({
 *   variables: {
 *      input: // value for 'input'
 *   },
 * });
 */
export function useRecordShiftEventMutation(baseOptions?: Apollo.MutationHookOptions<RecordShiftEventMutation, RecordShiftEventMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<RecordShiftEventMutation, RecordShiftEventMutationVariables>(RecordShiftEventDocument, options);
      }
export type RecordShiftEventMutationHookResult = ReturnType<typeof useRecordShiftEventMutation>;
export type RecordShiftEventMutationResult = Apollo.MutationResult<RecordShiftEventMutation>;
export type RecordShiftEventMutationOptions = Apollo.BaseMutationOptions<RecordShiftEventMutation, RecordShiftEventMutationVariables>;
export const MyCurrentShiftDocument = gql`
    query MyCurrentShift {
  myCurrentShift {
    _id
    userId
    employeeName
    date
    attendanceStatus
    scheduledStartTime
    actualStartTime
    events {
      _id
      eventType
      timestamp
      photo
      notes
    }
    totalHoursWorked
    status
    createdAt
    updatedAt
  }
}
    `;

/**
 * __useMyCurrentShiftQuery__
 *
 * To run a query within a React component, call `useMyCurrentShiftQuery` and pass it any options that fit your needs.
 * When your component renders, `useMyCurrentShiftQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useMyCurrentShiftQuery({
 *   variables: {
 *   },
 * });
 */
export function useMyCurrentShiftQuery(baseOptions?: Apollo.QueryHookOptions<MyCurrentShiftQuery, MyCurrentShiftQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<MyCurrentShiftQuery, MyCurrentShiftQueryVariables>(MyCurrentShiftDocument, options);
      }
export function useMyCurrentShiftLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<MyCurrentShiftQuery, MyCurrentShiftQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<MyCurrentShiftQuery, MyCurrentShiftQueryVariables>(MyCurrentShiftDocument, options);
        }
export function useMyCurrentShiftSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<MyCurrentShiftQuery, MyCurrentShiftQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<MyCurrentShiftQuery, MyCurrentShiftQueryVariables>(MyCurrentShiftDocument, options);
        }
export type MyCurrentShiftQueryHookResult = ReturnType<typeof useMyCurrentShiftQuery>;
export type MyCurrentShiftLazyQueryHookResult = ReturnType<typeof useMyCurrentShiftLazyQuery>;
export type MyCurrentShiftSuspenseQueryHookResult = ReturnType<typeof useMyCurrentShiftSuspenseQuery>;
export type MyCurrentShiftQueryResult = Apollo.QueryResult<MyCurrentShiftQuery, MyCurrentShiftQueryVariables>;
export const MyShiftHistoryDocument = gql`
    query MyShiftHistory($limit: Int, $offset: Int) {
  myShiftHistory(limit: $limit, offset: $offset) {
    _id
    userId
    employeeName
    date
    attendanceStatus
    scheduledStartTime
    actualStartTime
    events {
      _id
      eventType
      timestamp
      photo
      notes
    }
    totalHoursWorked
    status
    createdAt
    updatedAt
  }
}
    `;

/**
 * __useMyShiftHistoryQuery__
 *
 * To run a query within a React component, call `useMyShiftHistoryQuery` and pass it any options that fit your needs.
 * When your component renders, `useMyShiftHistoryQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useMyShiftHistoryQuery({
 *   variables: {
 *      limit: // value for 'limit'
 *      offset: // value for 'offset'
 *   },
 * });
 */
export function useMyShiftHistoryQuery(baseOptions?: Apollo.QueryHookOptions<MyShiftHistoryQuery, MyShiftHistoryQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<MyShiftHistoryQuery, MyShiftHistoryQueryVariables>(MyShiftHistoryDocument, options);
      }
export function useMyShiftHistoryLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<MyShiftHistoryQuery, MyShiftHistoryQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<MyShiftHistoryQuery, MyShiftHistoryQueryVariables>(MyShiftHistoryDocument, options);
        }
export function useMyShiftHistorySuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<MyShiftHistoryQuery, MyShiftHistoryQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<MyShiftHistoryQuery, MyShiftHistoryQueryVariables>(MyShiftHistoryDocument, options);
        }
export type MyShiftHistoryQueryHookResult = ReturnType<typeof useMyShiftHistoryQuery>;
export type MyShiftHistoryLazyQueryHookResult = ReturnType<typeof useMyShiftHistoryLazyQuery>;
export type MyShiftHistorySuspenseQueryHookResult = ReturnType<typeof useMyShiftHistorySuspenseQuery>;
export type MyShiftHistoryQueryResult = Apollo.QueryResult<MyShiftHistoryQuery, MyShiftHistoryQueryVariables>;
export const AllShiftsDocument = gql`
    query AllShifts($date: String, $status: ShiftStatus, $limit: Int, $offset: Int) {
  allShifts(date: $date, status: $status, limit: $limit, offset: $offset) {
    _id
    userId
    employeeName
    date
    attendanceStatus
    scheduledStartTime
    actualStartTime
    events {
      _id
      eventType
      timestamp
      photo
      notes
    }
    totalHoursWorked
    status
    createdAt
    updatedAt
  }
}
    `;

/**
 * __useAllShiftsQuery__
 *
 * To run a query within a React component, call `useAllShiftsQuery` and pass it any options that fit your needs.
 * When your component renders, `useAllShiftsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useAllShiftsQuery({
 *   variables: {
 *      date: // value for 'date'
 *      status: // value for 'status'
 *      limit: // value for 'limit'
 *      offset: // value for 'offset'
 *   },
 * });
 */
export function useAllShiftsQuery(baseOptions?: Apollo.QueryHookOptions<AllShiftsQuery, AllShiftsQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<AllShiftsQuery, AllShiftsQueryVariables>(AllShiftsDocument, options);
      }
export function useAllShiftsLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<AllShiftsQuery, AllShiftsQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<AllShiftsQuery, AllShiftsQueryVariables>(AllShiftsDocument, options);
        }
export function useAllShiftsSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<AllShiftsQuery, AllShiftsQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<AllShiftsQuery, AllShiftsQueryVariables>(AllShiftsDocument, options);
        }
export type AllShiftsQueryHookResult = ReturnType<typeof useAllShiftsQuery>;
export type AllShiftsLazyQueryHookResult = ReturnType<typeof useAllShiftsLazyQuery>;
export type AllShiftsSuspenseQueryHookResult = ReturnType<typeof useAllShiftsSuspenseQuery>;
export type AllShiftsQueryResult = Apollo.QueryResult<AllShiftsQuery, AllShiftsQueryVariables>;
export const ShiftByIdDocument = gql`
    query ShiftById($id: ID!) {
  shiftById(id: $id) {
    _id
    userId
    employeeName
    date
    events {
      _id
      eventType
      timestamp
      photo
      notes
    }
    totalHoursWorked
    status
    createdAt
    updatedAt
  }
}
    `;

/**
 * __useShiftByIdQuery__
 *
 * To run a query within a React component, call `useShiftByIdQuery` and pass it any options that fit your needs.
 * When your component renders, `useShiftByIdQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useShiftByIdQuery({
 *   variables: {
 *      id: // value for 'id'
 *   },
 * });
 */
export function useShiftByIdQuery(baseOptions: Apollo.QueryHookOptions<ShiftByIdQuery, ShiftByIdQueryVariables> & ({ variables: ShiftByIdQueryVariables; skip?: boolean; } | { skip: boolean; }) ) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<ShiftByIdQuery, ShiftByIdQueryVariables>(ShiftByIdDocument, options);
      }
export function useShiftByIdLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<ShiftByIdQuery, ShiftByIdQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<ShiftByIdQuery, ShiftByIdQueryVariables>(ShiftByIdDocument, options);
        }
export function useShiftByIdSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<ShiftByIdQuery, ShiftByIdQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<ShiftByIdQuery, ShiftByIdQueryVariables>(ShiftByIdDocument, options);
        }
export type ShiftByIdQueryHookResult = ReturnType<typeof useShiftByIdQuery>;
export type ShiftByIdLazyQueryHookResult = ReturnType<typeof useShiftByIdLazyQuery>;
export type ShiftByIdSuspenseQueryHookResult = ReturnType<typeof useShiftByIdSuspenseQuery>;
export type ShiftByIdQueryResult = Apollo.QueryResult<ShiftByIdQuery, ShiftByIdQueryVariables>;