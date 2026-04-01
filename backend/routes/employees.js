const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const Employee = require("../models/Employee");


// ==============================
// Add New Employee
// ==============================
router.post("/", async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      department,
      designation,
      salary,
      role,
      phone,
      bloodGroup,
      manager,
      shift,
      location,
      dateOfJoining,
      emergencyContactName,
      emergencyContactPhone,
      emergencyContactRelation
    } = req.body;

    const existing = await Employee.findOne({ email });
    if (existing) {
      return res.status(400).json({ message: "Employee already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newEmployee = new Employee({
      name,
      email,
      password: hashedPassword,
      department,
      designation,
      salary,
      role: role || "employee",
      phone,
      bloodGroup,
      manager,
      shift,
      location,
      dateOfJoining,
      emergencyContactName,
      emergencyContactPhone,
      emergencyContactRelation
    });

    await newEmployee.save();

    res.status(201).json({
      message: "Employee added successfully",
      employee: newEmployee
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error adding employee" });
  }
});


// ==============================
// Get All Employees
// ==============================
router.get("/", async (req, res) => {
  try {
    const employees = await Employee.find().select("-password");
    res.json(employees);
  } catch (error) {
    res.status(500).json({ message: "Error fetching employees" });
  }
});


// ==============================
// Get Logged In Employee Profile
// ==============================
router.get("/me", async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader)
      return res.status(401).json({ message: "No token provided" });

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, "supersecretkey");

    const user = await Employee.findById(decoded.id).select("-password");

    res.json(user);

  } catch (error) {
    res.status(401).json({ message: "Invalid token" });
  }
});


// ==============================
// Update Logged In Employee
// ==============================
router.put("/me", async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader)
      return res.status(401).json({ message: "No token provided" });

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, "supersecretkey");

    const updatedUser = await Employee.findByIdAndUpdate(
      decoded.id,
      req.body,
      { new: true }
    ).select("-password");

    res.json({
      message: "Profile updated successfully",
      user: updatedUser
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error updating profile" });
  }
});


// ==============================
// Update Employee (Admin)
// ==============================
router.put("/:id", async (req, res) => {
  try {
    const updatedEmployee = await Employee.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    ).select("-password");

    res.json({
      message: "Employee updated successfully",
      employee: updatedEmployee
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error updating employee" });
  }
});


const multer = require("multer");
const path = require("path");

// ==============================
// Multer Configuration
// ==============================
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});
const upload = multer({ storage });

// ==============================
// Profile Picture Upload
// ==============================
router.post("/me/profile-picture", upload.single("profilePicture"), async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader)
      return res.status(401).json({ message: "No token provided" });

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, "supersecretkey");

    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const baseUrl = process.env.BASE_URL || "https://employee-attendance-payroll-a9xi.onrender.com";
    const filePath = `${baseUrl}/uploads/${req.file.filename}`;
    const updatedUser = await Employee.findByIdAndUpdate(
      decoded.id,
      { profilePicture: filePath },
      { new: true }
    ).select("-password");

    res.json({
      message: "Profile picture updated",
      user: updatedUser
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Upload failed" });
  }
});

module.exports = router;