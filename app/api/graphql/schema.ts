// or from "graphql-tag" if you’re using graphql-yoga

import { gql } from "@apollo/client";

export const typeDefs = gql`
  type Query {
    items(search: String): [Item!]!
    products(search: String): [Product!]!
    sales(search: String): [Sale!]!
    saleReport(
      startDate: String
      endDate: String
      year: String
    ): SaleReportGroup
    me: User!
  }

  type TopProduct {
    name: String!
    quantity: Int!
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
  }

  type MonthlySaleReport {
    month: String
    grossProfit: Float
    totalCostOfGoods: Float
    totalAmountSales: Float
    totalItemsSold: Float
  }

  type Sale {
    _id: ID!
    totalAmount: Float!
    grossProfit: Float!
    costOfGoods: Float!
    saleItems: [SaleItem!]!
    createdAt: String!
    status: String!
    voidReason: String!
    orderNo: String!
  }

  type SaleItem {
    productId: ID!
    product: Product!
    quantity: Float!
    priceAtSale: Float!
  }

  type Item {
    _id: ID!
    name: String!
    unit: String!
    pricePerUnit: Float!
    currentStock: Float!
    createdAt: String!
    updatedAt: String!
  }

  input ProductIngredientInput {
    itemId: ID!
    quantityUsed: Float!
  }

  input SaleItemInput {
    productId: ID!
    quantity: Float!
  }

  type SaleResponse {
    _id: ID!
    totalAmount: Float!
    grossProfit: Float!
    message: String!
    orderNo: String!
  }

  type ProductIngredient {
    _id: ID!
    productId: ID!
    itemId: ID!
    quantityUsed: Float!
    item: Item!
  }

  type Product {
    _id: ID!
    name: String!
    price: Float!
    ingredientsUsed: [ProductIngredient!]!
    createdAt: String!
    updatedAt: String!
    availableUnits: Int!
  }

  type DeletionResult {
    success: Boolean!
    message: String
  }

  type LoginResponse {
    success: Boolean!
    message: String!
    token: String
  }

  type User {
    _id: ID!
    username: String!
    role: String!
  }

  type Mutation {
    login(username: String!, password: String!): LoginResponse!
    logout: Boolean!

    addItem(
      id: ID
      name: String!
      unit: String!
      pricePerUnit: Float!
      currentStock: Float!
    ): Item!

    deleteItem(id: ID!): DeletionResult!

    addProduct(
      name: String!
      price: Float!
      id: ID
      items: [ProductIngredientInput!]
    ): Product!

    deleteProduct(id: ID!): DeletionResult!

    recordSale(items: [SaleItemInput!]!): SaleResponse!

    voidSale(id: ID!, voidReason: String!): DeletionResult!
  }
`;
