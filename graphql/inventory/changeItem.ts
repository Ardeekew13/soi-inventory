import { gql } from "@apollo/client";

export const CHANGE_ITEM = gql`
  mutation ChangeItem(
    $saleId: ID!
    $saleItemId: ID!
    $newProductId: ID!
    $newQuantity: Float!
  ) {
    changeItem(
      saleId: $saleId
      saleItemId: $saleItemId
      newProductId: $newProductId
      newQuantity: $newQuantity
    ) {
      success
      message
    }
  }
`;
