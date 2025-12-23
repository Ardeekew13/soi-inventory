import { gql } from "@apollo/client";

export const saleTypeDefs = gql`
  enum OrderType {
    DINE_IN
    TAKE_OUT
  }

  enum SaleStatus {
    PARKED
    COMPLETED
    VOID
    REFUNDED
    ITEM_CHANGED
  }

  type Sale {
    _id: ID!
    id: ID!
    totalAmount: Float!
    grossProfit: Float!
    costOfGoods: Float!
    saleItems: [SaleItem!]!
    createdAt: String!
    updatedAt: String!
    status: String!
    voidReason: String!
    orderNo: String
    customerName: String
    orderType: OrderType
    tableNumber: String
    cashierId: ID
    cashierName: String
    isDeleted: Boolean!
  }

  type SaleItem {
    _id: ID!
    productId: ID!
    product: Product
    quantity: Float!
    priceAtSale: Float!
    quantityPrinted: Float
  }

  type SaleResponse {
    _id: ID!
    totalAmount: Float!
    grossProfit: Float!
    message: String!
    orderNo: String
    status: String!
  }

  input SaleItemInput {
    productId: ID!
    quantity: Float!
  }

  type TopProduct {
    name: String!
    quantity: Int!
  }

  type PaymentMethodStat {
    paymentMethod: String!
    totalAmount: Float!
    count: Int!
  }

  type CategoryStat {
    category: String!
    totalAmount: Float!
    count: Int!
  }

  type ItemStat {
    itemName: String!
    totalAmount: Float!
    quantity: Int!
  }

  type CashierStat {
    cashierName: String!
    totalAmount: Float!
    count: Int!
  }

  type HourlyStat {
    hour: String!
    totalAmount: Float!
    count: Int!
  }

  type SaleReportGroup {
    grossProfit: Float
    totalCostOfGoods: Float
    totalAmountSales: Float
    totalItemsSold: Float
    totalSalesPercentage: Float
    totalCostPercentage: Float
    grossProfitPercentage: Float
    availableYears: [Int!]!
    topProductSold: [TopProduct!]!
    groupSales: [MonthlySaleReport!]!
    salesByPaymentMethod: [PaymentMethodStat!]!
    totalRefunds: Float
    numberOfRefunds: Int
    salesByItem: [ItemStat!]!
    salesByCashier: [CashierStat!]!
    salesByHour: [HourlyStat!]!
    numberOfTransactions: Int
    totalDiscounts: Float
    totalNetSales: Float
  }

  type MonthlySaleReport {
    month: String
    grossProfit: Float
    totalCostOfGoods: Float
    totalAmountSales: Float
    totalItemsSold: Float
  }

  extend type Query {
    sales(search: String): [Sale!]!
    parkedSales: [Sale!]!
    saleReport(startDate: String, endDate: String, year: String): SaleReportGroup
  }

  extend type Mutation {
    parkSale(id: ID, items: [SaleItemInput!]!, orderType: OrderType!, tableNumber: String): SaleResponse!
    checkoutSale(id: ID, items: [SaleItemInput!]!, orderType: OrderType!, tableNumber: String, paymentMethod: String): SaleResponse!
    sendToKitchen(saleId: ID!, itemIds: [ID!]!): DeletionResult!
    recordSale(items: [SaleItemInput!]!): SaleResponse!
    voidSale(id: ID!, voidReason: String!): DeletionResult!
    voidParkedSale(id: ID!, voidReason: String!): DeletionResult!
    refundSale(id: ID!, refundReason: String!): DeletionResult!
    deleteParkedSale(id: ID!): DeletionResult!
    changeItem(saleId: ID!, oldSaleItemId: ID!, newProductId: ID!, newQuantity: Float!, reason: String!): DeletionResult!
  }
`;