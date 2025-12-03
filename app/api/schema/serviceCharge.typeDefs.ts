import { gql } from "graphql-tag";

const serviceChargeTypeDefs = gql`
	type ServiceCharge {
		_id: ID!
		id: ID!
		title: String!
		value: Float!
		isActive: Boolean!
		createdAt: String!
		updatedAt: String!
	}

	input ServiceChargeInput {
		title: String!
		value: Float!
	}

	extend type Query {
		serviceCharges: [ServiceCharge!]!
		serviceCharge(id: ID!): ServiceCharge
	}

	extend type Mutation {
		createServiceCharge(input: ServiceChargeInput!): DeletionResult!
		updateServiceCharge(id: ID!, input: ServiceChargeInput!): DeletionResult!
		deleteServiceCharge(id: ID!): DeletionResult!
	}
`;

export default serviceChargeTypeDefs;
