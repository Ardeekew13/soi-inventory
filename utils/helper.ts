export const responsiveColumn24 = {
	xs: 24,
	sm: 24,
	md: 24,
	lg: 24,
	xl: 24,
};

export const responsiveColumn18 = {
	xs: 24,
	sm: 24,
	md: 24,
	lg: 18,
	xl: 18,
};

export const responsiveColumn12 = {
	xs: 24,
	sm: 24,
	md: 24,
	lg: 12,
	xl: 12,
};

export const responsiveColumn8 = {
	xs: 24,
	sm: 24,
	md: 24,
	lg: 12,
	xl: 8,
};

export const responsiveColumn6 = {
	xs: 24,
	sm: 24,
	md: 24,
	lg: 12,
	xl: 6,
};

export const responsiveColumn4 = {
	xs: 24,
	sm: 12,
	md: 8,
	lg: 6,
	xl: 4,
};

export const responsiveColumn3 = {
	xs: 24,
	sm: 12,
	md: 8,
	lg: 6,
	xl: 3,
};

export const requiredField = [
	{
		required: true,
		message: "This field is required!",
	},
];

export const formatPeso = (
	value: number | string | null | undefined
): string => {
	if (value == null || value === "") return "₱ 0";

	const num = typeof value === "string" ? parseFloat(value) : value;

	if (isNaN(num)) return "₱ 0";

	return `₱ ${num.toLocaleString("en-PH", {
		minimumFractionDigits: 2,
		maximumFractionDigits: 2,
	})}`;
};

// export const saleToCart = (sale: Sale): CartItem[] =>
// 	(sale.saleItems ?? []).map((si) => {
// 		const p = si.product;
// 		return {
// 			...p,
// 			id: si.id,
// 			productId: p.id,
// 			name: p.name,
// 			price: si.priceAtSale ?? p.price ?? 0,
// 			quantity: si.quantity ?? 1,
// 			printed: !!si.printed,
// 			fromDb: true,
// 			saleItemId: si.id,
// 			ingredientsUsed: p.ingredientsUsed ?? [],
// 			tempKey: si.id ?? uuidv4(),
// 			tableNo: sale.tableNo,
// 			orderNo: sale.orderNo,
// 		} as CartItem;
// 	});
