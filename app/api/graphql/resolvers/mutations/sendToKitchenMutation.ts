import SaleItem from "../../models/SaleItem";
import { errorResponse, successResponse } from "../../utils/response";

export const sendToKitchen = async (_: unknown, { saleId, itemIds }: { saleId: string; itemIds: string[] }, context: any) => {
	if (!context.user) {
		throw new Error("Authentication required");
	}

	const userPermissions = context.user.permissions || {};
	const userRole = context.user.role;

	if (userRole !== 'SUPER_ADMIN' && !userPermissions.pointOfSale?.includes('view')) {
		throw new Error("Insufficient permissions to send items to kitchen");
	}

	try {
		const items = await SaleItem.find({ _id: { $in: itemIds }, saleId });
		
		for (const item of items) {
			await SaleItem.findByIdAndUpdate(item._id, {
				$set: { quantityPrinted: item.quantity }
			}, { new: true });
		}

		return successResponse("Items sent to kitchen");
	} catch (err) {
		console.error("Error sending to kitchen:", err);
		return errorResponse("Failed to send items to kitchen");
	}
};
