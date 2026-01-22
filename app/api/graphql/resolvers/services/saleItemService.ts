import SaleItem from "../../models/SaleItem";
import Product from "../../models/Products";
import { calculateItemCost } from "../helpers/salesHelpers";
import { batchDeductInventory } from "./inventoryService";

export const processSaleItems = async (
	saleId: string,
	items: Array<{ productId: string; quantity: number; notes?: string }>,
	existingItems: any[] = []
) => {
	const saleItemsData = [];
	const productIds = items.map(item => item.productId);
	const products = await Product.find({ _id: { $in: productIds } }).lean();
	const productMap = new Map(products.map((p: any) => [p._id.toString(), p]));

	for (const item of items) {
		const product = productMap.get(item.productId);
		if (!product) continue;

		const cost = await calculateItemCost(item.productId, item.quantity);
		const subtotal = product.sellingPrice * item.quantity;

		const existingItem = existingItems.find(
			(ei: any) => ei.productId.toString() === item.productId
		);

		if (existingItem) {
			await SaleItem.findByIdAndUpdate(existingItem._id, {
				quantity: item.quantity,
				price: product.sellingPrice,
				cost,
				subtotal,
				notes: item.notes || "",
			});
			saleItemsData.push({ ...existingItem, quantity: item.quantity, cost, subtotal });
		} else {
			const newSaleItem = new SaleItem({
				saleId,
				productId: item.productId,
				quantity: item.quantity,
				price: product.sellingPrice,
				cost,
				subtotal,
				notes: item.notes || "",
			});
			await newSaleItem.save();
			saleItemsData.push(newSaleItem);
		}
	}

	await batchDeductInventory(items);

	return saleItemsData;
};
