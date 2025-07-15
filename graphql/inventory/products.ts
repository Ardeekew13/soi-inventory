import { gql } from "@apollo/client";

export const GET_PRODUCTS = gql`
	query Products($search: String) {
		products(search: $search) {
			id
			name
			price
			availableUnits
			ingredientsUsed {
				item {
					id
					name
					unit
					pricePerUnit
				}
				quantityUsed
			}
		}
	}
`;

export const ADD_PRODUCT = gql`
	mutation addProduct(
		$id: UUID
		$name: String!
		$price: Float!
		$items: [ProductIngredientInput!]!
	) {
		addProduct(id: $id, name: $name, price: $price, items: $items) {
			id
			name
			price
			ingredientsUsed {
				item {
					id
					name
					unit
					pricePerUnit
				}
				quantityUsed
			}
		}
	}
`;

export const DELETE_PRODUCT = gql`
	mutation DeleteProduct($id: UUID!) {
		deleteProduct(id: $id) {
			success
			message
		}
	}
`;
