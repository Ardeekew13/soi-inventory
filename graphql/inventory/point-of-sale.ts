import { gql } from "@apollo/client";

export const PARK_SALE = gql`
	mutation ParkSale($id: ID, $items: [SaleItemInput!]!, $orderType: OrderType!, $tableNumber: String) {
		parkSale(id: $id, items: $items, orderType: $orderType, tableNumber: $tableNumber) {
			success
			message
			data {
				_id
				totalAmount
				grossProfit
				orderNo
				status
			}
		}
	}
`;

export const CHECKOUT_SALE = gql`
	mutation CheckoutSale($id: ID, $items: [SaleItemInput!]!, $orderType: OrderType!, $tableNumber: String, $paymentMethod: String) {
		checkoutSale(id: $id, items: $items, orderType: $orderType, tableNumber: $tableNumber, paymentMethod: $paymentMethod) {
			success
			message
			data {
				_id
				totalAmount
				grossProfit
				orderNo
				status
			}
		}
	}
`;

export const SEND_TO_KITCHEN = gql`
	mutation SendToKitchen($saleId: ID!, $itemIds: [ID!]!) {
		sendToKitchen(saleId: $saleId, itemIds: $itemIds) {
			success
			message
		}
	}
`;

export const GET_PARKED_SALES = gql`
	query ParkedSales {
		parkedSales {
			_id
			totalAmount
			orderNo
			orderType
			tableNumber
			createdAt
			updatedAt
			saleItems {
				_id
				quantity
				priceAtSale
				quantityPrinted
				product {
					_id
					name
					price
					createdAt
					updatedAt
					ingredientsUsed {
						_id
						itemId
						productId
						quantityUsed
						item {
							_id
							name
						}
					}
				}
			}
		}
	}
`;

export const DELETE_PARKED_SALE = gql`
	mutation DeleteParkedSale($id: ID!) {
		deleteParkedSale(id: $id) {
			success
			message
		}
	}
`;

export const RECORD_SALE = gql`
	mutation RecordSale($items: [SaleItemInput!]!) {
		recordSale(items: $items) {
			success
			message
			data {
				_id
				totalAmount
				grossProfit
				orderNo
				status
			}
		}
	}
`;
