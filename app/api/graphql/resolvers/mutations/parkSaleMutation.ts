import Sale from "../../models/Sale";
import SaleItem from "../../models/SaleItem";
import Product from "../../models/Products";
import ProductIngredient from "../../models/ProductIngredients";
import Item from "../../models/Item";
import { errorResponse } from "../../utils/response";
import { generateOrderNo } from "../helpers/salesHelpers";

export const parkSale = async (
	_: unknown,
	{
		id,
		items,
		orderType,
		tableNumber,
	}: {
		id?: string;
		items: { productId: string; quantity: number }[];
		orderType: string;
		tableNumber?: string;
	},
	context: any
) => {
	if (!context.user) {
		throw new Error("Authentication required");
	}

	const userPermissions = context.user.permissions || {};
	const userRole = context.user.role;

	if (userRole !== 'SUPER_ADMIN' && !userPermissions.pointOfSale?.includes('addEdit')) {
		throw new Error("Insufficient permissions to park sales");
	}

	try {
		let sale;
		let orderNo;

		if (id) {
			sale = await Sale.findById(id);
			if (!sale) {
				return errorResponse("Parked sale not found");
			}
			orderNo = sale.orderNo;
		} else {
			orderNo = await generateOrderNo("PARK");
			
			sale = await Sale.create({
				totalAmount: 0,
				costOfGoods: 0,
				grossProfit: 0,
				status: "PARKED",
				orderNo,
				orderType,
				tableNumber: orderType === "DINE_IN" ? tableNumber : null,
				cashierId: context.user.id,
				cashierName: context.user.username,
			});
		}

		let totalAmount = 0;
		let costOfGoods = 0;
		const saleItemsData = [];

		const existingItems = id ? await SaleItem.find({ saleId: id }) : [];
		const existingItemsMap = new Map(
			existingItems.map(item => [item.productId.toString(), item])
		);

		if (id && existingItems.length > 0) {
			const existingProductIds = existingItems.map(item => item.productId);
			const oldIngredients = await ProductIngredient.find({ 
				productId: { $in: existingProductIds } 
			}).lean();
			
			const ingredientsByProduct = new Map();
			oldIngredients.forEach((ing: any) => {
				const key = ing.productId.toString();
				if (!ingredientsByProduct.has(key)) {
					ingredientsByProduct.set(key, []);
				}
				ingredientsByProduct.get(key).push(ing);
			});
			
			for (const existingItem of existingItems) {
				const ingredients = ingredientsByProduct.get(existingItem.productId.toString()) || [];
				for (const ingredient of ingredients) {
					const quantityToRestore = ingredient.quantityUsed * existingItem.quantity;
					await Item.findByIdAndUpdate(ingredient.itemId, {
						$inc: { quantity: quantityToRestore },
					});
				}
			}
		}

		const productIds = items.map(item => item.productId);
		const products = await Product.find({ _id: { $in: productIds } }).lean();
		const productMap = new Map(products.map((p: any) => [p._id.toString(), p]));
		
		const allIngredients = await ProductIngredient.find({ 
			productId: { $in: productIds } 
		}).lean();
		
		const ingredientsByProduct = new Map();
		allIngredients.forEach((ing: any) => {
			const key = ing.productId.toString();
			if (!ingredientsByProduct.has(key)) {
				ingredientsByProduct.set(key, []);
			}
			ingredientsByProduct.get(key).push(ing);
		});

		const itemIds = [...new Set(allIngredients.map((ing: any) => ing.itemId.toString()))];
		const inventoryItems = await Item.find({ _id: { $in: itemIds } }).lean();
		const itemMap = new Map(inventoryItems.map((i: any) => [i._id.toString(), i]));

		for (const item of items) {
			const product = productMap.get(item.productId);
			if (!product) {
				throw new Error(`Product with ID ${item.productId} not found`);
			}

			totalAmount += product.price * item.quantity;

			const ingredients = ingredientsByProduct.get(item.productId) || [];
			let itemCost = 0;

			for (const ingredient of ingredients) {
				const inventoryItem = itemMap.get(ingredient.itemId.toString());
				if (inventoryItem) {
					const quantityNeeded = ingredient.quantityUsed * item.quantity;
					itemCost += inventoryItem.pricePerUnit * quantityNeeded;

					await Item.findByIdAndUpdate(ingredient.itemId, {
						$inc: { quantity: -quantityNeeded },
					});
				}
			}

			costOfGoods += itemCost;

			const existingItem = existingItemsMap.get(item.productId);
			const quantityPrinted = existingItem?.quantityPrinted || 0;

			saleItemsData.push({
				saleId: sale._id,
				productId: item.productId,
				quantity: item.quantity,
				priceAtSale: product.price,
				quantityPrinted,
			});
		}

		const grossProfit = totalAmount - costOfGoods;

		if (id) {
			await SaleItem.deleteMany({ saleId: id });
		}

		await SaleItem.insertMany(saleItemsData);

		await Sale.findByIdAndUpdate(sale._id, {
			totalAmount,
			costOfGoods,
			grossProfit,
			orderType,
			tableNumber: orderType === "DINE_IN" ? tableNumber : null,
			updatedAt: new Date(),
		});

		return {
			success: true,
			message: id ? "Order updated in park" : "Order parked successfully",
			data: {
				_id: sale._id,
				totalAmount,
				grossProfit,
				orderNo,
				status: "PARKED",
			},
		};
	} catch (err: any) {
		console.error("Error parking sale:", err);
		return errorResponse(err.message || "Failed to park sale");
	}
};
