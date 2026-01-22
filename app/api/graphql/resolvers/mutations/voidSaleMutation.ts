import Sale from "../../models/Sale";
import SaleItem from "../../models/SaleItem";
import Product from "../../models/Products";
import ProductIngredient from "../../models/ProductIngredients";
import Item from "../../models/Item";
import CashDrawer from "../../models/CashDrawer";
import { errorResponse, successResponse } from "../../utils/response";

export const voidSale = async (_: unknown, { id, voidReason }: { id: string; voidReason: string }, context: any) => {
	if (!context.user) {
		throw new Error("Authentication required");
	}

	const userPermissions = context.user.permissions || {};
	const userRole = context.user.role;

	if (userRole !== 'SUPER_ADMIN' && !userPermissions.transaction?.includes('void') && !userPermissions.transaction?.includes('refund')) {
		throw new Error("Insufficient permissions to void sales");
	}

	try {
		if (!id) {
			return errorResponse("Invalid sale ID");
		}

		const sale = await Sale.findById(id);
		if (!sale) {
			return errorResponse("Sale not found");
		}

		if (sale.status === "VOID") {
			return errorResponse("Sale is already voided");
		}

		const saleItems = await SaleItem.find({ saleId: id }).lean();

		if (saleItems.length > 0) {
			const productIds = saleItems.map(item => item.productId);
			const products = await Product.find({ _id: { $in: productIds } }).lean();
			const productMap = new Map(products.map((p: any) => [p._id.toString(), p]));
			
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

			for (const saleItem of saleItems) {
				const product = productMap.get(saleItem.productId.toString());
				if (!product) continue;

				const quantitySold = saleItem.quantity;
				const ingredients = ingredientsByProduct.get(saleItem.productId.toString()) || [];

				for (const ingredient of ingredients) {
					const quantityToReturn = ingredient.quantityUsed * quantitySold;
					await Item.findByIdAndUpdate(ingredient.itemId, {
						$inc: { quantity: quantityToReturn }
					});
				}
			}
		}

		if (sale.status === "COMPLETED") {
			const openDrawer = await CashDrawer.findOne({ status: "OPEN" }).sort({ openedAt: -1 });
			if (openDrawer) {
				openDrawer.transactions.push({
					type: "VOID",
					amount: -sale.totalAmount,
					description: `Void: ${sale.orderNo} - ${voidReason}`,
					saleId: sale._id,
					paymentMethod: "CASH",
				} as any);
				await openDrawer.save();
			}
		}

		await Sale.findByIdAndUpdate(id, {
			status: "VOID",
			voidReason,
			isDeleted: true,
		});

		return successResponse("Sale voided successfully and ingredients returned to inventory");
	} catch (err: any) {
		console.error("Error voiding sale:", err);
		return errorResponse(err.message || "Failed to void sale");
	}
};
