import Sale from "../../models/Sale";
import SaleItem from "../../models/SaleItem";
import Product from "../../models/Products";
import ProductIngredient from "../../models/ProductIngredients";
import Item from "../../models/Item";
import CashDrawer from "../../models/CashDrawer";
import { errorResponse } from "../../utils/response";
import { generateOrderNo, calculateItemCost } from "../helpers/salesHelpers";
import { batchDeductInventory } from "../services/inventoryService";

export const checkoutSale = async (
	_: unknown,
	{
		id,
		items,
		orderType,
		tableNumber,
		paymentMethod = "CASH",
	}: {
		id?: string;
		items: { productId: string; quantity: number }[];
		orderType: string;
		tableNumber?: string;
		paymentMethod?: string;
	},
	context: any
) => {
	if (!context.user) {
		throw new Error("Authentication required");
	}

	const userPermissions = context.user.permissions || {};
	const userRole = context.user.role;

	if (userRole !== 'SUPER_ADMIN' && !userPermissions.pointOfSale?.includes('addEdit')) {
		throw new Error("Insufficient permissions to checkout sales");
	}

	try {
		let totalAmount = 0;
		let costOfGoods = 0;
		let saleItemsData;
		
		if (id) {
			const sale = await Sale.findById(id);
			if (!sale) {
				return errorResponse("Parked sale not found");
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

			const processedData = [];
			for (const item of items) {
				const product = productMap.get(item.productId);
				if (!product) {
					throw new Error(`Product with ID ${item.productId} not found`);
				}

				const price = product.price || 0;
				totalAmount += price * item.quantity;

				const ingredients = ingredientsByProduct.get(item.productId) || [];
				let itemCost = 0;

				for (const ingredient of ingredients) {
					const inventoryItem = itemMap.get(ingredient.itemId.toString());
					if (inventoryItem) {
						const quantityNeeded = ingredient.quantityUsed * item.quantity;
						itemCost += inventoryItem.pricePerUnit * quantityNeeded;
					}
				}

				costOfGoods += itemCost;

				processedData.push({
					productId: item.productId,
					quantity: item.quantity,
					priceAtSale: price,
				});
			}

			saleItemsData = processedData;
		} else {
			// For new sales, calculate totals without saving to DB yet
			totalAmount = 0;
			costOfGoods = 0;
			
			const productIds = items.map(item => item.productId);
			const products = await Product.find({ _id: { $in: productIds } }).lean();
			const productMap = new Map(products.map((p: any) => [p._id.toString(), p]));

			const processedData = [];
			for (const item of items) {
				const product = productMap.get(item.productId);
				if (!product) {
					throw new Error(`Product with ID ${item.productId} not found`);
				}

				const itemCost = await calculateItemCost(item.productId, item.quantity);
				const price = product.price || 0;
				const subtotal = price * item.quantity;

				totalAmount += subtotal;
				costOfGoods += itemCost;

				processedData.push({
					productId: item.productId,
					quantity: item.quantity,
					priceAtSale: price,
				});
			}

			saleItemsData = processedData;
		}

		const grossProfit = totalAmount - costOfGoods;

		let orderNo;
		let sale;

		if (id) {
			sale = await Sale.findById(id);
			if (!sale) {
				return errorResponse("Parked sale not found");
			}

			orderNo = sale.orderNo || await generateOrderNo();

			await SaleItem.deleteMany({ saleId: id });

			await Sale.findByIdAndUpdate(id, {
				totalAmount,
				costOfGoods,
				grossProfit,
				status: "COMPLETED",
				orderNo,
				orderType,
				tableNumber: orderType === "DINE_IN" ? tableNumber : null,
			});

			sale = await Sale.findById(id);
		} else {
			orderNo = await generateOrderNo();
			
			sale = await Sale.create({
				totalAmount,
				costOfGoods,
				grossProfit,
				status: "COMPLETED",
				orderNo,
				orderType,
				tableNumber: orderType === "DINE_IN" ? tableNumber : null,
				cashierId: context.user.id,
				cashierName: context.user.username,
			});
		}

		const itemsWithSaleId = saleItemsData.map((item: any) => ({
			...item,
			saleId: sale!._id,
		}));
		await SaleItem.insertMany(itemsWithSaleId);

		// Deduct inventory for new sales
		if (!id) {
			await batchDeductInventory(items);
		}

		const openDrawer = await CashDrawer.findOne({ status: "OPEN" }).sort({ openedAt: -1 });
		if (openDrawer) {
			openDrawer.transactions.push({
				type: "SALE",
				amount: totalAmount,
				description: `Sale ${orderNo}`,
				saleId: sale!._id,
				paymentMethod: paymentMethod,
			} as any);
			await openDrawer.save();
		}

		return {
			success: true,
			message: "Sale completed successfully",
			data: {
				_id: sale!._id,
				totalAmount,
				grossProfit,
				orderNo,
				status: "COMPLETED",
			},
		};
	} catch (err: any) {
		console.error("Error checking out sale:", err);
		return errorResponse(err.message || "Failed to checkout sale");
	}
};
