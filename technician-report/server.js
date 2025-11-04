// server.js
const express = require("express");
const sqlite3 = require("sqlite3").verbose();
const XLSX = require("xlsx");
const path = require("path");
const bcrypt = require("bcrypt");
const session = require("express-session");
const SQLiteStore = require("connect-sqlite3")(session);

const app = express();
app.use(express.json());

// Session middleware
app.use(session({
  store: new SQLiteStore({
    db: 'sessions.db',
    dir: __dirname
  }),
  secret: process.env.SESSION_SECRET || 'technician-report-secret-key-change-in-production',
  resave: false,
  saveUninitialized: false,
  cookie: {
    maxAge: 7 * 24 * 60 * 60 * 1000, // 1 week
    httpOnly: true,
    secure: false // Set to true in production with HTTPS
  }
}));

app.use(express.static("public"));

const DB_FILE = path.join(__dirname, "technician.db");
const EXCEL_FILE = path.join(__dirname, "Technician_Report.xlsx");

// Initialize database
const db = new sqlite3.Database(DB_FILE, (err) => {
  if (err) console.error("❌ Database error:", err);
  else console.log("✅ SQLite database connected.");
});

// Create tables if not exists
db.run(`CREATE TABLE IF NOT EXISTS reports (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  location TEXT,
  date TEXT,
  machineNumber TEXT,
  technicianName TEXT,
  problemSolved TEXT
)`);

db.run(`CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT UNIQUE NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
)`);

// Authentication middleware
const isAuthenticated = (req, res, next) => {
  if (req.session && req.session.userId) {
    return next();
  }
  res.status(401).json({ message: "Unauthorized. Please log in." });
};

// Auth routes
app.post("/api/signup", async (req, res) => {
  const { username, email, password } = req.body;
  
  if (!username || !email || !password) {
    return res.status(400).json({ message: "All fields are required." });
  }

  if (password.length < 6) {
    return res.status(400).json({ message: "Password must be at least 6 characters." });
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    
    db.run(
      `INSERT INTO users (username, email, password) VALUES (?, ?, ?)`,
      [username, email, hashedPassword],
      function (err) {
        if (err) {
          if (err.message.includes("UNIQUE")) {
            return res.status(400).json({ message: "Username or email already exists." });
          }
          return res.status(500).json({ message: "Error creating account." });
        }
        
        req.session.userId = this.lastID;
        req.session.username = username;
        res.json({ message: "Account created successfully!", username });
      }
    );
  } catch (error) {
    res.status(500).json({ message: "Error creating account." });
  }
});

app.post("/api/login", (req, res) => {
  const { username, password } = req.body;
  
  if (!username || !password) {
    return res.status(400).json({ message: "Username and password are required." });
  }

  db.get(
    `SELECT * FROM users WHERE username = ?`,
    [username],
    async (err, user) => {
      if (err) {
        return res.status(500).json({ message: "Database error." });
      }
      
      if (!user) {
        return res.status(401).json({ message: "Invalid username or password." });
      }

      try {
        const match = await bcrypt.compare(password, user.password);
        
        if (!match) {
          return res.status(401).json({ message: "Invalid username or password." });
        }

        req.session.userId = user.id;
        req.session.username = user.username;
        res.json({ message: "Login successful!", username: user.username });
      } catch (error) {
        res.status(500).json({ message: "Authentication error." });
      }
    }
  );
});

app.post("/api/logout", (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json({ message: "Error logging out." });
    }
    res.json({ message: "Logged out successfully." });
  });
});

app.get("/api/auth/check", (req, res) => {
  if (req.session && req.session.userId) {
    res.json({ authenticated: true, username: req.session.username });
  } else {
    res.json({ authenticated: false });
  }
});

// Protected report routes
app.post("/save", isAuthenticated, (req, res) => {
  const { location, date, machineNumber, technicianName, problemSolved } = req.body;
  if (!location || !date || !machineNumber || !technicianName || !problemSolved)
    return res.status(400).json({ message: "All fields are required." });

  const stmt = db.prepare(`INSERT INTO reports (location, date, machineNumber, technicianName, problemSolved)
                           VALUES (?, ?, ?, ?, ?)`);
  stmt.run(location, date, machineNumber, technicianName, problemSolved, function (err) {
    if (err) return res.status(500).json({ message: "Error saving data." });
    res.json({ message: "Report saved successfully!" });
  });
});

app.get("/reports", isAuthenticated, (req, res) => {
  db.all("SELECT * FROM reports ORDER BY id DESC", [], (err, rows) => {
    if (err) return res.status(500).json({ message: "Database read error." });
    res.json(rows);
  });
});

app.get("/download", isAuthenticated, (req, res) => {
  db.all("SELECT * FROM reports ORDER BY id ASC", [], (err, rows) => {
    if (err || !rows.length) return res.status(404).send("No data to export.");

    const sheetData = [
      ["ID", "Location", "Date", "Machine Number", "Technician Name", "Problem Solved"],
      ...rows.map(r => [r.id, r.location, r.date, r.machineNumber, r.technicianName, r.problemSolved])
    ];

    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.aoa_to_sheet(sheetData);
    XLSX.utils.book_append_sheet(wb, ws, "Reports");
    XLSX.writeFile(wb, EXCEL_FILE);

    res.download(EXCEL_FILE);
  });
});

// Public routes
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "login.html"));
});

app.get("/login.html", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "login.html"));
});

app.get("/signup.html", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "signup.html"));
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, '0.0.0.0', () => console.log(`🚀 Server running at http://0.0.0.0:${PORT}`));
