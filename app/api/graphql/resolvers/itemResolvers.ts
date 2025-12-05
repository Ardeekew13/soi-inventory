import { message } from "antd";
import Item from "../models/Item";
import ProductIngredient from "../models/ProductIngredients";
import { applyPaginationArgs, PaginationListArgs } from "../utils/pagination";
import { errorResponse, successResponse } from "../utils/response";
import { update } from "lodash";
import { GraphQLContext } from "../context";
import User from "../models/User";

export const itemResolvers = {
	Query: {
		itemsList: async (_: unknown, args: PaginationListArgs, { user }: GraphQLContext) => {
			// Check authentication
			if (!user) {
				throw new Error("Not authenticated");
			}

			// Get user permissions from database
			const dbUser = await User.findById(user.id);
			if (!dbUser) {
				throw new Error("User not found");
			}

			// Check permissions
			const permissions = dbUser.permissions || {};
			if (!permissions.inventory?.includes('view')) {
				throw new Error("Unauthorized - No permission to view inventory");
			}

			const { limit, skip } = applyPaginationArgs(args);
			const filter = args.search
				? { name: { $regex: args.search, $options: "i" }, isActive: true }
				: { isActive: true };
			const [items, totalCount] = await Promise.all([
				Item.find(filter).limit(limit).skip(skip),
				Item.countDocuments(filter),
			]);
			const formattedItems = items.map((item) => ({
				...item?.toObject(),
				createdAt: new Date(item.createdAt).toISOString(),
				updatedAt: new Date(item.updatedAt).toISOString(),
			}));
			return { items:formattedItems, totalCount };
		},
	},
	Item: {
		id: (parent: any) => parent._id.toString(),
	},
	Mutation: {
		addItem: async (
			_: unknown,
			{
				_id,
				name,
				unit,
				pricePerUnit,
				currentStock,
			}: {
				_id?: string;
				name: string;
				unit: string;
				pricePerUnit: number;
				currentStock: number;
			},
			{ user }: GraphQLContext
		) => {
			// Check authentication
			if (!user) {
				return errorResponse("Not authenticated");
			}

			// Check permissions - now using permissions from context
			const userRole = user.role;
			const permissions = user.permissions || {};
			
			if (userRole !== 'SUPER_ADMIN' && !permissions.inventory?.includes('addEdit')) {
				return errorResponse("Unauthorized - No permission to add/edit inventory items");
			}

			try {
				let item;
				const existingItem = await Item.findOne({ name, _id: { $ne: _id } });
				if (existingItem) {
					return errorResponse("An item with this name already exists.");
				}
				if (_id) {
					item = await Item.findByIdAndUpdate(
						_id,
						{
							name,
							unit,
							pricePerUnit,
							currentStock,
							updatedAt: new Date(),
						},
						{ new: true }
					);
					return {
						success: true,
						message: "Item updated successfully",
						data: {
							...item?.toObject(),
							updatedAt: new Date(item?.updatedAt).toISOString(),
						},
					};
				} else {
					item = await Item.create({
						name,
						unit,
						pricePerUnit,
						currentStock,
					});

					return {
						success: true,
						message: "Item added successfully",
						data: {
							...item?.toObject(),
							createdAt: new Date(item?.createdAt).toISOString(),
							updatedAt: new Date(item?.updatedAt).toISOString(),
						},
					};
				}
			} catch (err) {
				console.error("addItem error:", err);
				return errorResponse("Failed to add/update item.");
			}
		},
		deleteItem: async (_: unknown, { _id }: { _id: string }, { user }: GraphQLContext) => {
			// Check authentication
			if (!user) {
				return errorResponse("Not authenticated");
			}

			// Check permissions - now using permissions from context
			const userRole = user.role;
			const permissions = user.permissions || {};
			
			if (userRole !== 'SUPER_ADMIN' && !permissions.inventory?.includes('delete')) {
				return errorResponse("Unauthorized - No permission to delete inventory items");
			}

			try {
				// Check if item exists
				const item = await Item.findById(_id);
				if (!item) {
					return errorResponse("Item not found");
				}
				
				// Find products that use this ingredient
				const productIngredients = await ProductIngredient.find({ 
					itemId: _id,
					isActive: true 
				}).populate('productId');
				
				const affectedProducts = productIngredients
					.filter(pi => pi.productId)
					.map((pi: any) => pi.productId.name);
				
				// Soft delete: mark as inactive
				await Item.findByIdAndUpdate(_id, { isActive: false });
				
				// Mark associated product ingredients as inactive (remove from products)
				await ProductIngredient.updateMany(
					{ itemId: _id },
					{ isActive: false }
				);
				
				// Return success with warning if products are affected
				if (affectedProducts.length > 0) {
					return successResponse(
						`Item deleted. This ingredient was removed from ${affectedProducts.length} product(s): ${affectedProducts.join(', ')}`,
						null
					);
				}
				
				return successResponse("Item deleted successfully", null);
			} catch (err) {
				console.error("deleteItem error:", err);
				return errorResponse("Failed to delete item");
			}
		},
	},
};
