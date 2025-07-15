import { gql } from "@apollo/client";

export const LOGIN_MUTATION = gql`
	mutation Login($username: String!, $password: String!) {
		login(username: $username, password: $password) {
			id
			username
			role
			success
			message
		}
	}
`;

export const LOGOUT_MUTATION = gql`
	mutation Logout {
		logout
	}
`;
