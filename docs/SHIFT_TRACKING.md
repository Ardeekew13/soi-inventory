# Employee Shift Tracking System

## Overview
A comprehensive employee attendance tracking system with photo verification to prevent buddy punching and ensure accurate time records.

## Features

### For All Employees
- **Shift Start**: Clock in with photo verification
- **Lunch Break Management**: Record lunch break start and end times with photos
- **Shift End**: Clock out with photo verification
- **Personal History**: View your own shift history and hours worked
- **Current Shift Status**: See active shift details and next required action

### For Managers & Admins
- **All Shifts View**: Monitor all employee shifts in real-time
- **Date Filtering**: Filter shifts by specific date
- **Status Filtering**: View in-progress or completed shifts
- **Detailed Reports**: View complete shift timeline with photos
- **Hours Tracking**: Automatic calculation of total hours worked (excluding lunch breaks)

## How It Works

### Event Sequence
Employees must record events in order:
1. **SHIFT_START** - Begin work day
2. **LUNCH_BREAK_START** - Start lunch break
3. **LUNCH_BREAK_END** - Return from lunch
4. **SHIFT_END** - End work day

### Photo Requirements
- Photos are captured at each event using device camera
- Images are automatically compressed to save database space (320x240, 50% quality)
- Photos stored as Base64 encoded strings in MongoDB
- Low resolution ensures minimal storage impact

### Hours Calculation
- Total hours = (Shift End - Shift Start) - (Lunch Break End - Lunch Break Start)
- Automatically calculated when shift ends
- Displayed in hours and minutes format

## Technical Implementation

### Database Model
```typescript
EmployeeShift {
  userId: ObjectId (ref: User)
  employeeName: string
  date: Date
  events: [ShiftEvent]
  totalHoursWorked: number
  status: "IN_PROGRESS" | "COMPLETED"
}

ShiftEvent {
  eventType: "SHIFT_START" | "LUNCH_BREAK_START" | "LUNCH_BREAK_END" | "SHIFT_END"
  timestamp: Date
  photo: string (Base64)
  notes: string (optional)
}
```

### Indexes
- `userId` + `date`: Find user's shift for specific date
- `date`: Query all shifts by date
- `status`: Filter by shift status
- `userId` + `status`: Find user's active shifts

### API Endpoints

#### Queries
- `myCurrentShift`: Get logged-in user's active shift
- `myShiftHistory(limit, offset)`: Get user's shift history
- `allShifts(date, status, limit, offset)`: Get all shifts (Admin/Manager only)
- `shiftById(id)`: Get specific shift details

#### Mutations
- `recordShiftEvent(input)`: Record shift event with photo
  - Input: eventType, photo (Base64), notes (optional)
  - Validates event sequence
  - Auto-completes shift when SHIFT_END recorded

### Authorization
- All users can:
  - Record their own shift events via Settings > Shift Tracking tab
  - View their own shift history
  - View their current active shift

- SUPER_ADMIN and MANAGER can:
  - View all employee shifts via Settings > Shift Management tab
  - Filter and search shifts
  - View detailed shift reports

## Usage

### Employee Clock In
1. Navigate to "Settings" in sidebar
2. Click on "Shift Tracking" tab
3. Click "Start Shift" button
4. Allow camera access when prompted
5. Position face in camera frame
6. Click "Capture Photo"
7. Add optional notes
8. Click "Submit"

### Recording Lunch Break
1. Current shift shows "Lunch Break Start" button when available
2. Follow same photo capture process
3. Return from lunch and click "Lunch Break End"
4. Capture photo again

### Clock Out
1. Click "Shift End" button
2. Capture final photo
3. Submit to complete shift
4. Total hours automatically calculated

### Viewing Reports (Admin/Manager)
1. Go to "Settings" page
2. Click on "Shift Management" tab
3. Use date picker to filter by date
4. Use status dropdown to filter by completion
5. Click "View Details" to see full shift timeline with photos

## Storage Considerations

### Photo Storage
- Each photo: ~10-15 KB (compressed)
- 4 photos per complete shift: ~40-60 KB
- 100 employees × 22 work days × 50 KB = ~110 MB/month
- Yearly total: ~1.3 GB for 100 employees

### Optimization Strategies
- Low resolution capture (320×240)
- 50% JPEG quality
- Base64 encoding for direct MongoDB storage
- Consider archiving old shifts to separate collection after 1-2 years

## Future Enhancements
- Export shift reports to Excel/PDF
- Overtime calculation
- Late arrival notifications
- Geolocation verification
- Facial recognition for additional security
- Mobile app for easier access
- Shift schedule management
- Time-off request integration
