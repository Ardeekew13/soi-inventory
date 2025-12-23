import mongoose from "mongoose";
import connectDB from "./mongodb";

const cashTransactionSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ["CASH_IN", "CASH_OUT", "SALE", "OPENING", "CLOSING", "REFUND", "VOID"],
      required: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    description: {
      type: String,
      required: false,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: false,
    },
    saleId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Sale",
      required: false,
    },
    paymentMethod: {
      type: String,
      enum: ["CASH", "BANK_TRANSFER", "CARD", "CREDIT", "GCASH"],
      required: false,
      default: "CASH",
    },
  },
  {
    timestamps: true,
  }
);

const cashDrawerSchema = new mongoose.Schema(
  {
    openedBy: {
      type: String,
      required: true,
    },
    openedByUserId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: false,
    },
    openedAt: {
      type: Date,
      required: true,
      default: Date.now,
    },
    closedBy: {
      type: String,
      required: false,
    },
    closedByUserId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: false,
    },
    closedAt: {
      type: Date,
      required: false,
    },
    openingBalance: {
      type: Number,
      required: true,
      default: 0,
    },
    closingBalance: {
      type: Number,
      required: false,
    },
    status: {
      type: String,
      enum: ["OPEN", "CLOSED"],
      required: true,
      default: "OPEN",
    },
    transactions: [cashTransactionSchema],
  },
  {
    timestamps: true,
  }
);

const CashDrawer = mongoose.models.CashDrawer || mongoose.model("CashDrawer", cashDrawerSchema);

async function removeDuplicateRefunds() {
  try {
    await connectDB();
    console.log("Connected to MongoDB");

    // Find all cash drawers
    const cashDrawers = await CashDrawer.find({});
    console.log(`Found ${cashDrawers.length} cash drawers`);

    let totalDuplicatesRemoved = 0;

    for (const drawer of cashDrawers) {
      if (!drawer.transactions || drawer.transactions.length === 0) continue;

      const seenTransactions = new Map<string, number>();
      const duplicateIndices: number[] = [];

      // Track REFUND and VOID transactions by saleId
      drawer.transactions.forEach((transaction: any, index: number) => {
        if (transaction.type === "REFUND" || transaction.type === "VOID") {
          const key = `${transaction.type}_${transaction.saleId}_${transaction.amount}_${transaction.description}`;
          
          if (seenTransactions.has(key)) {
            // This is a duplicate
            duplicateIndices.push(index);
            console.log(`Found duplicate ${transaction.type} for sale ${transaction.saleId}`);
          } else {
            seenTransactions.set(key, index);
          }
        }
      });

      if (duplicateIndices.length > 0) {
        console.log(`\nDrawer ${drawer._id}: Found ${duplicateIndices.length} duplicate(s)`);
        
        // Remove duplicates in reverse order to maintain correct indices
        duplicateIndices.reverse().forEach((index) => {
          const removed = drawer.transactions.splice(index, 1)[0];
          console.log(`  Removed: ${removed.type} - ${removed.description} - Amount: ${removed.amount}`);
        });

        // Save the updated drawer
        await drawer.save();
        totalDuplicatesRemoved += duplicateIndices.length;
        console.log(`  Saved drawer ${drawer._id} with duplicates removed`);
      }
    }

    console.log(`\n✅ Cleanup complete! Removed ${totalDuplicatesRemoved} duplicate transaction(s)`);
  } catch (error) {
    console.error("Error removing duplicates:", error);
  } finally {
    await mongoose.connection.close();
    console.log("Database connection closed");
  }
}

removeDuplicateRefunds();
