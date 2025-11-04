// server.js
const express = require("express");
const sqlite3 = require("sqlite3").verbose();
const XLSX = require("xlsx");
const path = require("path");

const app = express();
app.use(express.json());
app.use(express.static("public"));

const DB_FILE = path.join(__dirname, "technician.db");
const EXCEL_FILE = path.join(__dirname, "Technician_Report.xlsx");

// Initialize database
const db = new sqlite3.Database(DB_FILE, (err) => {
  if (err) console.error("❌ Database error:", err);
  else console.log("✅ SQLite database connected.");
});

// Create table if not exists
db.run(`CREATE TABLE IF NOT EXISTS reports (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  location TEXT,
  date TEXT,
  machineNumber TEXT,
  technicianName TEXT,
  problemSolved TEXT
)`);

// Save new report
app.post("/save", (req, res) => {
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

// Fetch all reports
app.get("/reports", (req, res) => {
  db.all("SELECT * FROM reports ORDER BY id DESC", [], (err, rows) => {
    if (err) return res.status(500).json({ message: "Database read error." });
    res.json(rows);
  });
});

// Download as Excel
app.get("/download", (req, res) => {
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

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, '0.0.0.0', () => console.log(`🚀 Server running at http://0.0.0.0:${PORT}`));
