import Sale from "../../models/Sale";
import Product from "../../models/Products";
import ProductIngredient from "../../models/ProductIngredients";
import Item from "../../models/Item";

export const generateOrderNo = async (prefix: string = "ORD"): Promise<string> => {
	const today = new Date();
	const datePrefix = today.toISOString().slice(0, 10).replace(/-/g, "");
	const count = await Sale.countDocuments({
		orderNo: { $regex: `^${prefix}-${datePrefix}` },
	});
	return `${prefix}-${datePrefix}-${String(count + 1).padStart(4, "0")}`;
};

export const batchFetchSaleData = async (saleItems: any[]) => {
	if (saleItems.length === 0) {
		return { productMap: new Map(), ingredientMap: new Map(), itemMap: new Map() };
	}

	const productIds = [...new Set(saleItems.map(item => item.productId.toString()))];
	
	const products = await Product.find({ _id: { $in: productIds } }).lean();
	const productMap = new Map(products.map((p: any) => [p._id.toString(), p]));
	
	const allIngredients = await ProductIngredient.find({ productId: { $in: productIds } }).lean();
	
	const ingredientMap = new Map();
	allIngredients.forEach((ing: any) => {
		const key = ing.productId.toString();
		if (!ingredientMap.has(key)) {
			ingredientMap.set(key, []);
		}
		ingredientMap.get(key).push(ing);
	});
	
	const itemIds = [...new Set(allIngredients.map((ing: any) => ing.itemId.toString()))];
	
	const items = await Item.find({ _id: { $in: itemIds } }).lean();
	const itemMap = new Map(items.map((i: any) => [i._id.toString(), i]));
	
	return { productMap, ingredientMap, itemMap };
};

export const buildPopulatedSaleItems = (
	saleItems: any[], 
	productMap: Map<string, any>, 
	ingredientMap: Map<string, any>, 
	itemMap: Map<string, any>
) => {
	return saleItems.map((saleItem: any) => {
		const productId = saleItem.productId.toString();
		const product = productMap.get(productId);
		const ingredients = ingredientMap.get(productId) || [];
		
		const populatedIngredients = ingredients.map((ing: any) => {
			const item = itemMap.get(ing.itemId.toString());
			return {
				...ing,
				item: item || null,
			};
		});
		
		return {
			...saleItem,
			id: saleItem._id.toString(),
			product: product ? {
				...product,
				id: product._id.toString(),
				ingredients: populatedIngredients,
			} : null,
		};
	});
};

export const calculateItemCost = async (productId: string, quantity: number): Promise<number> => {
	const ingredients = await ProductIngredient.find({ productId }).lean();
	
	if (ingredients.length === 0) {
		return 0;
	}
	
	const itemIds = ingredients.map(ing => ing.itemId);
	const items = await Item.find({ _id: { $in: itemIds } }).lean();
	const itemMap = new Map(items.map((i: any) => [i._id.toString(), i]));
	
	let totalCost = 0;
	for (const ingredient of ingredients) {
		const item = itemMap.get(ingredient.itemId.toString());
		if (item && item.pricePerUnit) {
			totalCost += item.pricePerUnit * ingredient.quantityUsed * quantity;
		}
	}
	
	return totalCost;
};

export const calculateSaleTotals = (items: any[], productMap: Map<string, any>) => {
	let totalAmount = 0;
	let totalCost = 0;

	for (const item of items) {
		const product = productMap.get(item.productId.toString());
		if (product) {
			const itemTotal = product.sellingPrice * item.quantity;
			totalAmount += itemTotal;
			totalCost += item.cost || 0;
		}
	}

	const grossProfit = totalAmount - totalCost;

	return { totalAmount, totalCost, grossProfit };
};
