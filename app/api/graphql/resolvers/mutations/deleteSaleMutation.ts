import Sale from "../../models/Sale";
import SaleItem from "../../models/SaleItem";
import ProductIngredient from "../../models/ProductIngredients";
import Item from "../../models/Item";
import { errorResponse, successResponse } from "../../utils/response";

export const deleteParkedSale = async (_: unknown, { id }: { id: string }, context: any) => {
	if (!context.user) {
		throw new Error("Authentication required");
	}

	const userPermissions = context.user.permissions || {};
	const userRole = context.user.role;

	if (userRole !== 'SUPER_ADMIN' && !userPermissions.pointOfSale?.includes('void')) {
		throw new Error("Insufficient permissions to void parked sales");
	}

	try {
		const sale = await Sale.findById(id);
		if (!sale) {
			return errorResponse("Parked sale not found");
		}

		if (sale.status !== "PARKED") {
			return errorResponse("Can only delete parked sales");
		}

		console.log("Voiding parked sale - returning ingredients to inventory");
		const saleItems = await SaleItem.find({ saleId: id }).lean();

		if (saleItems.length > 0) {
			const productIds = saleItems.map(item => item.productId);
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
				const quantitySold = saleItem.quantity;
				const ingredients = ingredientsByProduct.get(saleItem.productId.toString()) || [];

				for (const ingredient of ingredients) {
					const quantityToReturn = ingredient.quantityUsed * quantitySold;
					await Item.findByIdAndUpdate(ingredient.itemId, {
						$inc: { quantity: quantityToReturn },
					});
				}
			}
		}

		await SaleItem.deleteMany({ saleId: id });
		await Sale.findByIdAndDelete(id);

		return successResponse("Parked sale deleted successfully");
	} catch (err: any) {
		console.error("Error deleting parked sale:", err);
		return errorResponse(err.message || "Failed to delete parked sale");
	}
};
