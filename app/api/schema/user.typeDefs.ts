
import { gql } from "@apollo/client";

export const userTypeDefs = gql`
  scalar JSON

  enum UserRole {
    SUPER_ADMIN
    MANAGER
    CASHIER
  }

  type User {
    _id: ID!
    username: String!
    role: UserRole!
    isActive: Boolean!
    firstName: String
    lastName: String
    permissions: JSON
    shiftScheduleId: ID
    shiftSchedule: ShiftSchedule
    createdAt: String!
    updatedAt: String!
  }

  type LoginResponse {
    success: Boolean!
    message: String!
    token: String
    user: User
  }

  type VerifyPasswordResponse {
    success: Boolean!
    message: String!
  }

  type UserResponse {
    success: Boolean!
    message: String!
    data: User
  }

  extend type Query {
    me: User!
    users: [User!]!
    user(id: ID!): User
  }

  extend type Mutation {
    login(username: String!, password: String!): LoginResponse!
    logout: Boolean!
    verifyPassword(password: String!): VerifyPasswordResponse!
    createUser(username: String!, password: String!, role: UserRole!, firstName: String, lastName: String, permissions: JSON, shiftScheduleId: ID): UserResponse!
    updateUser(id: ID!, username: String, password: String, role: UserRole, isActive: Boolean, firstName: String, lastName: String, permissions: JSON, shiftScheduleId: ID): UserResponse!
    deleteUser(id: ID!): UserResponse!
  }
`;