const mongoose = require("mongoose");

const employeeSchema = new mongoose.Schema(
  {
    // ================= BASIC INFO =================
    name: {
      type: String,
      required: true,
      trim: true
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true
    },

    password: {
      type: String,
      required: true
    },

    role: {
      type: String,
      enum: ["employee", "admin"],
      default: "employee"
    },

    // ================= JOB INFO =================
    department: {
      type: String,
      required: true
    },

    designation: {
      type: String,
      required: true
    },

    salary: {
      type: Number,
      required: true,
      min: 0
    },

    manager: {
      type: String
    },

    shift: {
      type: String
    },

    location: {
      type: String
    },

    dateOfJoining: {
      type: Date
    },

    // ================= PERSONAL INFO =================
    phone: {
      type: String
    },

    bloodGroup: {
      type: String
    },

    // ================= EMERGENCY CONTACT =================
    emergencyContactName: {
      type: String
    },

    emergencyContactPhone: {
      type: String
    },

    emergencyContactRelation: {
      type: String
    },

    // ================= PROFILE PICTURE =================
    profilePicture: {
      type: String
    }
  },
  {
    timestamps: true // automatically adds createdAt and updatedAt
  }
);

module.exports = mongoose.model("Employee", employeeSchema);