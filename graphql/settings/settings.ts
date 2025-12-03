import { gql } from "@apollo/client";

export const GET_DISCOUNTS = gql`
	query Discounts {
		discounts {
			_id
			id
			title
			value
			isActive
			createdAt
			updatedAt
		}
	}
`;

export const CREATE_DISCOUNT = gql`
	mutation CreateDiscount($input: DiscountInput!) {
		createDiscount(input: $input) {
			success
			message
		}
	}
`;

export const UPDATE_DISCOUNT = gql`
	mutation UpdateDiscount($id: ID!, $input: DiscountInput!) {
		updateDiscount(id: $id, input: $input) {
			success
			message
		}
	}
`;

export const DELETE_DISCOUNT = gql`
	mutation DeleteDiscount($id: ID!) {
		deleteDiscount(id: $id) {
			success
			message
		}
	}
`;

export const GET_SERVICE_CHARGES = gql`
	query ServiceCharges {
		serviceCharges {
			_id
			id
			title
			value
			isActive
			createdAt
			updatedAt
		}
	}
`;

export const CREATE_SERVICE_CHARGE = gql`
	mutation CreateServiceCharge($input: ServiceChargeInput!) {
		createServiceCharge(input: $input) {
			success
			message
		}
	}
`;

export const UPDATE_SERVICE_CHARGE = gql`
	mutation UpdateServiceCharge($id: ID!, $input: ServiceChargeInput!) {
		updateServiceCharge(id: $id, input: $input) {
			success
			message
		}
	}
`;

export const DELETE_SERVICE_CHARGE = gql`
	mutation DeleteServiceCharge($id: ID!) {
		deleteServiceCharge(id: $id) {
			success
			message
		}
	}
`;
