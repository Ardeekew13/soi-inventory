// lib/supabase.types.ts

// ==========================
// ITEMS
// ==========================
export type Item = {
	id: string;
	name: string;
	unit: string;
	price_per_unit: number;
	current_stock: number;
	created_at: string;
	updated_at: string;
};
export type ItemInsert = Omit<Item, "id" | "created_at" | "updated_at">;
export type ItemUpdate = Partial<Item>;

// ==========================
// PRODUCTS
// ==========================
export type Product = {
	id: string;
	name: string;
	price: number;
	is_active: boolean;
	item_id?: string | null;
	created_at: string;
	updated_at: string;
	ingredients: ProductIngredientDTO[];
};

export type ProductIngredientDTO = {
	item_id: string;
	item_name: string;
	qty: number;
	unit: string;
};
export type ProductInsert = Omit<Product, "id" | "created_at" | "updated_at">;
export type ProductUpdate = Partial<Product>;

// ==========================
// USERS
// ==========================
export type User = {
	id: string;
	username: string;
	first_name: string;
	last_name: string;
	role: string;
	created_at: string;
	updated_at: string;
};
export type UserInsert = Omit<User, "id" | "created_at" | "updated_at">;
export type UserUpdate = Partial<User>;

// ==========================
// SALE REPORTS (RPC return)
// ==========================
export type TopProduct = { name: string; quantity: number };
export type MonthlySaleReport = {
	month: string;
	gross_profit: number;
	total_cost: number;
	total_sales: number;
	total_items: number;
};
export type SaleReportGroup = {
	grossProfit: number;
	totalAmountSales: number;
	totalCostOfGoods: number;
	totalItemsSold: number;
	grossProfitPercentage: number;
	totalSalesPercentage: number;
	totalCostPercentage: number;
	availableYears: number[];
	topProductSold: TopProduct[];
	groupSales: MonthlySaleReport[];
};

// ==========================
// SALES
// ==========================
export type Sale = {
	id: string;
	user_id: string;
	cash_drawer_id?: string | null;
	order_no?: string | null;
	table_no?: number | null;
	service_type: "DINE_IN" | "TAKE_OUT" | "DELIVERY";
	payment_method: "CASH" | "CARD" | "GCASH" | "BANK" | "OTHER";
	status: "REFUNDED" | "COMPLETED" | "VOID" | "PARKED";
	subtotal_amount: number;
	discount_amount: number;
	tax_amount: number;
	total_amount: number;
	cogs_amount: number;
	cost_of_goods: number;
	gross_profit: number;
	created_at: string;
	updated_at: string;
	void_reason?: string | null;
	voided_at?: string | null;
	voided_by_id?: string | null;
};
export type SaleWithItems = {
	id: string;
	order_no?: string | null;
	status: "REFUNDED" | "COMPLETED" | "VOID" | "PARKED";
	payment_method: "CASH" | "CARD" | "GCASH" | "BANK" | "OTHER";
	service_type: "DINE_IN" | "TAKE_OUT" | "DELIVERY";
	table_no?: number | null;
	void_reason?: string | null;
	voided_by_id?: string | null;
	voided_at?: string | null;
	subtotal_amount: number;
	discount_amount: number;
	tax_amount: number;
	total_amount: number;
	cogs_amount: number;
	cost_of_goods: number;
	gross_profit: number;
	user_id: string;
	cash_drawer_id?: string | null;
	created_at: string;
	updated_at: string;
	sale_items: SaleItem[]; // ✅ full list of items
};
export type SaleItemProduct = {
	id: string;
	name: string;
	price: number;
};

export type SaleItem = {
	id: string;
	sale_id: string;
	product_id: string;
	quantity: number;
	unit_price: number;
	kitchen_state?: string | null;
	created_at: string;
	updated_at: string;
	printed_qty: number; // ✅ instead of printed boolean
	product?: Product;
};
export type SaleInsert = Omit<Sale, "id" | "created_at" | "updated_at">;
export type SaleUpdate = Partial<Sale>;
// ==========================
// PRODUCT INGREDIENTS
// ==========================
export type ProductIngredient = {
	id: string;
	product_id: string;
	item_id: string;
	qty: number;
	unit: string;
	created_at: string;
	updated_at: string;
};
export type ProductIngredientInsert = Omit<
	ProductIngredient,
	"id" | "created_at" | "updated_at"
>;
export type ProductIngredientUpdate = Partial<ProductIngredient>;
// NESTED / JOINED SHAPES
export type ProductIngredientJoined = ProductIngredient & {
	item: Item; // joined item row
};
