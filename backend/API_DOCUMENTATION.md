# Patient DOB API Documentation

This document describes the API endpoints for fetching patient data by Date of Birth (DOB) from the MSSQL database.

## Base URL
```
http://localhost:5000/api
```

## Authentication
Currently no authentication is required. (Add JWT or other auth as needed)

## Endpoints

### 1. Get Patient by UHID
**GET** `/users/uhid/:uhid`

Get a specific patient by their UHID (Unique Hospital ID).

**Parameters:**
- `uhid` (path parameter): The patient's UHID

**Example Request:**
```bash
GET /api/users/uhid/12345
```

**Example Response:**
```json
{
  "success": true,
  "data": {
    "name": "John Doe",
    "dob": "1990-05-15T00:00:00.000Z",
    "gender": "Male",
    "uhid": "12345",
    "mobile": "+1234567890",
    "address": "123 Main St",
    "age": 33
  },
  "message": "Patient found successfully"
}
```

### 2. Get Patients by Exact DOB
**GET** `/users/dob/:dob`

Get all patients with a specific date of birth.

**Parameters:**
- `dob` (path parameter): Date of birth in YYYY-MM-DD format

**Example Request:**
```bash
GET /api/users/dob/1990-05-15
```

**Example Response:**
```json
{
  "success": true,
  "data": [
    {
      "name": "John Doe",
      "dob": "1990-05-15T00:00:00.000Z",
      "gender": "Male",
      "uhid": "12345",
      "mobile": "+1234567890",
      "address": "123 Main St",
      "age": 33
    }
  ],
  "count": 1,
  "message": "Found 1 patients with DOB 1990-05-15"
}
```

### 3. Get Patients with Birthday Today
**GET** `/users/birthday/today`

Get all patients whose birthday is today.

**Example Request:**
```bash
GET /api/users/birthday/today
```

**Example Response:**
```json
{
  "success": true,
  "data": [
    {
      "name": "Jane Smith",
      "dob": "1985-12-25T00:00:00.000Z",
      "gender": "Female",
      "uhid": "67890",
      "mobile": "+0987654321",
      "address": "456 Oak Ave",
      "age": 38
    }
  ],
  "count": 1,
  "message": "Found 1 patients with birthday today"
}
```

### 4. Get Patients with Birthday Tomorrow
**GET** `/users/birthday/tomorrow`

Get all patients whose birthday is tomorrow.

**Example Request:**
```bash
GET /api/users/birthday/tomorrow
```

**Example Response:**
```json
{
  "success": true,
  "data": [
    {
      "name": "Bob Johnson",
      "dob": "1992-12-26T00:00:00.000Z",
      "gender": "Male",
      "uhid": "54321",
      "mobile": "+1122334455",
      "address": "789 Pine St",
      "age": 31
    }
  ],
  "count": 1,
  "message": "Found 1 patients with birthday tomorrow"
}
```

### 5. Get Patients with Upcoming Birthdays
**GET** `/users/birthday/upcoming?days=7`

Get all patients with upcoming birthdays within the specified number of days.

**Query Parameters:**
- `days` (optional): Number of days to look ahead (default: 7)

**Example Request:**
```bash
GET /api/users/birthday/upcoming?days=14
```

**Example Response:**
```json
{
  "success": true,
  "data": [
    {
      "name": "Alice Brown",
      "dob": "1988-12-30T00:00:00.000Z",
      "gender": "Female",
      "uhid": "98765",
      "mobile": "+5566778899",
      "address": "321 Elm St",
      "age": 35,
      "daysUntilBirthday": 5
    }
  ],
  "count": 1,
  "days": 14,
  "message": "Found 1 patients with upcoming birthdays in the next 14 days"
}
```

## Error Responses

### 400 Bad Request
```json
{
  "success": false,
  "message": "UHID is required"
}
```

### 404 Not Found
```json
{
  "success": false,
  "message": "Patient not found"
}
```

### 500 Internal Server Error
```json
{
  "success": false,
  "error": "Failed to fetch patient",
  "message": "Detailed error message"
}
```

## Data Fields

Each patient record contains the following fields:

| Field | Type | Description |
|-------|------|-------------|
| `name` | String | Patient's full name |
| `dob` | Date | Date of birth (ISO format) |
| `gender` | String | Gender (Male/Female) |
| `uhid` | String | Unique Hospital ID |
| `mobile` | String | Mobile phone number |
| `address` | String | Patient's address |
| `age` | Number | Calculated age from DOB |

## Testing

### Using curl
```bash
# Get patient by UHID
curl http://localhost:5000/api/users/uhid/12345

# Get patients by DOB
curl http://localhost:5000/api/users/dob/1990-05-15

# Get patients with birthday today
curl http://localhost:5000/api/users/birthday/today

# Get patients with birthday tomorrow
curl http://localhost:5000/api/users/birthday/tomorrow

# Get patients with upcoming birthdays (next 14 days)
curl "http://localhost:5000/api/users/birthday/upcoming?days=14"
```

### Using the test script
```bash
cd backend
node test-dob.js
```

## Database Schema

The API queries the following MSSQL tables:
- `Mast_Patient` - Main patient information
- `Mast_Pat_Addr` - Patient address information

### Key Fields:
- `cPat_Name` - Patient name
- `dDob` - Date of birth
- `cSex` - Gender (M/F)
- `iReg_No` - UHID
- `cMobile` - Mobile number
- `cAddress` - Address

## Environment Configuration

Make sure to configure the following environment variables in your `.env` file:

```env
MSSQL_SERVER=your_server
MSSQL_DATABASE=your_database
MSSQL_USER=your_username
MSSQL_PASS=your_password
```

## Notes

1. All dates are handled in ISO format (YYYY-MM-DD)
2. Age is calculated dynamically from the DOB
3. Gender codes (M/F) are converted to readable format (Male/Female)
4. The API handles null/empty values gracefully
5. All queries include proper error handling and logging
