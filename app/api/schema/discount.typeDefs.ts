import { gql } from "graphql-tag";

const discountTypeDefs = gql`
	type Discount {
		_id: ID!
		id: ID!
		title: String!
		value: Float!
		isActive: Boolean!
		createdAt: String!
		updatedAt: String!
	}

	input DiscountInput {
		title: String!
		value: Float!
	}

	extend type Query {
		discounts: [Discount!]!
		discount(id: ID!): Discount
	}

	extend type Mutation {
		createDiscount(input: DiscountInput!): DeletionResult!
		updateDiscount(id: ID!, input: DiscountInput!): DeletionResult!
		deleteDiscount(id: ID!): DeletionResult!
	}
`;

export default discountTypeDefs;
