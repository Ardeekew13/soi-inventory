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
