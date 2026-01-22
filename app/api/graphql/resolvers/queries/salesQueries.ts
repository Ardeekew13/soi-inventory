import Sale from "../../models/Sale";
import SaleItem from "../../models/SaleItem";
import Product from "../../models/Products";
import { batchFetchSaleData, buildPopulatedSaleItems } from "../helpers/salesHelpers";

export const getSales = async (_: unknown, { search }: { search?: string }, context: any) => {
	if (!context.user) {
		throw new Error("Authentication required");
	}

	const userPermissions = context.user.permissions || {};
	const userRole = context.user.role;

	if (userRole !== 'SUPER_ADMIN' && !userPermissions.pointOfSale?.includes('view')) {
		throw new Error("Insufficient permissions to view sales");
	}

	try {
		const query: any = {};
		
		if (userRole === 'CASHIER') {
			query.cashierId = context.user.id;
		}
		
		if (search) {
			query.$or = [
				{ orderNo: { $regex: search, $options: "i" } },
				{ status: { $regex: search, $options: "i" } },
			];
		}

		const sales = await Sale.find(query).sort({ createdAt: -1 }).lean();
		
		if (sales.length === 0) {
			return [];
		}
		
		const saleIds = sales.map(sale => sale._id);
		const allSaleItems = await SaleItem.find({ saleId: { $in: saleIds } }).lean();
		
		const { productMap, ingredientMap, itemMap } = await batchFetchSaleData(allSaleItems);
		
		const saleItemsBySaleId = new Map();
		allSaleItems.forEach((item: any) => {
			const saleId = item.saleId.toString();
			if (!saleItemsBySaleId.has(saleId)) {
				saleItemsBySaleId.set(saleId, []);
			}
			saleItemsBySaleId.get(saleId).push(item);
		});
		
		const salesWithItems = sales.map((sale: any) => {
			const saleItems = saleItemsBySaleId.get(sale._id.toString()) || [];
			const populatedSaleItems = buildPopulatedSaleItems(saleItems, productMap, ingredientMap, itemMap);
			
			return {
				...sale,
				id: sale._id.toString(),
				saleItems: populatedSaleItems,
				createdAt: new Date(sale.createdAt).toISOString(),
				updatedAt: new Date(sale.updatedAt).toISOString(),
			};
		});
		
		return salesWithItems;
	} catch (err) {
		console.error("Error fetching sales:", err);
		throw new Error("Failed to fetch sales");
	}
};

export const getParkedSales = async (_: unknown, args: any, context: any) => {
	if (!context.user) {
		throw new Error("Authentication required");
	}

	const userPermissions = context.user.permissions || {};
	const userRole = context.user.role;

	if (userRole !== 'SUPER_ADMIN' && !userPermissions.pointOfSale?.includes('view')) {
		throw new Error("Insufficient permissions to view parked sales");
	}

	try {
		const query: any = { 
			status: "PARKED",
			isDeleted: { $ne: true }
		};
		
		if (userRole === 'CASHIER') {
			query.cashierId = context.user.id;
		}
		
		const sales = await Sale.find(query).sort({ updatedAt: -1 }).lean();
		
		if (sales.length === 0) {
			return [];
		}
		
		const saleIds = sales.map(sale => sale._id);
		const allSaleItems = await SaleItem.find({ saleId: { $in: saleIds } }).lean();
		
		const { productMap, ingredientMap, itemMap } = await batchFetchSaleData(allSaleItems);
		
		const saleItemsBySaleId = new Map();
		allSaleItems.forEach((item: any) => {
			const saleId = item.saleId.toString();
			if (!saleItemsBySaleId.has(saleId)) {
				saleItemsBySaleId.set(saleId, []);
			}
			saleItemsBySaleId.get(saleId).push(item);
		});
		
		const salesWithItems = sales.map((sale: any) => {
			const saleItems = saleItemsBySaleId.get(sale._id.toString()) || [];
			const populatedSaleItems = buildPopulatedSaleItems(saleItems, productMap, ingredientMap, itemMap);
			
			return {
				...sale,
				id: sale._id.toString(),
				saleItems: populatedSaleItems,
				createdAt: new Date(sale.createdAt).toISOString(),
				updatedAt: new Date(sale.updatedAt).toISOString(),
			};
		});
		
		return salesWithItems;
	} catch (err) {
		console.error("Error fetching parked sales:", err);
		throw new Error("Failed to fetch parked sales");
	}
};

