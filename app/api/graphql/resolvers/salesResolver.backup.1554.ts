import { getSales, getParkedSales, getSaleReport } from "./queries/salesQueries";
import { parkSale } from "./mutations/parkSaleMutation";
import { checkoutSale } from "./mutations/checkoutSaleMutation";
import { deleteParkedSale } from "./mutations/deleteSaleMutation";
import { refundSale } from "./mutations/refundSaleMutation";
import { voidSale } from "./mutations/voidSaleMutation";
import { changeItem } from "./mutations/changeItemMutation";
import { sendToKitchen } from "./mutations/sendToKitchenMutation";

const salesResolver = {
	Query: {
		sales: getSales,
		parkedSales: getParkedSales,
		saleReport: getSaleReport,
	},
	Mutation: {
		parkSale,
		checkoutSale,
		deleteParkedSale,
		refundSale,
		voidSale,
		changeItem,
		sendToKitchen,
	},
};

export default salesResolver;
