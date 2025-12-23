import { gql } from "@apollo/client";

export const GET_SALE_REPORTS = gql`
	query SaleReport($startDate: String, $endDate: String, $year: String) {
		saleReport(startDate: $startDate, endDate: $endDate, year: $year) {
			totalAmountSales
			totalCostOfGoods
			grossProfit
			totalItemsSold
			totalSalesPercentage
			totalCostPercentage
			grossProfitPercentage
			availableYears
			numberOfTransactions
			totalDiscounts
			totalNetSales
			topProductSold {
				name
				quantity
			}
			groupSales {
				month
				totalAmountSales
				totalCostOfGoods
				grossProfit
				totalItemsSold
			}
			salesByPaymentMethod {
				paymentMethod
				totalAmount
				count
			}
			totalRefunds
			numberOfRefunds
			salesByItem {
				itemName
				totalAmount
				quantity
			}
			salesByCashier {
				cashierName
				totalAmount
				count
			}
			salesByHour {
				hour
				totalAmount
				count
			}
		}
	}
`;
