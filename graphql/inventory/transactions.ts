import { gql } from "@apollo/client";

export const GET_SALES = gql`
  query Sales($search: String) {
    sales(search: $search) {
      _id
      tableNumber
      orderNo
      createdAt
      id
      orderType
      status
      orderNo
      costOfGoods
      grossProfit
      saleItems {
        priceAtSale
        product {
          id
          name
          price
          updatedAt
          createdAt
        }
        productId
        quantity
      }
      totalAmount
    }
  }
`;

export const VOID_TRANSACTION = gql`
  mutation voidSale($id: ID!, $voidReason: String!) {
    voidSale(id: $id, voidReason: $voidReason) {
      success
      message
    }
  }
`;

export const REFUND_SALE = gql`
  mutation refundSale($id: ID!, $refundReason: String!) {
    refundSale(id: $id, refundReason: $refundReason) {
      success
      message
    }
  }
`;

export const CHANGE_ITEM = gql`
  mutation changeItem($saleId: ID!, $oldSaleItemId: ID!, $newProductId: ID!, $newQuantity: Float!, $reason: String!) {
    changeItem(saleId: $saleId, oldSaleItemId: $oldSaleItemId, newProductId: $newProductId, newQuantity: $newQuantity, reason: $reason) {
      success
      message
    }
  }
`;
