import { gql } from "@apollo/client";

export const RECORD_SALE = gql`
	mutation RecordSale(
		$id: UUID
		$items: [SaleItemInput!]!
		$cashDrawerId: UUID!
		$isParked: Boolean!
		$tableNo: Int
		$serviceType: String!
	) {
		recordSale(
			id: $id
			items: $items
			cashDrawerId: $cashDrawerId
			isParked: $isParked
			tableNo: $tableNo
			serviceType: $serviceType
		) {
			id
			totalAmount
			message
			orderNo
		}
	}
`;

export const IS_CASH_DRAWER_OPEN = gql`
	query isOpenCashDrawer($userId: UUID!) {
		isOpenCashDrawer(userId: $userId) {
			isOpen
			message
			cashDrawer {
				id
				openingCash
				cashIn
				cashOut
				closingCash
				expectedCash
			}
		}
	}
`;

export const MARK_ITEMS_PRINTED = gql`
	mutation markItemsPrinted($id: UUID!) {
		markItemsPrinted(id: $id) {
			success
			message
		}
	}
`;

export const CHECKOUT_SALE = gql`
	mutation checkoutSale($id: UUID!, $paymentMethod: String!) {
		checkoutSale(id: $id, paymentMethod: $paymentMethod) {
			success
			message
		}
	}
`;
