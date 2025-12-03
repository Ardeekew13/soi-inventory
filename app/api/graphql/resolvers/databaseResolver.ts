import { GraphQLContext } from "../context";
import { verifyToken } from "@/lib/auth";
import User, { UserRole } from "../models/User";
import mongoose from "mongoose";
import Sale from "../models/Sale";
import Product from "../models/Products";
import Item from "../models/Item";
import CashDrawer from "../models/CashDrawer";

export const databaseResolvers = {
  Query: {
    databaseStats: async (_: unknown, __: unknown, { request }: GraphQLContext) => {
      try {
        // Verify user is authenticated
        const authToken = request.cookies.get("auth_token")?.value ?? "";
        const decodedUser = await verifyToken(authToken);
        
        if (!decodedUser) {
          throw new Error("Not authenticated");
        }

        const currentUser = await User.findById(decodedUser.id);
        
        // Only SUPER_ADMIN can access database stats
        if (currentUser?.role !== UserRole.SUPER_ADMIN) {
          throw new Error("Unauthorized - Only super admin can view database statistics");
        }

        const db = mongoose.connection.db;
        
        if (!db) {
          throw new Error("Database connection not available");
        }
        
        // Get database stats
        const dbStats = await db.stats();
        
        // Get collections
        const collections = await db.listCollections().toArray();
        const collectionStats = [];

        for (const collection of collections) {
          const collName = collection.name;
          const coll = db.collection(collName);
          const docCount = await coll.countDocuments();
          
          let avgDocSize = 0;
          let size = 0;
          
          if (docCount > 0) {
            const sample = await coll.findOne();
            if (sample) {
              const sampleSize = JSON.stringify(sample).length;
              avgDocSize = sampleSize / 1024; // KB
              size = (sampleSize * docCount) / 1024 / 1024; // MB
            }
          }

          collectionStats.push({
            name: collName,
            documentCount: docCount,
            sizeMB: size,
            avgDocSizeKB: avgDocSize,
          });
        }

        // Get key metrics
        const salesCount = await Sale.countDocuments();
        const completedSales = await Sale.countDocuments({ status: 'COMPLETED' });
        const parkedSales = await Sale.countDocuments({ status: 'PARKED' });
        const productsCount = await Product.countDocuments();
        const itemsCount = await Item.countDocuments();
        const cashDrawersCount = await CashDrawer.countDocuments();
        const openDrawers = await CashDrawer.countDocuments({ status: 'OPEN' });
        const usersCount = await User.countDocuments();
        const activeUsers = await User.countDocuments({ isActive: true });

        // Calculate storage metrics
        const totalSizeMB = (dbStats.dataSize + dbStats.indexSize) / 1024 / 1024;
        const freeSpaceMB = 512 - totalSizeMB;
        const currentUsagePercent = (totalSizeMB / 512) * 100;
        const estimatedDaysToFull = Math.floor(freeSpaceMB / 0.2); // 200KB/day

        return {
          databaseName: dbStats.db,
          totalCollections: dbStats.collections,
          dataSizeMB: dbStats.dataSize / 1024 / 1024,
          storageSizeMB: dbStats.storageSize / 1024 / 1024,
          indexSizeMB: dbStats.indexSize / 1024 / 1024,
          totalSizeMB,
          totalDocuments: dbStats.objects,
          collections: collectionStats,
          salesCount,
          completedSales,
          parkedSales,
          productsCount,
          itemsCount,
          cashDrawersCount,
          openDrawers,
          usersCount,
          activeUsers,
          currentUsagePercent,
          freeSpaceMB,
          estimatedDaysToFull,
        };
      } catch (error: any) {
        console.error("Database stats error:", error);
        throw new Error(error.message || "Failed to get database statistics");
      }
    },
  },
};
