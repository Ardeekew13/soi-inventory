import { gql } from "@apollo/client";

export const RECORD_SALE = gql`
	mutation RecordSale($items: [SaleItemInput!]!) {
		recordSale(items: $items) {
			id
			totalAmount
			message
		}
	}
`;
