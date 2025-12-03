import { gql } from "@apollo/client";

export const productTypeDefs = gql`
	type Product {
		_id: ID!
		id: ID!
		name: String!
		price: Float!
		ingredientsUsed: [ProductIngredient!]!
		createdAt: String!
		updatedAt: String!
	}

	type ProductResponse {
		products: [Product!]!
		totalCount: Int!
	}

	type ProductIngredient {
		_id: ID!
		id: ID!
		productId: ID!
		itemId: ID!
		quantityUsed: Float!
		item: Item!
	}

	input ProductIngredientInput {
		itemId: ID!
		quantityUsed: Float!
	}

	type ProductMutationResponse {
		success: Boolean!
		message: String!
		data: Product
	}

	extend type Query {
		productsList(search: String, limit: Int, skip: Int): ProductResponse!
	}

	extend type Mutation {
		addProduct(
			id: ID
			name: String!
			price: Float!
			items: [ProductIngredientInput!]!
		): ProductMutationResponse!

		deleteProduct(id: ID!): DeletionResult!
	}
`;
