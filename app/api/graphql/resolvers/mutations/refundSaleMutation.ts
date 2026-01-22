import Sale from "../../models/Sale";
import SaleItem from "../../models/SaleItem";
import Product from "../../models/Products";
import ProductIngredient from "../../models/ProductIngredients";
import Item from "../../models/Item";
import CashDrawer from "../../models/CashDrawer";
import { errorResponse, successResponse } from "../../utils/response";

export const refundSale = async (_: unknown, { id, refundReason }: { id: string; refundReason: string }, context: any) => {
	if (!context.user) {
		throw new Error("Authentication required");
	}

	const userPermissions = context.user.permissions || {};
	const userRole = context.user.role;

	if (userRole !== 'SUPER_ADMIN' && !userPermissions.transaction?.includes('refund')) {
		throw new Error("Insufficient permissions to refund sales");
	}

	try {
		const sale = await Sale.findById(id);
		if (!sale) {
			return errorResponse("Sale not found");
		}

		if (sale.status !== "COMPLETED") {
			return errorResponse("Can only refund completed sales");
		}

		const saleItems = await SaleItem.find({ saleId: id }).lean();

		if (saleItems.length > 0) {
			const productIds = saleItems.map(item => item.productId);
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

			for (const saleItem of saleItems) {
				const product = productMap.get(saleItem.productId.toString());
				if (!product) continue;

				const ingredients = ingredientsByProduct.get(saleItem.productId.toString()) || [];

				for (const ingredient of ingredients) {
					const quantityToReturn = ingredient.quantityUsed * saleItem.quantity;
					await Item.findByIdAndUpdate(ingredient.itemId, {
						$inc: { quantity: quantityToReturn },
					});
				}
			}
		}

		await Sale.findByIdAndUpdate(id, {
			status: "REFUNDED",
			refundReason,
			refundedAt: new Date(),
			refundedBy: context.user.id,
		});

		const openDrawer = await CashDrawer.findOne({ status: "OPEN" }).sort({ openedAt: -1 });
		if (openDrawer) {
			openDrawer.transactions.push({
				type: "REFUND",
				amount: -sale.totalAmount,
				description: `Refund for ${sale.orderNo}: ${refundReason}`,
				saleId: sale._id,
			} as any);
			await openDrawer.save();
		}

		return successResponse("Sale refunded and ingredients returned to inventory");
	} catch (err: any) {
		console.error("Error refunding sale:", err);
		return errorResponse(err.message || "Failed to refund sale");
	}
};
