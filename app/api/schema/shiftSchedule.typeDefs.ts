import { gql } from "@apollo/client";

export const shiftScheduleTypeDefs = gql`
  type ShiftSchedule {
    _id: ID!
    name: String!
    shiftStartTime: String!
    breakStartTime: String!
    breakEndTime: String!
    shiftEndTime: String!
    isActive: Boolean!
    isDefault: Boolean
    createdAt: String!
    updatedAt: String!
  }

  input CreateShiftScheduleInput {
    name: String!
    shiftStartTime: String!
    breakStartTime: String!
    breakEndTime: String!
    shiftEndTime: String!
    isDefault: Boolean
  }

  input UpdateShiftScheduleInput {
    id: ID!
    name: String
    shiftStartTime: String
    breakStartTime: String
    breakEndTime: String
    shiftEndTime: String
    isActive: Boolean
    isDefault: Boolean
  }

  extend type Query {
    shiftSchedules: [ShiftSchedule!]!
    shiftScheduleById(id: ID!): ShiftSchedule
  }

  extend type Mutation {
    createShiftSchedule(input: CreateShiftScheduleInput!): ShiftSchedule!
    updateShiftSchedule(input: UpdateShiftScheduleInput!): ShiftSchedule!
    deleteShiftSchedule(id: ID!): Boolean!
  }
`;
