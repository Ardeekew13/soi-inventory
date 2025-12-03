import { gql } from "@apollo/client";

export const databaseTypeDefs = gql`
  type CollectionStats {
    name: String!
    documentCount: Int!
    sizeMB: Float!
    avgDocSizeKB: Float!
  }

  type DatabaseStats {
    databaseName: String!
    totalCollections: Int!
    dataSizeMB: Float!
    storageSizeMB: Float!
    indexSizeMB: Float!
    totalSizeMB: Float!
    totalDocuments: Int!
    collections: [CollectionStats!]!
    salesCount: Int!
    completedSales: Int!
    parkedSales: Int!
    productsCount: Int!
    itemsCount: Int!
    cashDrawersCount: Int!
    openDrawers: Int!
    usersCount: Int!
    activeUsers: Int!
    currentUsagePercent: Float!
    freeSpaceMB: Float!
    estimatedDaysToFull: Int!
  }

  extend type Query {
    databaseStats: DatabaseStats!
  }
`;
