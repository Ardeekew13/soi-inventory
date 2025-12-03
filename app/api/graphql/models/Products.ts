import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      unique: true,
      required: true,
      trim: true,
    },
    price: {
      type: Number,
      required: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true, // adds createdAt, updatedAt
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtual field for ingredients used
productSchema.virtual("ingredientsUsed", {
  ref: "ProductIngredient",
  localField: "_id",
  foreignField: "productId",
});

// Indexes for performance
productSchema.index({ name: 1 }); // Already unique, for name searches
productSchema.index({ isActive: 1 }); // For filtering active products
productSchema.index({ createdAt: -1 }); // For sorting by date
productSchema.index({ price: 1 }); // For price-based queries

const Product = mongoose.models.Product || mongoose.model("Product", productSchema);
export default Product;
