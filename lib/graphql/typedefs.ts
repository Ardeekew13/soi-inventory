import { gql } from "@apollo/client";

export const typeDefs = gql`
  scalar ObjectId
  scalar DateTime

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
    id: ObjectId!
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
    productId: ObjectId!
    product: Product!
    quantity: Float!
    priceAtSale: Float!
  }

  type Item {
    id: ObjectId!
    name: String!
    unit: String!
    pricePerUnit: Float!
    currentStock: Float!
    createdAt: String!
    updatedAt: String!
  }

  input ProductIngredientInput {
    itemId: ObjectId!
    quantityUsed: Float!
  }

  input SaleItemInput {
    productId: ObjectId!
    quantity: Float!
  }

  type SaleResponse {
    id: ObjectId!
    totalAmount: Float!
    grossProfit: Float!
    message: String!
    orderNo: String!
  }

  type ProductIngredient {
    id: ObjectId!
    productId: ObjectId!
    itemId: ObjectId!
    quantityUsed: Float!
    item: Item!
  }

  type Product {
    id: ObjectId!
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
    id: ObjectId
    username: String
    role: String
  }

  type User {
    id: ObjectId!
    username: String!
    role: String!
    createdAt: String!
  }

  type Mutation {
    login(username: String!, password: String!): LoginResponse!
    logout: Boolean!
    addItem(
      id: ObjectId
      name: String!
      unit: String!
      pricePerUnit: Float!
      currentStock: Float!
    ): Item!

    deleteItem(id: ObjectId!): DeletionResult!
    addProduct(
      name: String!
      price: Float!
      id: ObjectId
      items: [ProductIngredientInput!]
    ): Product!
    deleteProduct(id: ObjectId!): DeletionResult!

    recordSale(items: [SaleItemInput!]!): SaleResponse!
    voidSale(id: ObjectId!, voidReason: String!): DeletionResult!
  }
`;
