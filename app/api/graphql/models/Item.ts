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
		isActive: {
			type: Boolean,
			default: true,
		},
		version: {
			type: Number,
			default: 0,
		},
	},
	{
		timestamps: true,
	}
);

// Indexes for performance
// Note: name already has unique index from schema definition
itemSchema.index({ currentStock: 1 }); // For low stock queries
itemSchema.index({ createdAt: -1 }); // For sorting by date
itemSchema.index({ isActive: 1 }); // For filtering active items

const Item = mongoose.models.Item || mongoose.model("Item", itemSchema);
export default Item;
