const express = require("express");
const router = express.Router();
const Employee = require("../models/Employee");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await Employee.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }

    // Compare password (works for both hashed & plain temporarily)
    const isMatch =
      user.password.startsWith("$2a") || user.password.startsWith("$2b")
        ? await bcrypt.compare(password, user.password)
        : password === user.password;

    if (!isMatch) {
      return res.status(400).json({ message: "Invalid password" });
    }

    const token = jwt.sign(
      { id: user._id, email: user.email },
      "supersecretkey",
      { expiresIn: "1d" }
    );

    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        department: user.department,
        designation: user.designation,
        location: user.location,
        shift: user.shift,
        role: user.role
      }
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Login error" });
  }
});

module.exports = router;