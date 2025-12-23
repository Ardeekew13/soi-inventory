import Sale from "../models/Sale";
import SaleItem from "../models/SaleItem";
import Product from "../models/Products";
import ProductIngredient from "../models/ProductIngredients";
import Item from "../models/Item";
import CashDrawer from "../models/CashDrawer";
import { errorResponse, successResponse } from "../utils/response";

// Helper function to generate unique order number
const generateOrderNo = async (prefix: string = "ORD"): Promise<string> => {
	const today = new Date();
	const datePrefix = today.toISOString().slice(0, 10).replace(/-/g, "");
	const count = await Sale.countDocuments({
		orderNo: { $regex: `^${prefix}-${datePrefix}` },
	});
	return `${prefix}-${datePrefix}-${String(count + 1).padStart(4, "0")}`;
};

// Helper function to calculate sale totals and deduct inventory
const processSaleItems = async (items: { productId: string; quantity: number }[]) => {
	let totalAmount = 0;
	let costOfGoods = 0;
	const saleItemsData = [];

	for (const item of items) {
		// Get product details
		const product = await Product.findById(item.productId);
		if (!product) {
			throw new Error(`Product with ID ${item.productId} not found`);
		}

		// Calculate totals
		const itemTotal = product.price * item.quantity;
		totalAmount += itemTotal;

		// Get product ingredients to calculate cost
		const ingredients = await ProductIngredient.find({ productId: item.productId });
		let itemCost = 0;

		// Deduct inventory for each ingredient (allow negative)
		for (const ingredient of ingredients) {
			const inventoryItem = await Item.findById(ingredient.itemId);
			if (!inventoryItem) {
				throw new Error(`Item with ID ${ingredient.itemId} not found`);
			}

			// Calculate cost
			const quantityNeeded = ingredient.quantityUsed * item.quantity;
			itemCost += inventoryItem.pricePerUnit * quantityNeeded;

			// Deduct from inventory (allow negative values)
			await Item.findByIdAndUpdate(ingredient.itemId, {
				$inc: { quantity: -quantityNeeded },
			});
		}

		costOfGoods += itemCost;

		saleItemsData.push({
			productId: item.productId,
			quantity: item.quantity,
			priceAtSale: product.price,
		});
	}

	const grossProfit = totalAmount - costOfGoods;

	return { totalAmount, costOfGoods, grossProfit, saleItemsData };
};

