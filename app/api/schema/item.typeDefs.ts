import { gql } from "@apollo/client";

export const itemTypeDefs = gql`
	type Item {
		_id: ID!
		id: ID!
		name: String!
		unit: String!
		pricePerUnit: Float!
		currentStock: Float!
		isActive: Boolean!
		createdAt: String!
		updatedAt: String!
	}

	type ItemsResponse {
		items: [Item!]!
		totalCount: Int!
	}

	extend type Query {
		itemsList(search: String, limit: Int, skip: Int): ItemsResponse!
		inactiveItemsList(search: String, limit: Int, skip: Int): ItemsResponse!
	}

	extend type Mutation {
		addItem(
			_id: ID
			name: String!
			unit: String!
			pricePerUnit: Float!
			currentStock: Float!
		): ItemResultResponse!

		reactivateItem(_id: ID!): ItemResultResponse!

		deleteItem(_id: ID!): DeletionResult!
	}
`;
