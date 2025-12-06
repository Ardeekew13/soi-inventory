import { gql } from "@apollo/client";

export const GET_ITEMS = gql`
	query GetItems($search: String, $limit: Int, $skip: Int) {
		itemsList(search: $search, limit: $limit, skip: $skip) {
			items {
				_id
				name
				unit
				pricePerUnit
				currentStock
				updatedAt
				createdAt
				isActive
			}
			totalCount
		}
	}
`;

export const ADD_ITEM = gql`
	mutation AddItem(
		$id: ID
		$name: String!
		$unit: String!
		$pricePerUnit: Float!
		$currentStock: Float!
	) {
		addItem(
			_id: $id
			name: $name
			unit: $unit
			pricePerUnit: $pricePerUnit
			currentStock: $currentStock
		) {
			success
			message
			data {
				_id
				name
				unit
				pricePerUnit
				currentStock
				createdAt
				updatedAt
			}
		}
	}
`;

export const DELETE_ITEM = gql`
	mutation DeleteItem($id: ID!) {
		deleteItem(_id: $id) {
			success
			message
		}
	}
`;

export const GET_INACTIVE_ITEMS = gql`
	query GetInactiveItems($search: String, $limit: Int, $skip: Int) {
		inactiveItemsList(search: $search, limit: $limit, skip: $skip) {
			items {
				_id
				name
				unit
				pricePerUnit
				currentStock
				updatedAt
				createdAt
			}
			totalCount
		}
	}
`;

export const REACTIVATE_ITEM = gql`
	mutation ReactivateItem($id: ID!) {
		reactivateItem(_id: $id) {
			success
			message
			data {
				_id
				name
				unit
				pricePerUnit
				currentStock
				isActive
			}
		}
	}
`;
