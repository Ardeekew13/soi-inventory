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
    id: UUID!
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
    productId: UUID!
    product: Product!
    quantity: Float!
    priceAtSale: Float!
  }

  type Item {
    id: UUID!
    name: String!
    unit: String!
    pricePerUnit: Float!
    currentStock: Float!
    createdAt: String!
    updatedAt: String!
  }

  input ProductIngredientInput {
    itemId: UUID!
    quantityUsed: Float!
  }

  input SaleItemInput {
    productId: UUID!
    quantity: Float!
  }

  type SaleResponse {
    id: UUID!
    totalAmount: Float!
    grossProfit: Float!
    message: String!
    orderNo: String!
  }

  type ProductIngredient {
    id: UUID!
    productId: UUID!
    itemId: UUID!
    quantityUsed: Float!
    item: Item!
  }

  type Product {
    id: UUID!
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
    id: UUID
    username: String
    role: String
  }

  type User {
    id: UUID!
    username: String!
    role: String!
    createdAt: String!
  }

  type Mutation {
    login(username: String!, password: String!): LoginResponse!
    logout: Boolean!
    addItem(
      id: UUID
      name: String!
      unit: String!
      pricePerUnit: Float!
      currentStock: Float!
    ): Item!

    deleteItem(id: UUID!): DeletionResult!
    addProduct(
      name: String!
      price: Float!
      id: UUID
      items: [ProductIngredientInput!]
    ): Product!
    deleteProduct(id: UUID!): DeletionResult!

    recordSale(items: [SaleItemInput!]!): SaleResponse!
    voidSale(id: UUID!, voidReason: String!): DeletionResult!
  }
`;
