const mongoose = require("mongoose");

const attendanceSchema = new mongoose.Schema({
  employeeEmail: {
    type: String,
    required: true
  },
  date: {
    type: String,
    required: true
  },
  checkIn: {
    type: String,
    required: true
  },
  checkOut: {
    type: String,
    required: true
  },
  hoursWorked: {
    type: Number
  },
  status: {
    type: String
  }
});

module.exports = mongoose.model("Attendance", attendanceSchema);