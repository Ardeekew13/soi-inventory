import { gql } from "@apollo/client";

export const employeeShiftTypeDefs = gql`
  enum ShiftEventType {
    SHIFT_START
    LUNCH_BREAK_START
    LUNCH_BREAK_END
    SHIFT_END
  }

  enum AttendanceStatus {
    ON_TIME
    LATE
    HALF_DAY
    ABSENT
  }

  enum ShiftStatus {
    IN_PROGRESS
    COMPLETED
  }

  type ShiftEvent {
    _id: ID!
    eventType: ShiftEventType!
    timestamp: String!
    photo: String
    notes: String
  }

  type EmployeeShift {
    _id: ID!
    userId: ID!
    employeeName: String!
    date: String!
    attendanceStatus: AttendanceStatus!
    scheduledStartTime: String
    actualStartTime: String
    events: [ShiftEvent!]!
    totalHoursWorked: Float!
    status: ShiftStatus!
    createdAt: String!
    updatedAt: String!
  }

  input RecordShiftEventInput {
    eventType: ShiftEventType!
    photo: String
    notes: String
  }

  extend type Query {
    myCurrentShift: EmployeeShift
    myShiftHistory(limit: Int, offset: Int): [EmployeeShift!]!
    allShifts(date: String, status: ShiftStatus, limit: Int, offset: Int): [EmployeeShift!]!
    shiftById(id: ID!): EmployeeShift
  }

  extend type Mutation {
    recordShiftEvent(input: RecordShiftEventInput!): EmployeeShift!
  }
`;
