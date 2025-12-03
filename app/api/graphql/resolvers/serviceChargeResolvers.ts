import ServiceCharge from "../models/ServiceCharge";
import { errorResponse, successResponse } from "../utils/response";

const serviceChargeResolvers = {
	Query: {
		// Get all service charges
		serviceCharges: async () => {
			try {
				const serviceCharges = await ServiceCharge.find({ isActive: true }).sort({ createdAt: -1 });
				return serviceCharges;
			} catch (error) {
				console.error("Error fetching service charges:", error);
				throw new Error("Failed to fetch service charges");
			}
		},

		// Get single service charge by ID
		serviceCharge: async (_: unknown, { id }: { id: string }) => {
			try {
				const serviceCharge = await ServiceCharge.findById(id);
				if (!serviceCharge) {
					throw new Error("Service charge not found");
				}
				return serviceCharge;
			} catch (error) {
				console.error("Error fetching service charge:", error);
				throw new Error("Failed to fetch service charge");
			}
		},
	},

	Mutation: {
		// Create new service charge
		createServiceCharge: async (
			_: unknown,
			{ input }: { input: { title: string; value: number } }
		) => {
			try {
				const { title, value } = input;

				// Validate value is between 0 and 100
				if (value < 0 || value > 100) {
					return errorResponse("Service charge value must be between 0 and 100");
				}

				// Check if service charge with same title exists
				const existingServiceCharge = await ServiceCharge.findOne({ title, isActive: true });
				if (existingServiceCharge) {
					return errorResponse("Service charge with this title already exists");
				}

				const serviceCharge = await ServiceCharge.create({
					title,
					value,
					isActive: true,
				});

				return successResponse("Service charge created successfully", serviceCharge);
			} catch (error) {
				console.error("Error creating service charge:", error);
				return errorResponse("Failed to create service charge");
			}
		},

		// Update existing service charge
		updateServiceCharge: async (
			_: unknown,
			{ id, input }: { id: string; input: { title: string; value: number } }
		) => {
			try {
				const { title, value } = input;

				// Validate value is between 0 and 100
				if (value < 0 || value > 100) {
					return errorResponse("Service charge value must be between 0 and 100");
				}

				const serviceCharge = await ServiceCharge.findById(id);
				if (!serviceCharge) {
					return errorResponse("Service charge not found");
				}

				// Check if another service charge with same title exists
				const existingServiceCharge = await ServiceCharge.findOne({
					title,
					isActive: true,
					_id: { $ne: id },
				});
				if (existingServiceCharge) {
					return errorResponse("Service charge with this title already exists");
				}

				serviceCharge.title = title;
				serviceCharge.value = value;
				await serviceCharge.save();

				return successResponse("Service charge updated successfully", serviceCharge);
			} catch (error) {
				console.error("Error updating service charge:", error);
				return errorResponse("Failed to update service charge");
			}
		},

		// Delete service charge (soft delete)
		deleteServiceCharge: async (_: unknown, { id }: { id: string }) => {
			try {
				const serviceCharge = await ServiceCharge.findById(id);
				if (!serviceCharge) {
					return errorResponse("Service charge not found");
				}

				serviceCharge.isActive = false;
				await serviceCharge.save();

				return successResponse("Service charge deleted successfully", null);
			} catch (error) {
				console.error("Error deleting service charge:", error);
				return errorResponse("Failed to delete service charge");
			}
		},
	},

	ServiceCharge: {
		id: (parent: any) => parent._id.toString(),
	},
};

export default serviceChargeResolvers;
