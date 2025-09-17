import { ProductIngredientDTO, SaleWithItems } from "@/lib/supabase.types";
import { v4 as uuidv4 } from "uuid";

export interface CartLine {
	tempKey: string;
	productId: string;
	name: string;
	price: number;
	quantity: number;
	fromDb: boolean;
	printed_qty: number;
	ingredientsUsed: ProductIngredientDTO[];
}

export interface Cart {
	saleId: string | null;
	orderNo: string | null;
	tableNo: number | null;
	serviceType: "DINE_IN" | "TAKE_OUT" | "DELIVERY";
	paymentMethod: "CASH" | "CARD" | "GCASH" | "BANK" | "OTHER" | null;
	tempKey: string;
	saleItems: CartLine[];
	costOfGoods: number | null;
	grossProfit: number | null;
	status: "REFUNDED" | "COMPLETED" | "VOID" | "PARKED";
	totalAmount: number;
}

export function makeCart(): Cart {
	return {
		saleId: null,
		orderNo: null,
		tableNo: null,
		serviceType: "DINE_IN",
		paymentMethod: null,
		saleItems: [],
		tempKey: uuidv4(),
		costOfGoods: 0,
		grossProfit: 0,
		status: "PARKED",
		totalAmount: 0,
	};
}

export function addProduct(
	cart: Cart,
	product: CartLine,
	qty: number = 1
): Cart {
	// Find an existing cart line with the same product that still has unprinted qty
	const i = cart?.saleItems?.findIndex(
		(item) =>
			item.productId === product.productId &&
			(item.quantity ?? 0) > (item.printed_qty ?? 0)
	);

	if (i !== -1) {
		// Update quantity of existing cart line
		const saleItems = [...cart.saleItems];
		saleItems[i] = {
			...saleItems[i],
			quantity: (saleItems[i].quantity ?? 0) + qty,
			price: product.price ?? saleItems[i].price,
		};

		return {
			...cart,
			saleItems,
		};
	}

	// Otherwise add a new cart line
	return {
		...cart,
		saleItems: [
			...cart.saleItems,
			{
				...product,
				tempKey: product.tempKey ?? uuidv4(),
				fromDb: false, // new addition not yet in DB
				printed_qty: product.printed_qty ?? 0, // align with DB schema
				quantity: qty,
				price: product.price ?? 0,
			},
		],
	};
}

export function saleToCart(sale: SaleWithItems): Cart {
	const saleItems: CartLine[] = (sale.sale_items ?? []).map((si) => ({
		tempKey: si.id,
		productId: si?.product?.id ?? "",
		name: si.product?.name ?? "",
		price: si.unit_price ?? 0,
		quantity: si.quantity ?? 1,
		fromDb: true,
		printed_qty: si.printed_qty ?? 0,
		ingredientsUsed: si.product?.ingredients ?? [],
	}));

	return {
		saleId: sale.id,
		orderNo: sale.order_no ?? null,
		tableNo: sale.table_no ?? null,
		serviceType:
			(sale.service_type?.toUpperCase?.() as Cart["serviceType"]) ?? "",
		costOfGoods: sale?.cost_of_goods,
		grossProfit: sale?.gross_profit,
		status: sale?.status,
		totalAmount: sale?.total_amount,
		paymentMethod: null,
		saleItems,
		tempKey: uuidv4(),
	};
}
