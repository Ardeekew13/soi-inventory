import { gql } from "@apollo/client";

export const LOGIN_MUTATION = gql`
  mutation Login($username: String!, $password: String!) {
    login(username: $username, password: $password) {
      token
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

export const VERIFY_PASSWORD = gql`
  mutation VerifyPassword($password: String!) {
    verifyPassword(password: $password) {
      success
      message
    }
  }
`;
