import { gql } from "@apollo/client";

export const USERS_QUERY = gql`
  query Users {
    users {
      _id
      username
      role
      firstName
      lastName
      isActive
      permissions
      shiftScheduleId
      createdAt
      updatedAt
    }
  }
`;

export const CREATE_USER_MUTATION = gql`
  mutation CreateUser($username: String!, $password: String!, $role: UserRole!, $firstName: String, $lastName: String, $permissions: JSON, $shiftScheduleId: ID) {
    createUser(username: $username, password: $password, role: $role, firstName: $firstName, lastName: $lastName, permissions: $permissions, shiftScheduleId: $shiftScheduleId) {
      success
      message
      data {
        _id
        username
        role
        firstName
        lastName
        isActive
        permissions
        shiftScheduleId
      }
    }
  }
`;

export const UPDATE_USER_MUTATION = gql`
  mutation UpdateUser($id: ID!, $username: String, $password: String, $role: UserRole, $isActive: Boolean, $firstName: String, $lastName: String, $permissions: JSON, $shiftScheduleId: ID) {
    updateUser(id: $id, username: $username, password: $password, role: $role, isActive: $isActive, firstName: $firstName, lastName: $lastName, permissions: $permissions, shiftScheduleId: $shiftScheduleId) {
      success
      message
      data {
        _id
        username
        role
        firstName
        lastName
        isActive
        permissions
        shiftScheduleId
      }
    }
  }
`;

export const DELETE_USER_MUTATION = gql`
  mutation DeleteUser($id: ID!) {
    deleteUser(id: $id) {
      success
      message
    }
  }
`;
