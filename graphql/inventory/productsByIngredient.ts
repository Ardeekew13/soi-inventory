import { gql } from "@apollo/client";

export const GET_PRODUCTS_BY_INGREDIENT = gql`
  query ProductsByIngredient($itemId: ID!) {
    productsByIngredient(itemId: $itemId) {
      _id
      id
      name
      price
      ingredientsUsed {
        _id
        id
        itemId
        quantityUsed
        item {
          _id
          id
          name
          unit
        }
      }
      createdAt
      updatedAt
    }
  }
`;
