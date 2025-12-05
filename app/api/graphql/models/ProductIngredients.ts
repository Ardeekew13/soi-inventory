import mongoose from "mongoose";

const productIngredientSchema = new mongoose.Schema(
  {
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    itemId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Item",
      required: true,
    },
    quantityUsed: {
      type: Number,
      required: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// Equivalent of @@unique([productId, itemId])
productIngredientSchema.index({ productId: 1, itemId: 1 }, { unique: true });
productIngredientSchema.index({ isActive: 1 }); // For filtering active ingredients

const ProductIngredient =
  mongoose.models.ProductIngredient ||
  mongoose.model("ProductIngredient", productIngredientSchema);

export default ProductIngredient;
