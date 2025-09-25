// import { gql } from "@apollo/client";

// export const GET_SALES = gql`
// 	query Sales($search: String, $defaultTab: String) {
// 		sales(search: $search, defaultTab: $defaultTab) {
// 			id
// 			createdAt
// 			status
// 			orderNo
// 			costOfGoods
// 			grossProfit
// 			tableNo
// 			totalAmount
// 			serviceType
// 			paymentMethod
// 			saleItems {
// 				id
// 				productId
// 				quantity
// 				priceAtSale

// 				printed
// 				product {
// 					id
// 					name
// 					price
// 					createdAt
// 					updatedAt
// 					availableUnits
// 					ingredientsUsed {
// 						id
// 						itemId
// 						productId
// 						quantityUsed
// 						item {
// 							id
// 							name
// 							unit
// 							currentStock
// 							pricePerUnit
// 							createdAt
// 							updatedAt
// 						}
// 					}
// 				}
// 			}
// 		}
// 	}
// `;

// export const VOID_TRANSACTION = gql`
// 	mutation voidSale(
// 		$id: UUID!
// 		$voidReason: String!
// 		$voidedById: String!
// 		$passwordSupervisor: String!
// 	) {
// 		voidSale(
// 			id: $id
// 			voidReason: $voidReason
// 			voidedById: $voidedById
// 			passwordSupervisor: $passwordSupervisor
// 		) {
// 			success
// 			message
// 		}
// 	}
// `;
