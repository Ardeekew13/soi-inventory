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
		inactiveItemsList: async (_: unknown, args: PaginationListArgs, { user }: GraphQLContext) => {
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
				? { name: { $regex: args.search, $options: "i" }, isActive: false }
				: { isActive: false };
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
				
				// Helper function to calculate Levenshtein distance (edit distance)
				const levenshteinDistance = (str1: string, str2: string): number => {
					const s1 = str1.toLowerCase();
					const s2 = str2.toLowerCase();
					const len1 = s1.length;
					const len2 = s2.length;
					const matrix: number[][] = [];

					for (let i = 0; i <= len1; i++) {
						matrix[i] = [i];
					}
					for (let j = 0; j <= len2; j++) {
						matrix[0][j] = j;
					}

					for (let i = 1; i <= len1; i++) {
						for (let j = 1; j <= len2; j++) {
							const cost = s1[i - 1] === s2[j - 1] ? 0 : 1;
							matrix[i][j] = Math.min(
								matrix[i - 1][j] + 1,
								matrix[i][j - 1] + 1,
								matrix[i - 1][j - 1] + cost
							);
						}
					}
					return matrix[len1][len2];
				};

				// Check for exact match (case-insensitive)
				const exactMatch = await Item.findOne({ 
					name: { $regex: new RegExp(`^${name}$`, 'i') }, 
					_id: { $ne: _id } 
				});
				
				if (exactMatch) {
					if (exactMatch.isActive) {
						return errorResponse("An active item with this name already exists.");
					} else {
						// Found inactive item with same name
						return {
							success: false,
							message: "INACTIVE_ITEM_EXISTS",
							data: exactMatch,
						};
					}
				}

				// Check for similar names (within 1-2 character difference)
				const allItems = await Item.find({ _id: { $ne: _id } });
				const similarItems = allItems.filter(item => {
					const distance = levenshteinDistance(name, item.name);
					return distance <= 2 && distance > 0; // 1-2 characters different
				});

				if (similarItems.length > 0) {
					const inactiveSimilar = similarItems.find(item => !item.isActive);
					if (inactiveSimilar) {
						return {
							success: false,
							message: "SIMILAR_INACTIVE_ITEM",
							data: inactiveSimilar,
						};
					}
					
					const activeSimilar = similarItems.filter(item => item.isActive);
					if (activeSimilar.length > 0) {
						return {
							success: false,
							message: "SIMILAR_ITEMS_EXIST",
							data: activeSimilar,
						};
					}
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
		
		reactivateItem: async (_: unknown, { _id }: { _id: string }, { user }: GraphQLContext) => {
			// Check authentication
			if (!user) {
				return errorResponse("Not authenticated");
			}

			// Check permissions
			const userRole = user.role;
			const permissions = user.permissions || {};
			
			if (userRole !== 'SUPER_ADMIN' && !permissions.inventory?.includes('addEdit')) {
				return errorResponse("Unauthorized - No permission to reactivate inventory items");
			}

			try {
				const item = await Item.findByIdAndUpdate(
					_id,
					{ isActive: true },
					{ new: true }
				);
				
				if (!item) {
					return errorResponse("Item not found");
				}

				// Also reactivate associated product ingredients
				await ProductIngredient.updateMany(
					{ itemId: _id },
					{ isActive: true }
				);

				return successResponse("Item reactivated successfully", item);
			} catch (err) {
				console.error("reactivateItem error:", err);
				return errorResponse("Failed to reactivate item");
			}
		},
	},
};

