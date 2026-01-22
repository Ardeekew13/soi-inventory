import Sale from "../../models/Sale";
import SaleItem from "../../models/SaleItem";
import Product from "../../models/Products";
import ProductIngredient from "../../models/ProductIngredients";
import Item from "../../models/Item";
import { errorResponse, successResponse } from "../../utils/response";

export const changeItem = async (
	_: unknown,
	{ saleId, oldSaleItemId, newProductId, newQuantity, reason }: { 
		saleId: string; 
		oldSaleItemId: string; 
		newProductId: string; 
		newQuantity: number;
		reason: string;
	},
	context: any
) => {
	if (!context.user) {
		throw new Error("Authentication required");
	}

	const userPermissions = context.user.permissions || {};
	const userRole = context.user.role;

	if (userRole !== 'SUPER_ADMIN' && !userPermissions.transaction?.includes('changeItem')) {
		throw new Error("Insufficient permissions to change sale items");
	}

	try {
		const sale = await Sale.findById(saleId);
		if (!sale) {
			return errorResponse("Sale not found");
		}

		if (sale.status !== "COMPLETED") {
			return errorResponse("Can only change items in completed sales");
		}

		const oldSaleItem = await SaleItem.findById(oldSaleItemId);
		if (!oldSaleItem) {
			return errorResponse("Sale item not found");
		}

		const productIds = [oldSaleItem.productId.toString(), newProductId];
		const products = await Product.find({ _id: { $in: productIds } }).lean();
		const productMap = new Map(products.map((p: any) => [p._id.toString(), p]));
		
		const oldProduct = productMap.get(oldSaleItem.productId.toString());
		const newProduct = productMap.get(newProductId);
		
		if (!oldProduct || !newProduct) {
			return errorResponse("Product not found");
		}

		const allIngredients = await ProductIngredient.find({ productId: { $in: productIds } }).lean();
		
		const ingredientsByProduct = new Map();
		allIngredients.forEach((ing: any) => {
			const key = ing.productId.toString();
			if (!ingredientsByProduct.has(key)) {
				ingredientsByProduct.set(key, []);
			}
			ingredientsByProduct.get(key).push(ing);
		});

		const itemIds = [...new Set(allIngredients.map((ing: any) => ing.itemId.toString()))];
		const items = await Item.find({ _id: { $in: itemIds } }).lean();
		const itemMap = new Map(items.map((i: any) => [i._id.toString(), i]));

		const oldIngredients = ingredientsByProduct.get(oldSaleItem.productId.toString()) || [];
		for (const ingredient of oldIngredients) {
			const quantityToReturn = ingredient.quantityUsed * oldSaleItem.quantity;
			await Item.findByIdAndUpdate(ingredient.itemId, {
				$inc: { quantity: quantityToReturn }
			});
		}

		const newIngredients = ingredientsByProduct.get(newProductId) || [];
		for (const ingredient of newIngredients) {
			const quantityNeeded = ingredient.quantityUsed * newQuantity;
			await Item.findByIdAndUpdate(ingredient.itemId, {
				$inc: { quantity: -quantityNeeded }
			});
		}

		await SaleItem.findByIdAndUpdate(oldSaleItemId, {
			productId: newProductId,
			quantity: newQuantity,
			priceAtSale: newProduct.price,
		});

		const allSaleItems = await SaleItem.find({ saleId }).lean();
		const allSaleItemProductIds = [...new Set(allSaleItems.map(item => item.productId.toString()))];
		const allProducts = await Product.find({ _id: { $in: allSaleItemProductIds } }).lean();
		const allProductMap = new Map(allProducts.map((p: any) => [p._id.toString(), p]));
		
		const allSaleItemIngredients = await ProductIngredient.find({ productId: { $in: allSaleItemProductIds } }).lean();
		const allIngredientsByProduct = new Map();
		allSaleItemIngredients.forEach((ing: any) => {
			const key = ing.productId.toString();
			if (!allIngredientsByProduct.has(key)) {
				allIngredientsByProduct.set(key, []);
			}
			allIngredientsByProduct.get(key).push(ing);
		});
		
		const allItemIds = [...new Set(allSaleItemIngredients.map((ing: any) => ing.itemId.toString()))];
		const allItems = await Item.find({ _id: { $in: allItemIds } }).lean();
		const allItemMap = new Map(allItems.map((i: any) => [i._id.toString(), i]));

		let totalAmount = 0;
		let costOfGoods = 0;

		for (const item of allSaleItems) {
			const product = allProductMap.get(item.productId.toString());
			if (product) {
				totalAmount += product.price * item.quantity;
				
				const ingredients = allIngredientsByProduct.get(item.productId.toString()) || [];
				for (const ingredient of ingredients) {
					const invItem = allItemMap.get(ingredient.itemId.toString());
					if (invItem) {
						costOfGoods += invItem.pricePerUnit * ingredient.quantityUsed * item.quantity;
					}
				}
			}
		}

		const grossProfit = totalAmount - costOfGoods;

		await Sale.findByIdAndUpdate(saleId, {
			totalAmount,
			costOfGoods,
			grossProfit,
			status: "ITEM_CHANGED",
			voidReason: `ITEM CHANGED: ${reason} (${oldProduct.name} → ${newProduct.name})`,
		});

		return successResponse(`Item changed from ${oldProduct.name} to ${newProduct.name}. Inventory updated.`);
	} catch (err: any) {
		console.error("Error changing item:", err);
		return errorResponse(err.message || "Failed to change item");
	}
};
