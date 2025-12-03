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

const SaleItem =
  mongoose.models.SaleItem || mongoose.model("SaleItem", saleItemSchema);
export default SaleItem;
