import { gql } from "@apollo/client";

export const DATABASE_STATS_QUERY = gql`
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
