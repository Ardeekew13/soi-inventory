import { gql } from "@apollo/client";

export const RECORD_SHIFT_EVENT_MUTATION = gql`
  mutation RecordShiftEvent($input: RecordShiftEventInput!) {
    recordShiftEvent(input: $input) {
      _id
      userId
      employeeName
      date
      attendanceStatus
      scheduledStartTime
      actualStartTime
      events {
        _id
        eventType
        timestamp
        photo
        notes
      }
      totalHoursWorked
      status
      createdAt
      updatedAt
    }
  }
`;

export const MY_CURRENT_SHIFT_QUERY = gql`
  query MyCurrentShift {
    myCurrentShift {
      _id
      userId
      employeeName
      date
      attendanceStatus
      scheduledStartTime
      actualStartTime
      events {
        _id
        eventType
        timestamp
        photo
        notes
      }
      totalHoursWorked
      status
      createdAt
      updatedAt
    }
  }
`;

export const MY_SHIFT_HISTORY_QUERY = gql`
  query MyShiftHistory($limit: Int, $offset: Int) {
    myShiftHistory(limit: $limit, offset: $offset) {
      _id
      userId
      employeeName
      date
      attendanceStatus
      scheduledStartTime
      actualStartTime
      events {
        _id
        eventType
        timestamp
        photo
        notes
      }
      totalHoursWorked
      status
      createdAt
      updatedAt
    }
  }
`;

export const ALL_SHIFTS_QUERY = gql`
  query AllShifts($date: Date, $status: ShiftStatus, $limit: Int, $offset: Int) {
    allShifts(date: $date, status: $status, limit: $limit, offset: $offset) {
      _id
      userId
      employeeName
      date
      attendanceStatus
      scheduledStartTime
      actualStartTime
      events {
        _id
        eventType
        timestamp
        photo
        notes
      }
      totalHoursWorked
      status
      createdAt
      updatedAt
    }
  }
`;

export const SHIFT_BY_ID_QUERY = gql`
  query ShiftById($id: ID!) {
    shiftById(id: $id) {
      _id
      userId
      employeeName
      date
      events {
        _id
        eventType
        timestamp
        photo
        notes
      }
      totalHoursWorked
      status
      createdAt
      updatedAt
    }
  }
`;
