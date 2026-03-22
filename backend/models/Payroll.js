const mongoose = require("mongoose");

const payrollSchema = new mongoose.Schema({
    employeeEmail: { type: String, required: true },
    month: { type: String, required: true },
    year: { type: Number, required: true },
    baseSalary: { type: Number, required: true },
    workingDays: { type: Number, required: true },
    presentDays: { type: Number, required: true },
    absentDays: { type: Number, required: true },
    overtimeHours: { type: Number, required: true },
    bonus: { type: Number, default: 0 },
    deductions: { type: Number, default: 0 },
    deductionReason: { type: String, default: "" },
    netSalary: { type: Number, required: true },
    generatedDate: { type: Date }
});

module.exports = mongoose.model("Payroll", payrollSchema);