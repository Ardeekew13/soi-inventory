import mongoose from "mongoose";

const saleSchema = new mongoose.Schema(
  {
    totalAmount: {
      type: Number,
      required: true,
      default: 0,
    },
    costOfGoods: {
      type: Number,
      required: true,
      default: 0,
    },
    grossProfit: {
      type: Number,
      required: true,
      default: 0,
    },
    status: {
      type: String,
      required: true,
      enum: ["PARKED", "COMPLETED", "VOID"],
      default: "PARKED",
    },
    voidReason: {
      type: String,
      default: "",
    },
    orderNo: {
      type: String,
      unique: true,
      sparse: true,
      trim: true,
    },
    customerName: {
      type: String,
      default: "",
    },
    orderType: {
      type: String,
      enum: ["DINE_IN", "TAKE_OUT"],
      required: true,
      default: "TAKE_OUT",
    },
    tableNumber: {
      type: String,
      default: null,
    },
    isDeleted: {
      type: Boolean,
      required: true,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Virtual field for sale items
saleSchema.virtual("saleItems", {
  ref: "SaleItem",
  localField: "_id",
  foreignField: "saleId",
});

// Indexes for performance
saleSchema.index({ status: 1 }); // For filtering by status
// Note: orderNo already has unique sparse index from schema definition
saleSchema.index({ createdAt: -1 }); // For date range queries and sorting
saleSchema.index({ isDeleted: 1 }); // For filtering deleted sales
saleSchema.index({ orderType: 1 }); // For filtering by order type
saleSchema.index({ createdAt: -1, status: 1 }); // Compound index for date + status queries

// Enable virtuals in JSON
saleSchema.set("toJSON", { virtuals: true });
saleSchema.set("toObject", { virtuals: true });

const Sale = mongoose.models.Sale || mongoose.model("Sale", saleSchema);
export default Sale;
