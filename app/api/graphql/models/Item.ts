import mongoose from "mongoose";

const itemSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      unique: true,
      required: true,
      trim: true,
    },
    unit: {
      type: String,
      required: true,
    },
    pricePerUnit: {
      type: Number,
      required: true,
    },
    currentStock: {
      type: Number,
      required: true,
      default: 0,
    },
  },
  {
    timestamps: true, // creates createdAt & updatedAt
  }
);

const Item = mongoose.models.Item || mongoose.model("Item", itemSchema);
export default Item;
