import ProductIngredient from "../../models/ProductIngredients";
import Item from "../../models/Item";

export const deductInventory = async (productId: string, quantity: number) => {
	const ingredients = await ProductIngredient.find({ productId }).lean();
	
	for (const ingredient of ingredients) {
		const quantityToDeduct = ingredient.quantityUsed * quantity;
		await Item.findByIdAndUpdate(ingredient.itemId, {
			$inc: { quantity: -quantityToDeduct },
		});
	}
};

export const restoreInventory = async (productId: string, quantity: number) => {
	const ingredients = await ProductIngredient.find({ productId }).lean();
	
	for (const ingredient of ingredients) {
		const quantityToRestore = ingredient.quantityUsed * quantity;
		await Item.findByIdAndUpdate(ingredient.itemId, {
			$inc: { quantity: quantityToRestore },
		});
	}
};

export const batchDeductInventory = async (items: Array<{ productId: string; quantity: number }>) => {
	if (items.length === 0) return;

	const productIds = items.map(item => item.productId);
	const allIngredients = await ProductIngredient.find({ productId: { $in: productIds } }).lean();
	
	const ingredientsByProduct = new Map();
	allIngredients.forEach((ing: any) => {
		const key = ing.productId.toString();
		if (!ingredientsByProduct.has(key)) {
			ingredientsByProduct.set(key, []);
		}
		ingredientsByProduct.get(key).push(ing);
	});
	
	for (const item of items) {
		const ingredients = ingredientsByProduct.get(item.productId.toString()) || [];
		for (const ingredient of ingredients) {
			const quantityToDeduct = ingredient.quantityUsed * item.quantity;
			await Item.findByIdAndUpdate(ingredient.itemId, {
				$inc: { quantity: -quantityToDeduct },
			});
		}
	}
};

export const batchRestoreInventory = async (items: Array<{ productId: string; quantity: number }>) => {
	if (items.length === 0) return;

	const productIds = items.map(item => item.productId);
	const allIngredients = await ProductIngredient.find({ productId: { $in: productIds } }).lean();
	
	const ingredientsByProduct = new Map();
	allIngredients.forEach((ing: any) => {
		const key = ing.productId.toString();
		if (!ingredientsByProduct.has(key)) {
			ingredientsByProduct.set(key, []);
		}
		ingredientsByProduct.get(key).push(ing);
	});
	
	for (const item of items) {
		const ingredients = ingredientsByProduct.get(item.productId.toString()) || [];
		for (const ingredient of ingredients) {
			const quantityToRestore = ingredient.quantityUsed * item.quantity;
			await Item.findByIdAndUpdate(ingredient.itemId, {
				$inc: { quantity: quantityToRestore },
			});
		}
	}
};
