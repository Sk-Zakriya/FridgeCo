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
- **User Authentication**: Secure login and signup system with session-based authentication
- Submit technician service reports with location, date, machine number, technician name, and problem description
- View all submitted reports in a sortable table (protected - requires login)
- Export reports to Excel (.xlsx format) (protected - requires login)
- Dark/Light mode toggle
- Persistent SQLite database storage

## Technical Stack
- **Backend**: Node.js with Express
- **Database**: SQLite3 (users and reports)
- **Authentication**: bcrypt for password hashing, express-session for session management
- **Session Storage**: SQLite-based session store (connect-sqlite3)
- **Excel Export**: xlsx library
- **Frontend**: Vanilla JavaScript, HTML, CSS

## Configuration
- **Port**: 5000 (configured for Replit webview)
- **Host**: 0.0.0.0 (required for Replit proxy)
- **Database**: SQLite file-based database (technician.db for reports, sessions.db for sessions)
- **Session Secret**: Set SESSION_SECRET environment variable for production (falls back to development default)
- **Security**: Enable secure and sameSite cookies when deploying over HTTPS

## Recent Changes
- 2025-11-04: Added user authentication system
  - Implemented secure login and signup with bcrypt password hashing
  - Added session-based authentication with SQLite session store
  - Protected all report routes (view, submit, download) with authentication middleware
  - Created login and signup pages with consistent styling
  - Added logout functionality and user display on protected pages
  - Updated all client-side scripts to handle authentication and 401 errors
  
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

### Users Table
```sql
CREATE TABLE users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT UNIQUE NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
)
```

### Reports Table
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

### Authentication Endpoints (Public)
- `POST /api/signup` - Create a new user account
- `POST /api/login` - Authenticate user and create session
- `POST /api/logout` - Destroy user session
- `GET /api/auth/check` - Check if user is authenticated

### Protected Endpoints (Require Authentication)
- `POST /save` - Save a new report
- `GET /reports` - Fetch all reports (JSON)
- `GET /download` - Download reports as Excel file

### Public Routes
- `GET /` - Login page (redirects to index.html if authenticated)
- `GET /login.html` - Login page
- `GET /signup.html` - Signup page

## Authentication Flow
1. Users must sign up or log in to access the application
2. Sessions are managed server-side with SQLite storage
3. All report routes are protected with authentication middleware
4. Unauthenticated requests to protected routes return 401 and redirect to login
5. Users can logout to end their session

## Environment Variables
- `SESSION_SECRET` - Secret key for session encryption (required for production)
- `PORT` - Server port (defaults to 5000)
