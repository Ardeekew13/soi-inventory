import mongoose, { Schema, Document } from "mongoose";

export interface IServiceCharge extends Document {
	title: string;
	value: number; // Percentage value (e.g., 10 for 10%)
	isActive: boolean;
	createdAt: Date;
	updatedAt: Date;
}

const serviceChargeSchema = new Schema<IServiceCharge>(
	{
		title: {
			type: String,
			required: true,
			trim: true,
		},
		value: {
			type: Number,
			required: true,
			min: 0,
			max: 100, // Percentage cannot exceed 100%
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

const ServiceCharge = mongoose.models.ServiceCharge || mongoose.model<IServiceCharge>("ServiceCharge", serviceChargeSchema);

export default ServiceCharge;
