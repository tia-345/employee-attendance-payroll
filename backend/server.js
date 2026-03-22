require("dotenv").config();

const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");

const path = require("path");

const errorHandler = require("./middleware/errorHandler");

const app = express();


// =============================
// Middleware
// =============================

app.use(cors());              // Enable CORS
app.use(express.json());      // Parse JSON
app.use("/uploads", express.static(path.join(__dirname, "uploads"))); // Serve uploads


// =============================
// MongoDB Connection
// =============================

mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log("MongoDB Connected ✅");
  })
  .catch((err) => {
    console.error("MongoDB Connection Error ❌", err);
  });


// =============================
// Routes
// =============================

app.use("/api/employees", require("./routes/employees"));
app.use("/api/attendance", require("./routes/attendance"));
app.use("/api/auth", require("./routes/auth"));
app.use("/api/payroll", require("./routes/payroll"));


// =============================
// Test Route
// =============================

app.get("/", (req, res) => {
  res.send("Backend + MongoDB is running 🚀");
});


// =============================
// Error Handler (MUST BE LAST)
// =============================

app.use(errorHandler);


// =============================
// Start Server
// =============================

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT} 🚀`);
});