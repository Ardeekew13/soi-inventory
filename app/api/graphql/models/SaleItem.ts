import mongoose from "mongoose";

const saleItemSchema = new mongoose.Schema(
  {
    saleId: {
      type: mongoose.Schema.Types.UUID,
      ref: "Sale",
      required: true,
    },
    productId: {
      type: mongoose.Schema.Types.UUID,
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
  },
  {
    timestamps: true,
  }
);

const SaleItem =
  mongoose.models.SaleItem || mongoose.model("SaleItem", saleItemSchema);
export default SaleItem;
