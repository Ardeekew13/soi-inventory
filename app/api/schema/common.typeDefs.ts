import { gql } from "@apollo/client";

export const commonTypeDefs = gql`
	type BaseResponse {
		success: Boolean!
		message: String
	}

	type DeletionResult {
		success: Boolean!
		message: String
	}

	type ItemResultResponse {
		success: Boolean!
		message: String
		data: Item
	}

	type ProductResponse {
		success: Boolean!
		message: String
		data: Product
	}

	type SaleResponse {
		success: Boolean!
		message: String
		data: Sale
	}

	type Mutation
	type Query
`;
