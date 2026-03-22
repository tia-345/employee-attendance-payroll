const express = require("express");
const router = express.Router();
const multer = require("multer");
const XLSX = require("xlsx");
const jwt = require("jsonwebtoken");

const Attendance = require("../models/Attendance");
const Employee = require("../models/Employee");

// =======================
// Multer Storage Config
// =======================
const upload = multer({
  dest: "./uploads"
});

// =======================
// Helper: Calculate Hours
// =======================
function calculateHours(checkIn, checkOut) {
  const inTime = new Date(`1970-01-01T${checkIn}`);
  const outTime = new Date(`1970-01-01T${checkOut}`);

  const diff = (outTime - inTime) / (1000 * 60 * 60);
  return diff > 0 ? diff : 0;
}

// =======================
// Upload Excel Attendance
// =======================
router.post("/upload", upload.single("file"), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: "No file uploaded" });
  }

  try {
    const workbook = XLSX.readFile(req.file.path);
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const data = XLSX.utils.sheet_to_json(sheet);

    for (let row of data) {
      const hours = calculateHours(row.CheckIn, row.CheckOut);

      let status = "Absent";
      if (hours >= 8) status = "Full Day";
      else if (hours >= 4) status = "Half Day";

      await Attendance.create({
        employeeEmail: row.Email,
        date: row.Date,
        checkIn: row.CheckIn,
        checkOut: row.CheckOut,
        hoursWorked: hours,
        status: status
      });
    }

    res.json({ message: "Attendance uploaded successfully" });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error uploading file" });
  }
});

// =======================
// Get Attendance For Logged In User
// =======================
router.get("/my", async (req, res) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res.status(401).json({ message: "No token provided" });
    }

    const token = authHeader.split(" ")[1];

    const decoded = jwt.verify(token, "supersecretkey");

    // Fetch logged in user
    const user = await Employee.findById(decoded.id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Fetch attendance by email
    const attendance = await Attendance.find({
      employeeEmail: user.email
    }).sort({ date: 1 });

    res.json(attendance);

  } catch (error) {
    console.error(error);
    res.status(401).json({ message: "Invalid token" });
  }
});

// =======================
// Add Manual Attendance (Punch)
// =======================
router.post("/punch", async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) return res.status(401).json({ message: "No token provided" });

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, "supersecretkey");
    const user = await Employee.findById(decoded.id);

    const { date, checkIn, checkOut } = req.body;
    if (!date || !checkIn || !checkOut) {
      return res.status(400).json({ message: "Date, Check-In and Check-Out are required" });
    }

    const hours = calculateHours(checkIn, checkOut);
    
    // Auto-status logic
    let status = "Absent";
    if (hours >= 8) status = "Full Day";
    else if (hours >= 4) status = "Half Day";

    const newAttendance = new Attendance({
      employeeEmail: user.email,
      date,
      checkIn,
      checkOut,
      hoursWorked: hours.toFixed(2),
      status
    });

    await newAttendance.save();
    res.status(201).json({ message: "Attendance recorded successfully", data: newAttendance });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error recording attendance" });
  }
});

module.exports = router;