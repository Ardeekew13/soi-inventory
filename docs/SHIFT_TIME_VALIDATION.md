# Enhanced Shift Time Validation System

## Overview
The shift tracking system now validates employee clock-in/out times against their assigned shift schedule to accurately determine attendance status and ensure compliance with work hours.

## Key Features

### 1. Shift Schedule Enforcement
Every employee must have an assigned shift schedule that defines:
- **Shift Start Time** (e.g., "08:00")
- **Break Start Time** (e.g., "12:00")
- **Break End Time** (e.g., "13:00")
- **Shift End Time** (e.g., "17:00")

### 2. Attendance Status Calculation

The system automatically determines attendance status when an employee starts their shift:

| Status | Criteria | Example |
|--------|----------|---------|
| **ON_TIME** | Clocked in within 15 minutes of scheduled start | Scheduled: 8:00 AM, Actual: 7:50 AM - 8:15 AM |
| **LATE** | Clocked in 15-120 minutes after scheduled start | Scheduled: 8:00 AM, Actual: 8:16 AM - 10:00 AM |
| **HALF_DAY** | Clocked in more than 2 hours late | Scheduled: 8:00 AM, Actual: 10:01 AM or later |
| **ABSENT** | No shift start recorded for the day | No clock-in by end of day |

### 3. Time Validation Rules

#### Shift Start
- ✅ Can clock in early (no penalty)
- ✅ On-time within 15 minutes
- ⚠️ Late if more than 15 minutes late
- ⚠️ Half-day if more than 2 hours late

#### Lunch Break Start
- ⏰ Must be within ±30 minutes of scheduled break start time
- 🔒 Cannot start break twice
- Example: If scheduled at 12:00 PM, can start between 11:30 AM - 12:30 PM

#### Lunch Break End
- ⏰ Must be within ±30 minutes of scheduled break end time
- 🔒 Must have started lunch break first
- 🔒 Cannot end break twice
- Example: If scheduled at 1:00 PM, must end between 12:30 PM - 1:30 PM

#### Shift End
- ⏰ Cannot leave more than 30 minutes before scheduled end time
- ✅ Can work overtime (clocking out after scheduled time)
- Example: If scheduled at 5:00 PM, cannot leave before 4:30 PM

### 4. Error Messages

The system provides clear, user-friendly error messages:

```
❌ "No shift schedule assigned to your account. Please contact your administrator."
❌ "Shift already started"
❌ "Must start shift first"
❌ "Lunch break should start around 12:00. You are 45 minutes late."
❌ "Lunch break should end around 13:00. You are 20 minutes early."
❌ "Shift should end around 17:00. You are leaving 45 minutes early."
❌ "Must start lunch break first"
❌ "Lunch break already started"
```

## Technical Implementation

### Database Schema

#### ShiftSchedule Model
```typescript
{
  name: string,              // "Morning Shift", "Night Shift", etc.
  shiftStartTime: string,    // "08:00"
  breakStartTime: string,    // "12:00"
  breakEndTime: string,      // "13:00"
  shiftEndTime: string,      // "17:00"
  isActive: boolean,
  isDefault: boolean
}
```

#### EmployeeShift Model
```typescript
{
  userId: ObjectId,
  employeeName: string,
  date: Date,
  attendanceStatus: "ON_TIME" | "LATE" | "HALF_DAY" | "ABSENT",
  scheduledStartTime: Date,
  actualStartTime: Date,
  events: [ShiftEvent],
  totalHoursWorked: number,
  status: "IN_PROGRESS" | "COMPLETED"
}
```

#### ShiftEvent Sub-document
```typescript
{
  eventType: "SHIFT_START" | "LUNCH_BREAK_START" | "LUNCH_BREAK_END" | "SHIFT_END",
  timestamp: Date,
  photo: string,            // Base64 or Cloudinary URL
  notes: string
}
```

### Validation Functions

