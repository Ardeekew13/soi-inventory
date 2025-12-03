import CashDrawer from "../models/CashDrawer";
import { successResponse, errorResponse } from "../utils/response";

export const cashDrawerResolvers = {
  Query: {
    currentCashDrawer: async () => {
      try {
        const drawer = await CashDrawer.findOne({ status: "OPEN" }).sort({ openedAt: -1 });
        return drawer;
      } catch (err: any) {
        console.error("Error fetching current cash drawer:", err);
        throw new Error("Failed to fetch current cash drawer");
      }
    },

    cashDrawerHistory: async (_: unknown, { limit = 10 }: { limit?: number }) => {
      try {
        const drawers = await CashDrawer.find({ status: "CLOSED" })
          .sort({ closedAt: -1 })
          .limit(limit);
        return drawers;
      } catch (err: any) {
        console.error("Error fetching cash drawer history:", err);
        throw new Error("Failed to fetch cash drawer history");
      }
    },
  },

  Mutation: {
    openCashDrawer: async (_: unknown, { openingBalance }: { openingBalance: number }, context: any) => {
      // Check authentication
      if (!context.user) {
        return errorResponse("Authentication required");
      }

      // Check permissions
      const userPermissions = context.user.permissions || {};
      const userRole = context.user.role;

      if (userRole !== 'SUPER_ADMIN' && !userPermissions.cashDrawer?.includes('openClose')) {
        return errorResponse("Insufficient permissions to open cash drawer");
      }

      try {
        // Check if there's already an open drawer
        const existingDrawer = await CashDrawer.findOne({ status: "OPEN" });
        if (existingDrawer) {
          return errorResponse("A cash drawer is already open. Please close it first.");
        }


        let openedBy = "Unknown";
        const user = context.user;
        if (user) {
          // Try to get full name from DB
          const UserModel = require("../models/User").default;
          const dbUser = await UserModel.findOne({ username: user.username });
          if (dbUser) {
            if (dbUser.firstName || dbUser.lastName) {
              openedBy = `${dbUser.firstName || ""} ${dbUser.lastName || ""}`.trim();
            } else {
              openedBy = dbUser.username;
            }
          } else {
            openedBy = user.username;
          }
        }

        // Create new cash drawer
        const drawer = await CashDrawer.create({
          openedBy,
          openingBalance,
          status: "OPEN",
          transactions: [
            {
              type: "OPENING",
              amount: openingBalance,
              description: "Opening balance",
            },
          ],
        });

        return successResponse("Cash drawer opened successfully", drawer);
      } catch (err: any) {
        console.error("Error opening cash drawer:", err);
        return errorResponse(err.message || "Failed to open cash drawer");
      }
    },

    closeCashDrawer: async (_: unknown, { closingBalance }: { closingBalance: number }, context: any) => {
      // Check authentication
      if (!context.user) {
        return errorResponse("Authentication required");
      }

      // Check permissions
      const userPermissions = context.user.permissions || {};
      const userRole = context.user.role;

      if (userRole !== 'SUPER_ADMIN' && !userPermissions.cashDrawer?.includes('openClose')) {
        return errorResponse("Insufficient permissions to close cash drawer");
      }

      try {
        const drawer = await CashDrawer.findOne({ status: "OPEN" }).sort({ openedAt: -1 });
        
        if (!drawer) {
          return errorResponse("No open cash drawer found");
        }

        // Calculate expected balance
        const totalCashIn = drawer.transactions
          .filter((t: any) => t.type === "CASH_IN" || t.type === "OPENING")
          .reduce((sum: number, t: any) => sum + t.amount, 0);
        
        const totalCashOut = drawer.transactions
          .filter((t: any) => t.type === "CASH_OUT")
          .reduce((sum: number, t: any) => sum + t.amount, 0);
        
        const totalSales = drawer.transactions
          .filter((t: any) => t.type === "SALE")
          .reduce((sum: number, t: any) => sum + t.amount, 0);

        const expectedBalance = totalCashIn + totalSales - totalCashOut;

        // Add closing transaction
        drawer.transactions.push({
          type: "CLOSING",
          amount: closingBalance,
          description: "Closing balance",
        } as any);

        drawer.closedAt = new Date();
        drawer.closingBalance = closingBalance;
        drawer.expectedBalance = expectedBalance;
        drawer.status = "CLOSED";

        await drawer.save();

        return successResponse("Cash drawer closed successfully", drawer);
      } catch (err: any) {
        console.error("Error closing cash drawer:", err);
        return errorResponse(err.message || "Failed to close cash drawer");
      }
    },

    addCashIn: async (_: unknown, { amount, description }: { amount: number; description: string }) => {
      try {
        const drawer = await CashDrawer.findOne({ status: "OPEN" }).sort({ openedAt: -1 });
        
        if (!drawer) {
          return errorResponse("No open cash drawer found. Please open a drawer first.");
        }

        drawer.transactions.push({
          type: "CASH_IN",
          amount,
          description,
        } as any);

        await drawer.save();

        return successResponse("Cash in added successfully", drawer);
      } catch (err: any) {
        console.error("Error adding cash in:", err);
        return errorResponse(err.message || "Failed to add cash in");
      }
    },

    addCashOut: async (_: unknown, { amount, description }: { amount: number; description: string }) => {
      try {
        const drawer = await CashDrawer.findOne({ status: "OPEN" }).sort({ openedAt: -1 });
        
        if (!drawer) {
          return errorResponse("No open cash drawer found. Please open a drawer first.");
        }

        drawer.transactions.push({
          type: "CASH_OUT",
          amount,
          description,
        } as any);

        await drawer.save();

        return successResponse("Cash out added successfully", drawer);
      } catch (err: any) {
        console.error("Error adding cash out:", err);
        return errorResponse(err.message || "Failed to add cash out");
      }
    },
  },

  CashDrawer: {
    currentBalance: (parent: any) => {
      const totalCashIn = parent.transactions
        .filter((t: any) => t.type === "CASH_IN" || t.type === "OPENING")
        .reduce((sum: number, t: any) => sum + t.amount, 0);
      
      const totalCashOut = parent.transactions
        .filter((t: any) => t.type === "CASH_OUT")
        .reduce((sum: number, t: any) => sum + t.amount, 0);
      
      const totalSales = parent.transactions
        .filter((t: any) => t.type === "SALE")
        .reduce((sum: number, t: any) => sum + t.amount, 0);

      return totalCashIn + totalSales - totalCashOut;
    },

    totalCashIn: (parent: any) => {
      return parent.transactions
        .filter((t: any) => t.type === "CASH_IN")
        .reduce((sum: number, t: any) => sum + t.amount, 0);
    },

    totalCashOut: (parent: any) => {
      return parent.transactions
        .filter((t: any) => t.type === "CASH_OUT")
        .reduce((sum: number, t: any) => sum + t.amount, 0);
    },

    totalSales: (parent: any) => {
      return parent.transactions
        .filter((t: any) => t.type === "SALE")
        .reduce((sum: number, t: any) => sum + t.amount, 0);
    },

    cashSales: (parent: any) => {
      return parent.transactions
        .filter((t: any) => t.type === "SALE" && (!t.paymentMethod || t.paymentMethod === "CASH"))
        .reduce((sum: number, t: any) => sum + t.amount, 0);
    },

    bankTransferSales: (parent: any) => {
      return parent.transactions
        .filter((t: any) => t.type === "SALE" && t.paymentMethod === "BANK_TRANSFER")
        .reduce((sum: number, t: any) => sum + t.amount, 0);
    },

    cardSales: (parent: any) => {
      return parent.transactions
        .filter((t: any) => t.type === "SALE" && t.paymentMethod === "CARD")
        .reduce((sum: number, t: any) => sum + t.amount, 0);
    },

    creditSales: (parent: any) => {
      return parent.transactions
        .filter((t: any) => t.type === "SALE" && t.paymentMethod === "CREDIT")
        .reduce((sum: number, t: any) => sum + t.amount, 0);
    },

    gcashSales: (parent: any) => {
      return parent.transactions
        .filter((t: any) => t.type === "SALE" && t.paymentMethod === "GCASH")
        .reduce((sum: number, t: any) => sum + t.amount, 0);
    },
  },
};
