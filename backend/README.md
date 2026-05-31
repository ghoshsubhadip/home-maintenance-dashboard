# Home Maintenance Dashboard - Backend

SQLite-based backend API for the Home Maintenance Dashboard application.

## Prerequisites

- Node.js (v14 or higher)
- npm

## Installation

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

## Running the Server

### Production Mode
```bash
npm start
```

### Development Mode (with auto-reload)
```bash
npm run dev
```

The server will start on `http://localhost:3000`

## API Endpoints

### Issues
- `GET /api/issues` - Get all issues
- `GET /api/issues/:id` - Get issue by ID
- `POST /api/issues` - Create new issue
- `PUT /api/issues/:id` - Update issue
- `DELETE /api/issues/:id` - Delete issue

### Labour
- `GET /api/labour` - Get all labour entries
- `GET /api/labour/issue/:issueId` - Get labour entries for an issue
- `POST /api/labour` - Create labour entry

### Materials
- `GET /api/materials` - Get all materials
- `GET /api/materials/issue/:issueId` - Get materials for an issue
- `POST /api/materials` - Create material entry

### KPIs
- `GET /api/kpis` - Get dashboard KPIs

### Helpers
- `GET /api/helpers/next-issue-id` - Get next issue ID
- `GET /api/helpers/next-labour-id` - Get next labour ID
- `GET /api/helpers/next-material-id` - Get next material ID

### Health Check
- `GET /health` - Server health check

## Database

The SQLite database file (`home_maintenance.db`) will be created automatically in the backend directory when the server starts for the first time.

## Database Schema

### Issues Table
- issue_id (TEXT, PRIMARY KEY)
- title (TEXT)
- description (TEXT)
- category (TEXT)
- location (TEXT)
- priority (TEXT)
- status (TEXT)
- estimated_cost (REAL)
- actual_labour_cost (REAL)
- actual_material_cost (REAL)
- actual_total_cost (REAL)
- variance (REAL)
- created_date (TEXT)

### Labour Table
- labour_id (TEXT, PRIMARY KEY)
- issue_id (TEXT, FOREIGN KEY)
- worker_name (TEXT)
- hours (REAL)
- rate_per_hour (REAL)
- total_cost (REAL)
- date (TEXT)

### Materials Table
- material_id (TEXT, PRIMARY KEY)
- issue_id (TEXT, FOREIGN KEY)
- material_name (TEXT)
- quantity (REAL)
- unit (TEXT)
- unit_cost (REAL)
- total_cost (REAL)
- date (TEXT)

## CORS

CORS is enabled for all origins to allow the frontend to access the API.

## Error Handling

All endpoints return JSON responses with the following structure:
```json
{
  "success": true/false,
  "data": {},  // on success
  "error": ""  // on failure
}
```
