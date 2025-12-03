import { gql } from "@apollo/client";

export const GET_CURRENT_CASH_DRAWER = gql`
  query CurrentCashDrawer {
    currentCashDrawer {
      _id
      openedBy
      openedAt
      openingBalance
      status
      currentBalance
      totalCashIn
      totalCashOut
      totalSales
      cashSales
      bankTransferSales
      cardSales
      creditSales
      gcashSales
      transactions {
        _id
        type
        amount
        description
        saleId
        paymentMethod
        createdAt
      }
    }
  }
`;

export const GET_CASH_DRAWER_HISTORY = gql`
  query CashDrawerHistory($limit: Int) {
    cashDrawerHistory(limit: $limit) {
      _id
      openedBy
      openedAt
      closedAt
      openingBalance
      closingBalance
      expectedBalance
      status
      currentBalance
      totalCashIn
      totalCashOut
      totalSales
      cashSales
      bankTransferSales
      cardSales
      creditSales
      gcashSales
    }
  }
`;

export const OPEN_CASH_DRAWER = gql`
  mutation OpenCashDrawer($openingBalance: Float!) {
    openCashDrawer(openingBalance: $openingBalance) {
      success
      message
      data {
        _id
        openedBy
        openedAt
        openingBalance
        status
        currentBalance
      }
    }
  }
`;

export const CLOSE_CASH_DRAWER = gql`
  mutation CloseCashDrawer($closingBalance: Float!) {
    closeCashDrawer(closingBalance: $closingBalance) {
      success
      message
      data {
        _id
        closedAt
        closingBalance
        expectedBalance
        status
      }
    }
  }
`;

export const ADD_CASH_IN = gql`
  mutation AddCashIn($amount: Float!, $description: String!) {
    addCashIn(amount: $amount, description: $description) {
      success
      message
      data {
        _id
        currentBalance
        totalCashIn
      }
    }
  }
`;

export const ADD_CASH_OUT = gql`
  mutation AddCashOut($amount: Float!, $description: String!) {
    addCashOut(amount: $amount, description: $description) {
      success
      message
      data {
        _id
        currentBalance
        totalCashOut
      }
    }
  }
`;
