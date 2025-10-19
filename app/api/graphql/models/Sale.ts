import mongoose from "mongoose";

const saleSchema = new mongoose.Schema(
  {
    totalAmount: {
      type: Number,
      required: true,
    },
    costOfGoods: {
      type: Number,
      required: true,
    },
    grossProfit: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      required: true,
      enum: ["PENDING", "COMPLETED", "VOID"], // optional: customize statuses
      default: "COMPLETED",
    },
    voidReason: {
      type: String,
      default: "",
    },
    orderNo: {
      type: String,
      unique: true,
      required: true,
      trim: true,
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false }, // Prisma's Sale has only createdAt
  }
);

const Sale = mongoose.models.Sale || mongoose.model("Sale", saleSchema);
export default Sale;
