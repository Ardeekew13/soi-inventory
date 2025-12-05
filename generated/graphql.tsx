import { gql } from '@apollo/client';
export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
export type MakeEmpty<T extends { [key: string]: unknown }, K extends keyof T> = { [_ in K]?: never };
export type Incremental<T> = T | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: { input: string; output: string; }
  String: { input: string; output: string; }
  Boolean: { input: boolean; output: boolean; }
  Int: { input: number; output: number; }
  Float: { input: number; output: number; }
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
  closingBalance?: Maybe<Scalars['Float']['output']>;
  createdAt: Scalars['String']['output'];
  creditSales: Scalars['Float']['output'];
  currentBalance: Scalars['Float']['output'];
  expectedBalance?: Maybe<Scalars['Float']['output']>;
  gcashSales: Scalars['Float']['output'];
  openedAt: Scalars['String']['output'];
  openedBy: Scalars['String']['output'];
  openingBalance: Scalars['Float']['output'];
  status: DrawerStatus;
  totalCashIn: Scalars['Float']['output'];
  totalCashOut: Scalars['Float']['output'];
  totalSales: Scalars['Float']['output'];
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

export type Item = {
  __typename?: 'Item';
  _id: Scalars['ID']['output'];
  createdAt: Scalars['String']['output'];
  currentStock: Scalars['Float']['output'];
  id: Scalars['ID']['output'];
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
  recordSale: SaleResponse;
  recordShiftEvent: EmployeeShift;
  sendToKitchen: DeletionResult;
  updateDiscount: DeletionResult;
  updateServiceCharge: DeletionResult;
  updateShiftSchedule: ShiftSchedule;
  updateUser: UserResponse;
  verifyPassword: VerifyPasswordResponse;
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
  saleId: Scalars['ID']['input'];
  saleItemId: Scalars['ID']['input'];
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


export type MutationRecordSaleArgs = {
  items: Array<SaleItemInput>;
};


export type MutationRecordShiftEventArgs = {
  input: RecordShiftEventInput;
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

export type Product = {
  __typename?: 'Product';
  _id: Scalars['ID']['output'];
  createdAt: Scalars['String']['output'];
  id: Scalars['ID']['output'];
  ingredientsUsed: Array<ProductIngredient>;
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
  product: Product;
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
  topProductSold: Array<TopProduct>;
  totalAmountSales?: Maybe<Scalars['Float']['output']>;
  totalCostOfGoods?: Maybe<Scalars['Float']['output']>;
  totalCostPercentage?: Maybe<Scalars['Float']['output']>;
  totalItemsSold?: Maybe<Scalars['Float']['output']>;
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
  Sale = 'SALE'
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
