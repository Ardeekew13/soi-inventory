import mongoose from "mongoose";

const cashTransactionSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ["CASH_IN", "CASH_OUT", "SALE", "OPENING", "CLOSING"],
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
    expectedBalance: {
      type: Number,
      required: false,
    },
    status: {
      type: String,
      enum: ["OPEN", "CLOSED"],
      default: "OPEN",
    },
    transactions: [cashTransactionSchema],
  },
  {
    timestamps: true,
  }
);

// Indexes for performance
cashDrawerSchema.index({ status: 1 }); // For filtering by status
cashDrawerSchema.index({ openedAt: -1 }); // For date range queries
cashDrawerSchema.index({ closedAt: -1 }); // For closed drawer queries
cashDrawerSchema.index({ openedBy: 1 }); // For user-specific queries
cashDrawerSchema.index({ openedAt: -1, status: 1 }); // Compound index for date + status

const CashDrawer =
  mongoose.models.CashDrawer || mongoose.model("CashDrawer", cashDrawerSchema);

export default CashDrawer;
