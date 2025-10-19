import mongoose from "mongoose";

const productIngredientSchema = new mongoose.Schema(
  {
    productId: {
      type: mongoose.Schema.Types.UUID,
      ref: "Product",
      required: true,
    },
    itemId: {
      type: mongoose.Schema.Types.UUID,
      ref: "Item",
      required: true,
    },
    quantityUsed: {
      type: Number,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Equivalent of @@unique([productId, itemId])
productIngredientSchema.index({ productId: 1, itemId: 1 }, { unique: true });

const ProductIngredient =
  mongoose.models.ProductIngredient ||
  mongoose.model("ProductIngredient", productIngredientSchema);

export default ProductIngredient;
