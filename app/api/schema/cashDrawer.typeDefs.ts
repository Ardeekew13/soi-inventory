import { gql } from "@apollo/client";

export const cashDrawerTypeDefs = gql`
  enum TransactionType {
    CASH_IN
    CASH_OUT
    SALE
    OPENING
    CLOSING
  }

  enum DrawerStatus {
    OPEN
    CLOSED
  }

  enum PaymentMethod {
    CASH
    BANK_TRANSFER
    CARD
    CREDIT
    GCASH
  }

  type CashTransaction {
    _id: ID!
    type: TransactionType!
    amount: Float!
    description: String
    saleId: ID
    paymentMethod: PaymentMethod
    createdAt: String!
  }

  type CashDrawer {
    _id: ID!
    openedBy: String!
    openedAt: String!
    closedAt: String
    openingBalance: Float!
    closingBalance: Float
    expectedBalance: Float
    status: DrawerStatus!
    transactions: [CashTransaction!]!
    currentBalance: Float!
    totalCashIn: Float!
    totalCashOut: Float!
    totalSales: Float!
    cashSales: Float!
    bankTransferSales: Float!
    cardSales: Float!
    creditSales: Float!
    gcashSales: Float!
    createdAt: String!
    updatedAt: String!
  }

  type CashDrawerResponse {
    success: Boolean!
    message: String!
    data: CashDrawer
  }

  extend type Query {
    currentCashDrawer: CashDrawer
    cashDrawerHistory(limit: Int): [CashDrawer!]!
  }

  extend type Mutation {
    openCashDrawer(openingBalance: Float!): CashDrawerResponse!
    closeCashDrawer(closingBalance: Float!): CashDrawerResponse!
    addCashIn(amount: Float!, description: String!): CashDrawerResponse!
    addCashOut(amount: Float!, description: String!): CashDrawerResponse!
  }
`;