export const getSaleReport = async (
	_: unknown,
	{ startDate, endDate }: { startDate?: string; endDate?: string },
	context: any
) => {
	if (!context.user) {
		throw new Error("Authentication required");
	}

	const userPermissions = context.user.permissions || {};
	const userRole = context.user.role;

	if (userRole !== 'SUPER_ADMIN' && !userPermissions.reports?.includes('view')) {
		throw new Error("Insufficient permissions to view reports");
	}

	try {
		const dateFilter: any = {
			status: "COMPLETED",
			isDeleted: { $ne: true }
		};

		if (startDate && endDate) {
			dateFilter.createdAt = {
				$gte: new Date(startDate),
				$lte: new Date(endDate),
			};
		}

		const sales = await Sale.find(dateFilter).lean();
		const totalSales = sales.reduce((sum, sale: any) => sum + (sale.totalAmount || 0), 0);
		const totalCost = sales.reduce((sum, sale: any) => sum + (sale.totalCost || 0), 0);
		const grossProfit = totalSales - totalCost;

		const saleIds = sales.map(sale => sale._id);
		const saleItems = await SaleItem.find({ saleId: { $in: saleIds } });
		const totalItemsSold = saleItems.reduce((sum, item) => sum + (item.quantity || 0), 0);
		
		const uniqueProductIds = [...new Set(saleItems.map(item => item.productId.toString()))];
		const products = await Product.find({ _id: { $in: uniqueProductIds } }).lean();
		const productMap = new Map(products.map((p: any) => [p._id.toString(), p]));
		
		let totalSalesPercentage = 0;
		let totalCostPercentage = 0;
		let grossProfitPercentage = 0;

		if (startDate && endDate) {
			const start = new Date(startDate);
			const end = new Date(endDate);
			const duration = end.getTime() - start.getTime();
			
			const previousStart = new Date(start.getTime() - duration);
			const previousEnd = new Date(start.getTime());

			const previousSales = await Sale.find({
				status: "COMPLETED",
				isDeleted: { $ne: true },
				createdAt: {
					$gte: previousStart,
					$lt: previousEnd,
				},
			}).lean();

			const previousTotalSales = previousSales.reduce((sum, sale: any) => sum + (sale.totalAmount || 0), 0);
			const previousTotalCost = previousSales.reduce((sum, sale: any) => sum + (sale.totalCost || 0), 0);
			const previousGrossProfit = previousTotalSales - previousTotalCost;

			if (previousTotalSales > 0) {
				totalSalesPercentage = ((totalSales - previousTotalSales) / previousTotalSales) * 100;
				totalCostPercentage = ((totalCost - previousTotalCost) / previousTotalCost) * 100;
				grossProfitPercentage = ((grossProfit - previousGrossProfit) / previousGrossProfit) * 100;
			}
		}

		const topSellingProducts = saleItems.reduce((acc: any, item) => {
			const productId = item.productId.toString();
			if (!acc[productId]) {
				acc[productId] = { productId, quantity: 0 };
			}
			acc[productId].quantity += item.quantity || 0;
			return acc;
		}, {});

		const topProducts = Object.values(topSellingProducts)
			.sort((a: any, b: any) => b.quantity - a.quantity)
			.slice(0, 5)
			.map((item: any) => {
				const product = productMap.get(item.productId);
				return {
					product,
					quantitySold: item.quantity,
				};
			});

		return {
			totalSales,
			totalSalesPercentage,
			totalCost,
			totalCostPercentage,
			grossProfit,
			grossProfitPercentage,
			totalItemsSold,
			topSellingProducts: topProducts,
		};
	} catch (err) {
		console.error("Error generating sale report:", err);
		throw new Error("Failed to generate sale report");
	}
};
