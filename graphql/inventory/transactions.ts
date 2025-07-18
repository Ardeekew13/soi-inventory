import { gql } from "@apollo/client";

export const GET_SALES = gql`
	query Sales($search: String) {
		sales(search: $search) {
			createdAt
			id
			status
			orderNo
			costOfGoods
			grossProfit
			saleItems {
				priceAtSale
				product {
					id
					ingredientsUsed {
						id
						item {
							name
							id
							currentStock
							createdAt
							pricePerUnit
							unit
							updatedAt
						}
						itemId
						productId
						quantityUsed
					}
					name
					price
					updatedAt
					createdAt
				}
				productId
				quantity
			}
			totalAmount
		}
	}
`;

export const VOID_TRANSACTION = gql`
	mutation voidSale($id: UUID!, $voidReason: String!) {
		voidSale(id: $id, voidReason: $voidReason) {
			success
			message
		}
	}
`;
