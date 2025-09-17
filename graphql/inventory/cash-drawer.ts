import { gql } from "@apollo/client";

export const OPEN_CASH_DRAWER = gql`
	mutation openCashDrawer($userId: UUID!, $openingCash: Float!) {
		openCashDrawer(userId: $userId, openingCash: $openingCash) {
			success
			message
			status
		}
	}
`;