```typescript
// Helper: Create scheduled time from schedule string
const createScheduledTime = (timeString: string): Date => {
  const [hours, minutes] = timeString.split(':').map(Number);
  const scheduledTime = new Date(today);
  scheduledTime.setHours(hours, minutes, 0, 0);
  return scheduledTime;
};

// Helper: Calculate minutes difference between actual and scheduled
const getMinutesDifference = (actual: Date, scheduled: Date): number => {
  return (actual.getTime() - scheduled.getTime()) / (1000 * 60);
};
```

### Attendance Logic Flow

```
1. Employee clicks "Start Shift"
   ↓
2. System retrieves employee's assigned ShiftSchedule
   ↓
3. System compares actual time vs scheduled start time
   ↓
4. Calculate minutes difference
   ↓
5. Determine attendance status:
   - minutesLate ≤ 15: ON_TIME
   - 15 < minutesLate ≤ 120: LATE
   - minutesLate > 120: HALF_DAY
   ↓
6. Create EmployeeShift record with status
   ↓
7. Save shift with first event (SHIFT_START)
```

## Benefits

### For Employees
- ✅ Clear expectations on work hours
- ✅ Know exactly when they can take breaks
- ✅ Photo verification prevents disputes
- ✅ Can't accidentally clock in/out at wrong times

### For Managers
- ✅ Accurate attendance tracking
- ✅ Automatic late/half-day detection
- ✅ Prevent early departures
- ✅ Ensure break times are followed
- ✅ Photo evidence for all events

### For the Business
- ✅ Compliance with labor regulations
- ✅ Reduced time theft
- ✅ Accurate payroll calculations
- ✅ Clear audit trail
- ✅ Prevention of buddy punching (photo verification)

## Example Scenarios

### Scenario 1: On-Time Employee
```
Schedule: 8:00 AM - 5:00 PM, Break: 12:00 PM - 1:00 PM

Timeline:
- 7:55 AM: Clock in ✅ Status: ON_TIME
- 12:05 PM: Start lunch ✅ Within 30-min window
- 1:00 PM: End lunch ✅ On schedule
- 5:10 PM: Clock out ✅ Overtime allowed

Result: ON_TIME status, 8.08 hours worked (excluding 55-min lunch)
```

### Scenario 2: Late Employee
```
Schedule: 8:00 AM - 5:00 PM, Break: 12:00 PM - 1:00 PM

Timeline:
- 8:25 AM: Clock in ⚠️ Status: LATE (25 minutes late)
- 12:15 PM: Start lunch ✅ Within window
- 1:00 PM: End lunch ✅ On schedule
- 5:00 PM: Clock out ✅ On time

Result: LATE status, 7.75 hours worked
```

### Scenario 3: Prevented Early Departure
```
Schedule: 8:00 AM - 5:00 PM

Timeline:
- 8:00 AM: Clock in ✅ ON_TIME
- 4:20 PM: Try to clock out ❌ Error: "You are leaving 40 minutes early"
- 4:35 PM: Try to clock out ✅ Allowed (within 30-min window)

Result: Prevented unauthorized early departure
```

### Scenario 4: Break Time Violation
```
Schedule: Break 12:00 PM - 1:00 PM

Timeline:
- 11:00 AM: Try to start lunch ❌ Error: "Lunch break should start around 12:00. You are 60 minutes early."
- 11:45 AM: Try again ✅ Allowed (within 30-min window)

Result: Ensured proper break time adherence
```

## Configuration

### Admin Setup
1. Create shift schedules in Settings > Shift Schedules
2. Define times: Start, Break Start, Break End, End
3. Assign schedules to employees in user management
4. Set one schedule as default for new employees

### Customization Options
- Adjust tolerance windows (currently ±30 min for breaks)
- Modify late thresholds (currently 15 min for LATE, 120 min for HALF_DAY)
- Enable/disable strict mode (reject vs warn on violations)

## Future Enhancements
- [ ] SMS/email notifications for late arrivals
- [ ] Automatic deductions for excessive lateness
- [ ] Flexible schedules (different times per day of week)
- [ ] Overtime approval workflow
- [ ] Integration with payroll systems
- [ ] Grace period rules for specific employees
- [ ] Holiday/special day handling