export const salesResolver = {
	Query: {
		sales: async (_: unknown, { search }: { search?: string }, context: any) => {
			// Check authentication
			if (!context.user) {
				throw new Error("Authentication required");
			}

			// Check permissions
			const userPermissions = context.user.permissions || {};
			const userRole = context.user.role;

			if (userRole !== 'SUPER_ADMIN' && !userPermissions.pointOfSale?.includes('view')) {
				throw new Error("Insufficient permissions to view sales");
			}

		try {
			const query: any = {};
			
			// Cashiers can only see their own sales
			if (userRole === 'CASHIER') {
				query.cashierId = context.user.id;
			}
			
			// Optional search filter
			if (search) {
				query.$or = [
					{ orderNo: { $regex: search, $options: "i" } },
					{ status: { $regex: search, $options: "i" } },
				];
			}

			const sales = await Sale.find(query)
				.sort({ createdAt: -1 });				// Manually populate saleItems for each sale
				const salesWithItems = await Promise.all(
					sales.map(async (sale) => {
						const saleItems = await SaleItem.find({ saleId: sale._id });
						
						// Manually populate each saleItem's product and its ingredients
						const populatedSaleItems = await Promise.all(
							saleItems.map(async (saleItem: any) => {
								const product = await Product.findById(saleItem.productId);
								if (!product) return null;
								
								// Fetch ingredients separately
								const ingredients = await ProductIngredient.find({ productId: product._id });
								
								// Populate items for each ingredient
								const populatedIngredients = await Promise.all(
									ingredients
										.filter((ing: any) => ing && ing._id) // Only include valid ingredients
										.map(async (ing: any) => {
											const item = await Item.findById(ing.itemId);
											return {
												_id: ing._id,
												productId: ing.productId,
												itemId: ing.itemId,
												quantityUsed: ing.quantityUsed,
												item: item ? {
													_id: item._id,
													id: item._id.toString(),
													name: item.name,
													unit: item.unit,
													pricePerUnit: item.pricePerUnit,
													currentStock: item.quantity,
													createdAt: item.createdAt,
													updatedAt: item.updatedAt,
												} : null,
											};
										})
								);
								
							return {
								_id: saleItem._id,
								productId: product._id.toString(),
								quantity: saleItem.quantity,
								priceAtSale: saleItem.priceAtSale,
								product: {
										_id: product._id,
										id: product._id.toString(),
										name: product.name,
										price: product.price,
										createdAt: product.createdAt,
										updatedAt: product.updatedAt,
										ingredientsUsed: populatedIngredients,
									},
								};
							})
						);

					const saleObj = sale.toObject();
					return {
						...saleObj,
						id: sale._id.toString(),
						saleItems: populatedSaleItems.filter(Boolean),
						createdAt: new Date(sale.createdAt).toISOString(),
						updatedAt: new Date(sale.updatedAt).toISOString(),
					};
				})
			);				return salesWithItems;
			} catch (err) {
				console.error("Error fetching sales:", err);
				throw new Error("Failed to fetch sales");
			}
		},
		parkedSales: async (_: unknown, args: any, context: any) => {
			// Check authentication
			if (!context.user) {
				throw new Error("Authentication required");
			}

			// Check permissions
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
			
			// Cashiers can only see their own parked sales
			if (userRole === 'CASHIER') {
				query.cashierId = context.user.id;
			}
			
			const sales = await Sale.find(query)
				.sort({ updatedAt: -1 })
				.populate({
					path: "saleItems",
					populate: {
						path: "productId",
						model: "Product",
					},
				});				return sales.map((sale) => {
					const saleObj = sale.toObject();
					return {
						...saleObj,
						createdAt: new Date(sale.createdAt).toISOString(),
						updatedAt: new Date(sale.updatedAt).toISOString(),
					};
				});
			} catch (err) {
				console.error("Error fetching parked sales:", err);
				throw new Error("Failed to fetch parked sales");
			}
		},
		saleReport: async (
			_: unknown,
			{ startDate, endDate, year }: { startDate?: string; endDate?: string; year?: string },
			context: any
		) => {
			// Check authentication
			if (!context.user) {
				throw new Error("Authentication required");
			}

			// Check permissions
			const userPermissions = context.user.permissions || {};
			const userRole = context.user.role;

			// Debug logging
			console.log('=== SALE REPORT PERMISSION CHECK ===');
			console.log('User:', context.user.username);
			console.log('Role:', userRole);
			console.log('Permissions:', JSON.stringify(userPermissions, null, 2));
			console.log('Dashboard permissions:', userPermissions.dashboard);
			console.log('Has dashboard view?:', userPermissions.dashboard?.includes('view'));

			if (userRole !== 'SUPER_ADMIN' && !userPermissions.dashboard?.includes('view')) {
				console.log('❌ Permission denied - User does not have dashboard view permission');
				throw new Error("Insufficient permissions to view sale reports");
			}

			console.log('✅ Permission granted');

			try {
				// Build date filter - Only include COMPLETED sales (exclude VOID, PARKED)
				const dateFilter: any = { status: "COMPLETED" };
				
				if (startDate && endDate) {
					dateFilter.createdAt = {
						$gte: new Date(startDate),
						$lte: new Date(endDate),
					};
				}

			// Get sales for the specified period (COMPLETED only)
			const sales = await Sale.find(dateFilter);
			
			// Calculate current period totals
			const totalAmountSales = sales.reduce((sum, sale) => sum + (sale.totalAmount || 0), 0);
			const totalCostOfGoods = sales.reduce((sum, sale) => sum + (sale.costOfGoods || 0), 0);
			const grossProfit = sales.reduce((sum, sale) => sum + (sale.grossProfit || 0), 0);
			const numberOfTransactions = sales.length;
			const totalDiscounts = 0; // Will be implemented when discount feature is added
			const totalNetSales = totalAmountSales - totalDiscounts;
			
			// Calculate total items sold
			const saleIds = sales.map(sale => sale._id);
			const saleItems = await SaleItem.find({ saleId: { $in: saleIds } });
			const totalItemsSold = saleItems.reduce((sum, item) => sum + (item.quantity || 0), 0);				// Calculate previous period for percentage comparison
				let totalSalesPercentage = 0;
				let totalCostPercentage = 0;
				let grossProfitPercentage = 0;

				if (startDate && endDate) {
					const start = new Date(startDate);
					const end = new Date(endDate);
					const duration = end.getTime() - start.getTime();
					
					const prevStartDate = new Date(start.getTime() - duration);
					const prevEndDate = new Date(start.getTime());

					const prevSales = await Sale.find({
						status: "COMPLETED",
						createdAt: {
							$gte: prevStartDate,
							$lte: prevEndDate,
						},
					});

					const prevTotalAmount = prevSales.reduce((sum, sale) => sum + (sale.totalAmount || 0), 0);
					const prevTotalCost = prevSales.reduce((sum, sale) => sum + (sale.costOfGoods || 0), 0);
					const prevGrossProfit = prevSales.reduce((sum, sale) => sum + (sale.grossProfit || 0), 0);

					// Calculate percentage changes
					totalSalesPercentage = prevTotalAmount > 0 
						? ((totalAmountSales - prevTotalAmount) / prevTotalAmount) * 100 
						: 0;
					totalCostPercentage = prevTotalCost > 0 
						? ((totalCostOfGoods - prevTotalCost) / prevTotalCost) * 100 
						: 0;
					grossProfitPercentage = prevGrossProfit > 0 
						? ((grossProfit - prevGrossProfit) / prevGrossProfit) * 100 
						: 0;
				}

				// Get all available years from sales
				const allSales = await Sale.find({ status: "COMPLETED" }).select('createdAt');
				const years = [...new Set(allSales.map(sale => new Date(sale.createdAt).getFullYear()))];
				const availableYears = years.sort((a, b) => b - a);

				// Get top products sold
				const productSales = new Map<string, { name: string; quantity: number }>();
				
				for (const item of saleItems) {
					const product = await Product.findById(item.productId);
					if (product) {
						const existing = productSales.get(item.productId.toString());
						if (existing) {
							existing.quantity += item.quantity;
						} else {
							productSales.set(item.productId.toString(), {
								name: product.name,
								quantity: item.quantity,
							});
						}
					}
				}

				const topProductSold = Array.from(productSales.values())
					.sort((a, b) => b.quantity - a.quantity)
					.slice(0, 10);

				// Get monthly sales data for the year
				const selectedYear = year ? parseInt(year) : new Date().getFullYear();
				const groupSales = [];

				for (let month = 0; month < 12; month++) {
					const monthStart = new Date(selectedYear, month, 1);
					const monthEnd = new Date(selectedYear, month + 1, 0, 23, 59, 59);

					const monthSales = await Sale.find({
						status: "COMPLETED",
						createdAt: {
							$gte: monthStart,
							$lte: monthEnd,
						},
					});

					const monthTotalAmount = monthSales.reduce((sum, sale) => sum + (sale.totalAmount || 0), 0);
					const monthTotalCost = monthSales.reduce((sum, sale) => sum + (sale.costOfGoods || 0), 0);
					const monthGrossProfit = monthSales.reduce((sum, sale) => sum + (sale.grossProfit || 0), 0);

					const monthSaleIds = monthSales.map(sale => sale._id);
					const monthSaleItems = await SaleItem.find({ saleId: { $in: monthSaleIds } });
					const monthTotalItems = monthSaleItems.reduce((sum, item) => sum + (item.quantity || 0), 0);

					const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
					
					groupSales.push({
						month: monthNames[month],
						totalAmountSales: monthTotalAmount,
						totalCostOfGoods: monthTotalCost,
						grossProfit: monthGrossProfit,
						totalItemsSold: monthTotalItems,
					});
				}

				// Sales by payment method (from cash drawer transactions)
				const cashDrawerFilter: any = { type: "SALE" };
				if (dateFilter.createdAt) {
					cashDrawerFilter.createdAt = dateFilter.createdAt;
				}
				
				const cashDrawerTxns = await require('../models/CashDrawer').default.find(cashDrawerFilter);

				const paymentMethodStats = cashDrawerTxns.reduce((acc: any, txn: any) => {
					const method = txn.paymentMethod || "CASH";
					if (!acc[method]) {
						acc[method] = { totalAmount: 0, count: 0 };
					}
					acc[method].totalAmount += txn.amount || 0;
					acc[method].count += 1;
					return acc;
				}, {});

				const salesByPaymentMethod = Object.entries(paymentMethodStats).map(([method, stats]: [string, any]) => ({
					paymentMethod: method,
					totalAmount: stats.totalAmount,
					count: stats.count,
				}));

			// Refunds (get sales with REFUNDED status)
			const refundFilter: any = { 
				status: "REFUNDED"
			};
			if (dateFilter.createdAt) {
				refundFilter.createdAt = dateFilter.createdAt;
			}
			
			const refundedSales = await Sale.find(refundFilter);
			const totalRefunds = refundedSales.reduce((sum, sale) => sum + (sale.totalAmount || 0), 0);
			const numberOfRefunds = refundedSales.length;				// Sales by item (top selling items with revenue)
				const itemStats = new Map<string, { itemName: string; totalAmount: number; quantity: number }>();
				for (const item of saleItems) {
					const product = await Product.findById(item.productId);
					if (product) {
						const existing = itemStats.get(item.productId.toString());
						if (existing) {
							existing.quantity += item.quantity;
							existing.totalAmount += item.priceAtSale * item.quantity;
						} else {
							itemStats.set(item.productId.toString(), {
								itemName: product.name,
								quantity: item.quantity,
								totalAmount: item.priceAtSale * item.quantity,
							});
						}
					}
				}

				const salesByItem = Array.from(itemStats.values())
					.sort((a, b) => b.totalAmount - a.totalAmount)
					.slice(0, 10);

				// Sales by cashier
				const cashierStats: any = {};
				for (const sale of sales) {
					const cashierName = sale.cashierName || "Unknown";
					if (!cashierStats[cashierName]) {
						cashierStats[cashierName] = { totalAmount: 0, count: 0 };
					}
					cashierStats[cashierName].totalAmount += sale.totalAmount || 0;
					cashierStats[cashierName].count += 1;
				}

				const salesByCashier = Object.entries(cashierStats).map(([cashierName, stats]: [string, any]) => ({
					cashierName,
					totalAmount: stats.totalAmount,
					count: stats.count,
				}));

				// Sales by hour (hourly breakdown)
				const hourStats: any = {};
				for (const sale of sales) {
					const hour = new Date(sale.createdAt).getHours();
					const hourLabel = `${hour.toString().padStart(2, '0')}:00`;
					if (!hourStats[hourLabel]) {
						hourStats[hourLabel] = { totalAmount: 0, count: 0 };
					}
					hourStats[hourLabel].totalAmount += sale.totalAmount || 0;
					hourStats[hourLabel].count += 1;
				}

				// Fill in missing hours with zero values
				const salesByHour = [];
				for (let h = 0; h < 24; h++) {
					const hourLabel = `${h.toString().padStart(2, '0')}:00`;
					salesByHour.push({
						hour: hourLabel,
						totalAmount: hourStats[hourLabel]?.totalAmount || 0,
						count: hourStats[hourLabel]?.count || 0,
					});
				}

				return {
					grossProfit,
					totalCostOfGoods,
					totalAmountSales,
					totalItemsSold,
					totalSalesPercentage,
					totalCostPercentage,
					grossProfitPercentage,
					availableYears,
					topProductSold,
					groupSales,
					salesByPaymentMethod,
					totalRefunds,
					numberOfRefunds,
					salesByItem,
					salesByCashier,
					salesByHour,
					numberOfTransactions,
					totalDiscounts,
					totalNetSales,
				};
			} catch (err) {
				console.error("Error fetching sale report:", err);
				throw new Error("Failed to fetch sale report");
			}
		},
	},
	SaleItem: {
		product: async (parent: any) => {
			// If product is already populated, return it
			if (parent.productId && typeof parent.productId === 'object') {
				return parent.productId;
			}
			
			// Try to find the product, return null if deleted
			try {
				const product = await Product.findById(parent.productId);
				return product || null;
			} catch (error) {
				console.error(`Error finding product ${parent.productId}:`, error);
				return null;
			}
		},
		quantityPrinted: (parent: any) => {
			return parent.quantityPrinted ?? 0;
		},
	},
	Mutation: {
		// Park a sale (deduct inventory immediately, can go negative)
		parkSale: async (
			_: unknown,
			{
				id,
				items,
				orderType,
				tableNumber,
			}: {
				id?: string;
				items: { productId: string; quantity: number }[];
				orderType: string;
				tableNumber?: string;
			},
			context: any
		) => {
			// Check authentication
			if (!context.user) {
				throw new Error("Authentication required");
			}

			// Check permissions
			const userPermissions = context.user.permissions || {};
			const userRole = context.user.role;

			if (userRole !== 'SUPER_ADMIN' && !userPermissions.pointOfSale?.includes('addEdit')) {
				throw new Error("Insufficient permissions to park sales");
			}

			try {
				let sale;
				let orderNo;

				if (id) {

					sale = await Sale.findById(id);
					if (!sale) {
						return errorResponse("Parked sale not found");
					}
					orderNo = sale.orderNo;

				} else {
					// Generate orderNo for new parked sale
					orderNo = await generateOrderNo("PARK");
					
					sale = await Sale.create({
						totalAmount: 0,
						costOfGoods: 0,
						grossProfit: 0,
						status: "PARKED",
						orderNo,
						orderType,
						tableNumber: orderType === "DINE_IN" ? tableNumber : null,
						cashierId: context.user.id,
						cashierName: context.user.username,
					});
				}

				// Calculate totals without deducting inventory
				let totalAmount = 0;
				let costOfGoods = 0;
				const saleItemsData = [];

				// Get existing sale items if updating
				const existingItems = id ? await SaleItem.find({ saleId: id }) : [];
				const existingItemsMap = new Map(
					existingItems.map(item => [item.productId.toString(), item])
				);

				// If updating, restore inventory from old items first
				if (id) {
					for (const existingItem of existingItems) {
						const ingredients = await ProductIngredient.find({ productId: existingItem.productId });
						
						for (const ingredient of ingredients) {
							const quantityToRestore = ingredient.quantityUsed * existingItem.quantity;
							// Restore inventory (add back)
							await Item.findByIdAndUpdate(ingredient.itemId, {
								$inc: { quantity: quantityToRestore },
							});
						}
					}
				}

				for (const item of items) {
					const product = await Product.findById(item.productId);
					if (!product) {
						throw new Error(`Product with ID ${item.productId} not found`);
					}

					totalAmount += product.price * item.quantity;

					// Calculate cost of goods and deduct inventory
					const ingredients = await ProductIngredient.find({ productId: item.productId });
					let itemCost = 0;

					for (const ingredient of ingredients) {
						const inventoryItem = await Item.findById(ingredient.itemId);
						if (inventoryItem) {
							const quantityNeeded = ingredient.quantityUsed * item.quantity;
							itemCost += inventoryItem.pricePerUnit * quantityNeeded;

							// Deduct from inventory (allow negative values)
							await Item.findByIdAndUpdate(ingredient.itemId, {
								$inc: { quantity: -quantityNeeded },
							});
						}
					}

					costOfGoods += itemCost;

					// Check if this item already exists
					const existingItem = existingItemsMap.get(item.productId);
					
					// Preserve quantityPrinted from existing item
					const quantityPrinted = existingItem?.quantityPrinted || 0;

					saleItemsData.push({
						saleId: sale._id,
						productId: item.productId,
						quantity: item.quantity,
						priceAtSale: product.price,
						quantityPrinted,
					});
				}

				const grossProfit = totalAmount - costOfGoods;

				// Delete old sale items if updating
				if (id) {
					await SaleItem.deleteMany({ saleId: id });
				}

				// Create sale items
				await SaleItem.insertMany(saleItemsData);

				// Update sale totals
				await Sale.findByIdAndUpdate(sale._id, {
					totalAmount,
					costOfGoods,
					grossProfit,
					orderType,
					tableNumber: orderType === "DINE_IN" ? tableNumber : null,
					updatedAt: new Date(),
				});

				return {
					success: true,
					message: id ? "Order updated in park" : "Order parked successfully",
					data: {
						_id: sale._id,
						totalAmount,
						grossProfit,
						orderNo,
						status: "PARKED",
					},
				};
			} catch (err: any) {
				console.error("Error parking sale:", err);
				return errorResponse(err.message || "Failed to park sale");
			}
		},

		// Checkout a sale (deduct inventory and complete)
		checkoutSale: async (
			_: unknown,
			{
				id,
				items,
				orderType,
				tableNumber,
				paymentMethod = "CASH",
			}: {
				id?: string;
				items: { productId: string; quantity: number }[];
				orderType: string;
				tableNumber?: string;
				paymentMethod?: string;
			},
			context: any
		) => {
			// Check authentication
			if (!context.user) {
				throw new Error("Authentication required");
			}

			// Check permissions
			const userPermissions = context.user.permissions || {};
			const userRole = context.user.role;

			if (userRole !== 'SUPER_ADMIN' && !userPermissions.pointOfSale?.includes('addEdit')) {
				throw new Error("Insufficient permissions to checkout sales");
			}

			try {
				let totalAmount = 0;
				let costOfGoods = 0;
				let saleItemsData;
				
				if (id) {
					// Converting parked sale to completed
					// Inventory was already deducted during parking, so just recalculate totals
					const sale = await Sale.findById(id);
					if (!sale) {
						return errorResponse("Parked sale not found");
					}

					// Recalculate totals without deducting inventory again
					const processedData = [];
					for (const item of items) {
						const product = await Product.findById(item.productId);
						if (!product) {
							throw new Error(`Product with ID ${item.productId} not found`);
						}

						totalAmount += product.price * item.quantity;

						const ingredients = await ProductIngredient.find({ productId: item.productId });
						let itemCost = 0;

						for (const ingredient of ingredients) {
							const inventoryItem = await Item.findById(ingredient.itemId);
							if (inventoryItem) {
								const quantityNeeded = ingredient.quantityUsed * item.quantity;
								itemCost += inventoryItem.pricePerUnit * quantityNeeded;
							}
						}

						costOfGoods += itemCost;

						processedData.push({
							productId: item.productId,
							quantity: item.quantity,
							priceAtSale: product.price,
						});
					}

					saleItemsData = processedData;
				} else {
					// New direct checkout - deduct inventory
					const processed = await processSaleItems(items);
					totalAmount = processed.totalAmount;
					costOfGoods = processed.costOfGoods;
					saleItemsData = processed.saleItemsData;
				}

				const grossProfit = totalAmount - costOfGoods;

				let orderNo;
				let sale;

				if (id) {
					// Converting parked sale to completed - keep existing orderNo
					sale = await Sale.findById(id);
					if (!sale) {
						return errorResponse("Parked sale not found");
					}

					// Keep the existing orderNo (PARK-XXX becomes completed with same number)
					orderNo = sale.orderNo || await generateOrderNo();

					// Delete old sale items
					await SaleItem.deleteMany({ saleId: id });

					// Update sale
					await Sale.findByIdAndUpdate(id, {
						totalAmount,
						costOfGoods,
						grossProfit,
						status: "COMPLETED",
						orderNo,
						orderType,
						tableNumber: orderType === "DINE_IN" ? tableNumber : null,
					});

					sale = await Sale.findById(id);
				} else {
					// Create new completed sale
					orderNo = await generateOrderNo();
					
					sale = await Sale.create({
						totalAmount,
						costOfGoods,
						grossProfit,
						status: "COMPLETED",
						orderNo,
						orderType,
						tableNumber: orderType === "DINE_IN" ? tableNumber : null,
						cashierId: context.user.id,
						cashierName: context.user.username,
					});
				}

				// Create sale items with sale ID
				const itemsWithSaleId = saleItemsData.map((item) => ({
					...item,
					saleId: sale!._id,
				}));
				await SaleItem.insertMany(itemsWithSaleId);

				// Add sale amount to cash drawer if one is open
				const openDrawer = await CashDrawer.findOne({ status: "OPEN" }).sort({ openedAt: -1 });
				if (openDrawer) {
					openDrawer.transactions.push({
						type: "SALE",
						amount: totalAmount,
						description: `Sale ${orderNo}`,
						saleId: sale!._id,
						paymentMethod: paymentMethod,
					} as any);
					await openDrawer.save();
				}

				return {
					success: true,
					message: "Sale completed successfully",
					data: {
						_id: sale!._id,
						totalAmount,
						grossProfit,
						orderNo,
						status: "COMPLETED",
					},
				};
			} catch (err: any) {
				console.error("Error checking out sale:", err);
				return errorResponse(err.message || "Failed to checkout sale");
			}
		},

		// Delete/Void parked sale (just marks as void, doesn't return inventory since it's still parked)
		deleteParkedSale: async (_: unknown, { id }: { id: string }, context: any) => {
			// Check authentication
			if (!context.user) {
				throw new Error("Authentication required");
			}

			// Check permissions
			const userPermissions = context.user.permissions || {};
			const userRole = context.user.role;

			if (userRole !== 'SUPER_ADMIN' && !userPermissions.pointOfSale?.includes('void')) {
				throw new Error("Insufficient permissions to void parked sales");
			}

			try {
				const sale = await Sale.findById(id);
				if (!sale) {
					return errorResponse("Sale not found");
				}

				if (sale.status !== "PARKED") {
					return errorResponse("Can only void parked sales");
				}

				// Return ingredients to inventory when voiding parked sale
				console.log("Voiding parked sale - returning ingredients to inventory");
				const saleItems = await SaleItem.find({ saleId: id });

				for (const saleItem of saleItems) {
					const product = await Product.findById(saleItem.productId);
					if (!product) continue;

					const quantitySold = saleItem.quantity;
					const ingredients = await ProductIngredient.find({ productId: product._id });

					for (const ingredient of ingredients) {
						const quantityToReturn = ingredient.quantityUsed * quantitySold;
						
						await Item.findByIdAndUpdate(ingredient.itemId, {
							$inc: { quantity: quantityToReturn }
						});

						console.log(`Returned ${quantityToReturn} units to inventory (parked sale void)`);
					}
				}

				// Mark as voided instead of deleting
				await Sale.findByIdAndUpdate(id, {
					status: "VOID",
					isDeleted: true,
				});

				return successResponse("Parked sale voided and ingredients returned to inventory", null);
			} catch (err) {
				console.error("Error voiding parked sale:", err);
				return errorResponse("Failed to void parked sale");
			}
		},

		// Refund completed sale (only for COMPLETED sales, returns ingredients to inventory)
		refundSale: async (_: unknown, { id, refundReason }: { id: string; refundReason: string }, context: any) => {
			// Check authentication
			if (!context.user) {
				throw new Error("Authentication required");
			}

			// Check permissions
			const userPermissions = context.user.permissions || {};
			const userRole = context.user.role;

			if (userRole !== 'SUPER_ADMIN' && !userPermissions.transaction?.includes('refund')) {
				throw new Error("Insufficient permissions to refund sales");
			}

			try {
				console.log("Refunding sale - ID:", JSON.stringify(id), "Reason:", refundReason);
				
				const sale = await Sale.findById(id);

				if (!sale) {
					console.error("Sale not found:", id);
					return errorResponse("Sale not found");
				}

				if (sale.status !== "COMPLETED") {
					console.error("Can only refund completed sales, current status:", sale.status);
					return errorResponse("Can only refund completed sales");
				}

				if (sale.isDeleted) {
					console.error("Sale already refunded or voided:", id);
					return errorResponse("Sale is already refunded or voided");
				}

				console.log("Returning ingredients to inventory for refund");
				
				const saleItems = await SaleItem.find({ saleId: id });

				for (const saleItem of saleItems) {
					const product = await Product.findById(saleItem.productId);
					if (!product) continue;

					const quantitySold = saleItem.quantity;
					const ingredients = await ProductIngredient.find({ productId: product._id });

					for (const ingredient of ingredients) {
						const quantityToReturn = ingredient.quantityUsed * quantitySold;
						
						await Item.findByIdAndUpdate(ingredient.itemId, {
							$inc: { quantity: quantityToReturn }
						});

						const item = await Item.findById(ingredient.itemId);
						console.log(`Returned ${quantityToReturn} units of ${item?.name || 'unknown'} to inventory`);
					}
				}

				// Remove sale amount from cash drawer
				const openDrawer = await CashDrawer.findOne({ status: "OPEN" }).sort({ openedAt: -1 });
				if (openDrawer) {
					openDrawer.transactions.push({
						type: "REFUND",
						amount: -sale.totalAmount,
						description: `Refund for Sale ${sale.orderNo}`,
						saleId: sale._id,
						paymentMethod: "CASH",
					} as any);
					await openDrawer.save();
				}

			console.log("Marking sale as REFUNDED with refund reason");
			await Sale.findByIdAndUpdate(id, {
				status: "REFUNDED",
				voidReason: `REFUND: ${refundReason}`,
				isDeleted: true,
			});				console.log("Sale refunded successfully, ingredients returned to inventory");
				return successResponse("Sale refunded successfully and ingredients returned to inventory", null);
			} catch (err: any) {
				console.error("Error refunding sale:", err);
				return errorResponse(err.message || "Failed to refund sale");
			}
		},

		// Change item in a COMPLETED sale (swap one item for another)
		changeItem: async (
			_: unknown,
			{ saleId, oldSaleItemId, newProductId, newQuantity, reason }: { 
				saleId: string; 
				oldSaleItemId: string; 
				newProductId: string; 
				newQuantity: number;
				reason: string;
			},
			context: any
		) => {
			// Check authentication
			if (!context.user) {
				throw new Error("Authentication required");
			}

			// Check permissions
			const userPermissions = context.user.permissions || {};
			const userRole = context.user.role;

			if (userRole !== 'SUPER_ADMIN' && !userPermissions.transaction?.includes('changeItem')) {
				throw new Error("Insufficient permissions to change sale items");
			}

			try {
				console.log("Changing item - Sale ID:", saleId, "Old Item:", oldSaleItemId, "New Product:", newProductId);
				
				const sale = await Sale.findById(saleId);

				if (!sale) {
					return errorResponse("Sale not found");
				}

				if (sale.status !== "COMPLETED") {
					return errorResponse("Can only change items in completed sales");
				}

				// Get the old sale item
				const oldSaleItem = await SaleItem.findById(oldSaleItemId);
				if (!oldSaleItem) {
					return errorResponse("Sale item not found");
				}

				const oldProduct = await Product.findById(oldSaleItem.productId);
				if (!oldProduct) {
					return errorResponse("Old product not found");
				}

				// Return old product ingredients to inventory
				console.log("Returning old product ingredients to inventory");
				const oldIngredients = await ProductIngredient.find({ productId: oldProduct._id });
				for (const ingredient of oldIngredients) {
					const quantityToReturn = ingredient.quantityUsed * oldSaleItem.quantity;
					await Item.findByIdAndUpdate(ingredient.itemId, {
						$inc: { quantity: quantityToReturn }
					});
					console.log(`Returned ${quantityToReturn} units (old item)`);
				}

				// Get new product
				const newProduct = await Product.findById(newProductId);
				if (!newProduct) {
					return errorResponse("New product not found");
				}

				// Deduct new product ingredients from inventory
				console.log("Deducting new product ingredients from inventory");
				const newIngredients = await ProductIngredient.find({ productId: newProduct._id });
				let newItemCost = 0;
				
				for (const ingredient of newIngredients) {
					const inventoryItem = await Item.findById(ingredient.itemId);
					if (inventoryItem) {
						const quantityNeeded = ingredient.quantityUsed * newQuantity;
						newItemCost += inventoryItem.pricePerUnit * quantityNeeded;

						await Item.findByIdAndUpdate(ingredient.itemId, {
							$inc: { quantity: -quantityNeeded }
						});
						console.log(`Deducted ${quantityNeeded} units (new item)`);
					}
				}

				// Update the sale item
				await SaleItem.findByIdAndUpdate(oldSaleItemId, {
					productId: newProductId,
					quantity: newQuantity,
					priceAtSale: newProduct.price,
				});

				// Recalculate sale totals
				const allSaleItems = await SaleItem.find({ saleId });
				let totalAmount = 0;
				let costOfGoods = 0;

				for (const item of allSaleItems) {
					const product = await Product.findById(item.productId);
					if (product) {
						totalAmount += product.price * item.quantity;
						
						const ingredients = await ProductIngredient.find({ productId: product._id });
						for (const ingredient of ingredients) {
							const invItem = await Item.findById(ingredient.itemId);
							if (invItem) {
								costOfGoods += invItem.pricePerUnit * ingredient.quantityUsed * item.quantity;
							}
						}
					}
				}

			const grossProfit = totalAmount - costOfGoods;

			// Update sale totals and status
			await Sale.findByIdAndUpdate(saleId, {
				totalAmount,
				costOfGoods,
				grossProfit,
				status: "ITEM_CHANGED",
				voidReason: `ITEM CHANGED: ${reason} (${oldProduct.name} → ${newProduct.name})`,
			});				console.log("Item changed successfully");
				return successResponse(
					`Item changed from ${oldProduct.name} to ${newProduct.name}. Inventory updated.`,
					null
				);
			} catch (err: any) {
				console.error("Error changing item:", err);
				return errorResponse(err.message || "Failed to change item");
			}
		},

		// Void completed sale (DEPRECATED - use refundSale instead for completed sales)
		// This is kept for backward compatibility but will show a warning
		voidSale: async (_: unknown, { id, voidReason }: { id: string; voidReason: string }, context: any) => {
			// Check authentication
			if (!context.user) {
				throw new Error("Authentication required");
			}

			// Check permissions
			const userPermissions = context.user.permissions || {};
			const userRole = context.user.role;

			if (userRole !== 'SUPER_ADMIN' && !userPermissions.transaction?.includes('void') && !userPermissions.transaction?.includes('refund')) {
				throw new Error("Insufficient permissions to void sales");
			}

			try {
				console.log("Voiding sale - ID:", JSON.stringify(id), "Reason:", voidReason);
				
				if (!id) {
					console.error("Invalid sale ID - no ID provided:", id);
					return errorResponse("Invalid sale ID");
				}

				const sale = await Sale.findById(id);

				if (!sale) {
					console.error("Sale not found:", id);
					return errorResponse("Sale not found");
				}

				if (sale.status === "VOID") {
					console.error("Sale already voided:", id);
					return errorResponse("Sale is already voided");
				}

				// Return ingredients to inventory
				console.log("Returning ingredients to inventory for voided sale");
				
				const saleItems = await SaleItem.find({ saleId: id });

				for (const saleItem of saleItems) {
					const product = await Product.findById(saleItem.productId);
					if (!product) continue;

					const quantitySold = saleItem.quantity;
					const ingredients = await ProductIngredient.find({ productId: product._id });

					for (const ingredient of ingredients) {
						const quantityToReturn = ingredient.quantityUsed * quantitySold;
						
						await Item.findByIdAndUpdate(ingredient.itemId, {
							$inc: { quantity: quantityToReturn }
						});

						const item = await Item.findById(ingredient.itemId);
						console.log(`Returned ${quantityToReturn} units of ${item?.name || 'unknown'} to inventory`);
					}
				}

				// If sale was completed (paid), deduct from cash drawer
				if (sale.status === "COMPLETED") {
					console.log("Voiding completed sale - deducting from cash drawer");
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
						console.log(`Deducted ${sale.totalAmount} from cash drawer`);
					}
				}

				// Mark sale as voided
				await Sale.findByIdAndUpdate(id, {
					status: "VOID",
					voidReason,
					isDeleted: true,
				});

				console.log("Sale voided successfully, ingredients returned to inventory");
				return successResponse("Sale voided successfully and ingredients returned to inventory", null);
			} catch (err: any) {
				console.error("Error voiding sale:", err);
				return errorResponse(err.message || "Failed to void sale");
			}
		},

		// Send items to kitchen (mark as printed)
		sendToKitchen: async (_: unknown, { saleId, itemIds }: { saleId: string; itemIds: string[] }, context: any) => {
			// Check authentication
			if (!context.user) {
				throw new Error("Authentication required");
			}

			// Check permissions
			const userPermissions = context.user.permissions || {};
			const userRole = context.user.role;

			if (userRole !== 'SUPER_ADMIN' && !userPermissions.pointOfSale?.includes('view')) {
				throw new Error("Insufficient permissions to send items to kitchen");
			}

			try {
				// Get the items to update their quantityPrinted
				const items = await SaleItem.find({ _id: { $in: itemIds }, saleId });
				
				// Update each item to set quantityPrinted = quantity
				for (const item of items) {
					await SaleItem.findByIdAndUpdate(item._id, {
						$set: { 
							quantityPrinted: item.quantity 
						}
					}, { new: true });
				}

				return successResponse("Items sent to kitchen", null);
			} catch (err) {
				console.error("Error sending to kitchen:", err);
				return errorResponse("Failed to send items to kitchen");
			}
		},

		// Keep recordSale for backward compatibility
		recordSale: async (
			_: unknown,
			{ items }: { items: { productId: string; quantity: number }[] },
			context: any
		) => {
			// Check authentication
			if (!context.user) {
				throw new Error("Authentication required");
			}

			// Check permissions
			const userPermissions = context.user.permissions || {};
			const userRole = context.user.role;

			if (userRole !== 'SUPER_ADMIN' && !userPermissions.pointOfSale?.includes('addEdit')) {
				throw new Error("Insufficient permissions to record sales");
			}

			try {
				const { totalAmount, costOfGoods, grossProfit, saleItemsData } =
					await processSaleItems(items);

				const orderNo = await generateOrderNo();

				const sale = await Sale.create({
					totalAmount,
					costOfGoods,
					grossProfit,
					status: "COMPLETED",
					orderNo,
				});

				const itemsWithSaleId = saleItemsData.map((item) => ({
					...item,
					saleId: sale._id,
				}));
				await SaleItem.insertMany(itemsWithSaleId);

				return {
					success: true,
					message: "Sale recorded successfully",
					data: {
						_id: sale._id,
						totalAmount,
						grossProfit,
						orderNo,
						status: "COMPLETED",
					},
				};
			} catch (err: any) {
				console.error("Error recording sale:", err);
				return errorResponse(err.message || "Failed to record sale");
			}
		},
	},
};

// Helper function to calculate item cost
async function calculateItemCost(productId: string, quantity: number): Promise<number> {
	const ingredients = await ProductIngredient.find({ productId });
	let totalCost = 0;

	for (const ingredient of ingredients) {
		const inventoryItem = await Item.findById(ingredient.itemId);
		if (inventoryItem) {
			const quantityNeeded = ingredient.quantityUsed * quantity;
			totalCost += inventoryItem.pricePerUnit * quantityNeeded;
		}
	}

	return totalCost;
}
