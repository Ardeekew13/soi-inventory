import { gql } from "@apollo/client";

export const SHIFT_SCHEDULES_QUERY = gql`
  query ShiftSchedules {
    shiftSchedules {
      _id
      name
      shiftStartTime
      breakStartTime
      breakEndTime
      shiftEndTime
      isActive
      isDefault
      createdAt
      updatedAt
    }
  }
`;

export const SHIFT_SCHEDULE_BY_ID_QUERY = gql`
  query ShiftScheduleById($id: ID!) {
    shiftScheduleById(id: $id) {
      _id
      name
      shiftStartTime
      breakStartTime
      breakEndTime
      shiftEndTime
      isActive
      isDefault
      createdAt
      updatedAt
    }
  }
`;

export const CREATE_SHIFT_SCHEDULE_MUTATION = gql`
  mutation CreateShiftSchedule($input: CreateShiftScheduleInput!) {
    createShiftSchedule(input: $input) {
      _id
      name
      shiftStartTime
      breakStartTime
      breakEndTime
      shiftEndTime
      isActive
      isDefault
      createdAt
      updatedAt
    }
  }
`;

export const UPDATE_SHIFT_SCHEDULE_MUTATION = gql`
  mutation UpdateShiftSchedule($input: UpdateShiftScheduleInput!) {
    updateShiftSchedule(input: $input) {
      _id
      name
      shiftStartTime
      breakStartTime
      breakEndTime
      shiftEndTime
      isActive
      isDefault
      createdAt
      updatedAt
    }
  }
`;

export const DELETE_SHIFT_SCHEDULE_MUTATION = gql`
  mutation DeleteShiftSchedule($id: ID!) {
    deleteShiftSchedule(id: $id)
  }
`;
