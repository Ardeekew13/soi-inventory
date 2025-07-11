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
		}
	}
`;
