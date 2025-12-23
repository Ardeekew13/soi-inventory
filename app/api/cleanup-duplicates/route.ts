import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import mongoose from "mongoose";

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

export async function POST(request: NextRequest) {
  try {
    await connectDB();
    
    // Find all cash drawers
    const cashDrawers = await CashDrawer.find({});
    console.log(`Found ${cashDrawers.length} cash drawers`);

    let totalDuplicatesRemoved = 0;
    const results: any[] = [];

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
        const removedTransactions: any[] = [];
        
        // Remove duplicates in reverse order to maintain correct indices
        duplicateIndices.reverse().forEach((index) => {
          const removed = drawer.transactions.splice(index, 1)[0];
          removedTransactions.push({
            type: removed.type,
            description: removed.description,
            amount: removed.amount
          });
        });

        // Save the updated drawer
        await drawer.save();
        totalDuplicatesRemoved += duplicateIndices.length;
        
        results.push({
          drawerId: drawer._id.toString(),
          duplicatesRemoved: duplicateIndices.length,
          transactions: removedTransactions
        });
      }
    }

    return NextResponse.json({
      success: true,
      message: `Removed ${totalDuplicatesRemoved} duplicate transaction(s)`,
      totalDuplicatesRemoved,
      results
    });
  } catch (error: any) {
    console.error("Error removing duplicates:", error);
    return NextResponse.json({
      success: false,
      message: error.message || "Failed to remove duplicates"
    }, { status: 500 });
  }
}
