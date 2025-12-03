import { gql } from "@apollo/client";

export const GET_PRODUCTS = gql`
	query Products($search: String, $limit: Int, $skip: Int) {
		productsList(search: $search, limit: $limit, skip: $skip) {
			products {
				_id
				name
				price
				ingredientsUsed {
					_id
					productId
					itemId
					quantityUsed
					item {
						_id
						name
						unit
						pricePerUnit
					}
				}
				createdAt
				updatedAt
			}
			totalCount
		}
	}
`;

export const ADD_PRODUCT = gql`
	mutation addProduct(
		$id: ID
		$name: String!
		$price: Float!
		$items: [ProductIngredientInput!]!
	) {
		addProduct(id: $id, name: $name, price: $price, items: $items) {
			success
			message
			data {
				_id
				name
				price
				ingredientsUsed {
					_id
					productId
					itemId
					quantityUsed
					item {
						_id
						name
						unit
						pricePerUnit
					}
				}
				createdAt
				updatedAt
			}
		}
	}
`;

export const DELETE_PRODUCT = gql`
	mutation DeleteProduct($id: ID!) {
		deleteProduct(id: $id) {
			success
			message
		}
	}
`;
