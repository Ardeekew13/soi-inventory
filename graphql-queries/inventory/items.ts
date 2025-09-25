import { gql } from "@apollo/client";

export const GET_ITEMS = gql`
	query Items($search: String) {
		items(search: $search) {
			id
			name
			pricePerUnit
			unit
			currentStock
		}
	}
`;

export const ADD_ITEM = gql`
	mutation AddItem(
		$id: UUID
		$name: String!
		$unit: String!
		$pricePerUnit: Float!
		$currentStock: Float!
	) {
		addItem(
			id: $id
			name: $name
			unit: $unit
			pricePerUnit: $pricePerUnit
			currentStock: $currentStock
		) {
			id
			name
			unit
			pricePerUnit
			currentStock
		}
	}
`;

export const DELETE_ITEM = gql`
	mutation DeleteItem($id: UUID!) {
		deleteItem(id: $id) {
			success
			message
		}
	}
`;
