import mongoose from "mongoose";

const saleItemSchema = new mongoose.Schema(
  {
    saleId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Sale",
      required: true,
    },
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    quantity: {
      type: Number,
      required: true,
    },
    priceAtSale: {
      type: Number,
      required: true,
    },
    quantityPrinted: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for performance - CRITICAL for queries that filter by saleId
saleItemSchema.index({ saleId: 1 }); // For finding items by sale
saleItemSchema.index({ productId: 1 }); // For product analytics
saleItemSchema.index({ saleId: 1, productId: 1 }); // Compound index for both

const SaleItem =
  mongoose.models.SaleItem || mongoose.model("SaleItem", saleItemSchema);
export default SaleItem;
