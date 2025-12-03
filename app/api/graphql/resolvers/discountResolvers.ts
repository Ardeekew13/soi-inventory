import Discount from "../models/Discount";
import { errorResponse, successResponse } from "../utils/response";

const discountResolvers = {
	Query: {
		// Get all discounts
		discounts: async (_: unknown, args: any, context: any) => {
			// Check authentication
			if (!context.user) {
				throw new Error("Authentication required");
			}

			// Check permissions
			const userPermissions = context.user.permissions || {};
			const userRole = context.user.role;

			if (userRole !== 'SUPER_ADMIN' && !userPermissions.discount?.includes('view')) {
				throw new Error("Insufficient permissions to view discounts");
			}

			try {
				const discounts = await Discount.find({ isActive: true }).sort({ createdAt: -1 });
				return discounts;
			} catch (error) {
				console.error("Error fetching discounts:", error);
				throw new Error("Failed to fetch discounts");
			}
		},

		// Get single discount by ID
		discount: async (_: unknown, { id }: { id: string }, context: any) => {
			// Check authentication
			if (!context.user) {
				throw new Error("Authentication required");
			}

			// Check permissions
			const userPermissions = context.user.permissions || {};
			const userRole = context.user.role;

			if (userRole !== 'SUPER_ADMIN' && !userPermissions.discount?.includes('view')) {
				throw new Error("Insufficient permissions to view discount");
			}

			try {
				const discount = await Discount.findById(id);
				if (!discount) {
					throw new Error("Discount not found");
				}
				return discount;
			} catch (error) {
				console.error("Error fetching discount:", error);
				throw new Error("Failed to fetch discount");
			}
		},
	},

	Mutation: {
		// Create new discount
		createDiscount: async (
			_: unknown,
			{ input }: { input: { title: string; value: number } },
			context: any
		) => {
			// Check authentication
			if (!context.user) {
				throw new Error("Authentication required");
			}

			// Check permissions
			const userPermissions = context.user.permissions || {};
			const userRole = context.user.role;

			if (userRole !== 'SUPER_ADMIN' && !userPermissions.discount?.includes('addEdit')) {
				throw new Error("Insufficient permissions to create discounts");
			}

			try {
				const { title, value } = input;

				// Validate value is between 0 and 100
				if (value < 0 || value > 100) {
					return errorResponse("Discount value must be between 0 and 100");
				}

				// Check if discount with same title exists
				const existingDiscount = await Discount.findOne({ title, isActive: true });
				if (existingDiscount) {
					return errorResponse("Discount with this title already exists");
				}

				const discount = await Discount.create({
					title,
					value,
					isActive: true,
				});

				return successResponse("Discount created successfully", discount);
			} catch (error) {
				console.error("Error creating discount:", error);
				return errorResponse("Failed to create discount");
			}
		},

		// Update existing discount
		updateDiscount: async (
			_: unknown,
			{ id, input }: { id: string; input: { title: string; value: number } },
			context: any
		) => {
			// Check authentication
			if (!context.user) {
				throw new Error("Authentication required");
			}

			// Check permissions
			const userPermissions = context.user.permissions || {};
			const userRole = context.user.role;

			if (userRole !== 'SUPER_ADMIN' && !userPermissions.discount?.includes('addEdit')) {
				throw new Error("Insufficient permissions to update discounts");
			}

			try {
				const { title, value } = input;

				// Validate value is between 0 and 100
				if (value < 0 || value > 100) {
					return errorResponse("Discount value must be between 0 and 100");
				}

				const discount = await Discount.findById(id);
				if (!discount) {
					return errorResponse("Discount not found");
				}

				// Check if another discount with same title exists
				const existingDiscount = await Discount.findOne({
					title,
					isActive: true,
					_id: { $ne: id },
				});
				if (existingDiscount) {
					return errorResponse("Discount with this title already exists");
				}

				discount.title = title;
				discount.value = value;
				await discount.save();

				return successResponse("Discount updated successfully", discount);
			} catch (error) {
				console.error("Error updating discount:", error);
				return errorResponse("Failed to update discount");
			}
		},

		// Delete discount (soft delete)
		deleteDiscount: async (_: unknown, { id }: { id: string }, context: any) => {
			// Check authentication
			if (!context.user) {
				throw new Error("Authentication required");
			}

			// Check permissions
			const userPermissions = context.user.permissions || {};
			const userRole = context.user.role;

			if (userRole !== 'SUPER_ADMIN' && !userPermissions.discount?.includes('delete')) {
				throw new Error("Insufficient permissions to delete discounts");
			}

			try {
				const discount = await Discount.findById(id);
				if (!discount) {
					return errorResponse("Discount not found");
				}

				discount.isActive = false;
				await discount.save();

				return successResponse("Discount deleted successfully", null);
			} catch (error) {
				console.error("Error deleting discount:", error);
				return errorResponse("Failed to delete discount");
			}
		},
	},

	Discount: {
		id: (parent: any) => parent._id.toString(),
	},
};

export default discountResolvers;
