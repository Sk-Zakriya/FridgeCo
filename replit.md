# Technician Report App - FridgeCo

## Overview
This is a web-based technician report management system built with Node.js, Express, and SQLite. The application allows technicians to submit service reports and view/download them in Excel format.

## Project Structure
```
technician-report/
├── public/              # Frontend files
│   ├── index.html      # Report submission form
│   ├── view.html       # Report viewing page
│   ├── script.js       # Form handling
│   ├── view.js         # Report display logic
│   └── style.css       # Styling
├── server.js           # Express backend server
├── technician.db       # SQLite database (auto-created)
└── package.json        # Node.js dependencies
```

## Features
- Submit technician service reports with location, date, machine number, technician name, and problem description
- View all submitted reports in a sortable table
- Export reports to Excel (.xlsx format)
- Dark/Light mode toggle
- Persistent SQLite database storage

## Technical Stack
- **Backend**: Node.js with Express
- **Database**: SQLite3
- **Excel Export**: xlsx library
- **Frontend**: Vanilla JavaScript, HTML, CSS

## Configuration
- **Port**: 5000 (configured for Replit webview)
- **Host**: 0.0.0.0 (required for Replit proxy)
- **Database**: SQLite file-based database (technician.db)

## Recent Changes
- 2025-11-04: Initial setup in Replit environment
  - Configured server to bind to 0.0.0.0:5000
  - Set up workflow for automatic server start
  - Configured deployment settings for autoscale
  - Added .gitignore for Node.js project

## Development
The application runs automatically via the configured workflow. To manually start:
```bash
cd technician-report && npm start
```

## Deployment
The deployment has been configured using Replit's deployment system with autoscale target. When you click the "Publish" button in Replit, the app will be deployed and automatically scale based on traffic. The deployment will run `cd technician-report && npm start` in production, ensuring the correct working directory for static file serving.

## Database Schema
```sql
CREATE TABLE reports (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  location TEXT,
  date TEXT,
  machineNumber TEXT,
  technicianName TEXT,
  problemSolved TEXT
)
```

## API Endpoints
- `POST /save` - Save a new report
- `GET /reports` - Fetch all reports (JSON)
- `GET /download` - Download reports as Excel file
- `GET /` - Serve main form page
