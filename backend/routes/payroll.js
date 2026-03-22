const express = require("express");
const router = express.Router();

const Payroll = require("../models/Payroll");
const Employee = require("../models/Employee");
const Attendance = require("../models/Attendance");


// ==============================
// Helper: Calculate Payroll
// ==============================

function calculatePayroll(employee, attendanceRecords, month, year) {

    const fullDays = attendanceRecords.filter(r => r.status === "Full Day").length;
    const halfDays = attendanceRecords.filter(r => r.status === "Half Day").length;
    const absentDays = attendanceRecords.filter(r => r.status === "Absent").length;

    const presentDays = fullDays + (halfDays * 0.5);
    const totalDaysRecorded = attendanceRecords.length || 1;

    const overtimeHours = attendanceRecords.reduce((sum, r) => {
        const hrs = r.hoursWorked || 0;
        return sum + (hrs > 8 ? hrs - 8 : 0);
    }, 0); 

    const baseSalary = employee.salary || 0;
    // Standard monthly divisor (30 days) to ensure attendance increases salary correctly
    const dailySalary = baseSalary / 30;
    const salaryForPresentDays = dailySalary * presentDays;
    const overtimePay = overtimeHours * (dailySalary / 8) * 1.5;

    const bonus = 0;
    const deductions = 0;
    const netSalary = salaryForPresentDays + overtimePay + bonus - deductions;

    return {
        employeeId: employee._id,
        employeeName: employee.name,
        employeeEmail: employee.email,
        month,
        year,
        baseSalary,
        workingDays: totalDaysRecorded,
        presentDays,
        absentDays,
        overtimeHours,
        overtimePay,
        deductions,
        deductionReason: "",
        bonus,
        netSalary: Number(netSalary).toFixed(2),
        generatedDate: new Date()
    };
}


// ==============================
// POST: Generate Payroll
// ==============================

router.post("/generate", async (req, res) => {

    try {

        const { month, year } = req.body;

        if (!month || !year) {
            return res.status(400).json({ message: "Month and year are required" });
        }

        const employees = await Employee.find();

        const payrolls = [];

        const monthIndex = new Date(Date.parse(month + " 1, 2020")).getMonth() + 1;

        const monthStr = monthIndex.toString().padStart(2, "0");

        for (const emp of employees) {

            const attendance = await Attendance.find({
                employeeEmail: emp.email,
                date: { $regex: `^${year}-${monthStr}` }
            });

            const payrollData = calculatePayroll(emp, attendance, month, year);

            const payrollDoc = new Payroll(payrollData);

            await payrollDoc.save();

            payrolls.push(payrollDoc);
        }

        res.status(201).json(payrolls);

    } catch (err) {

        console.error(err);

        res.status(500).json({ message: "Error generating payroll" });

    }

});


// ==============================
// GET: All Payroll Records
// ==============================

router.get("/", async (req, res) => {

    try {

        const payrolls = await Payroll.find().sort({ generatedDate: -1 });

        res.json(payrolls);

    } catch (err) {

        console.error(err);

        res.status(500).json({ message: "Error fetching payroll records" });

    }

});


// ==============================
// GET: Payroll for Employee
// ==============================

router.get("/:employeeId", async (req, res) => {

    try {

        const payrolls = await Payroll.find({
            employeeId: req.params.employeeId
        }).sort({ generatedDate: -1 });

        res.json(payrolls);

    } catch (err) {

        console.error(err);

        res.status(500).json({ message: "Error fetching employee payroll" });

    }

});


// ==============================
// DELETE Payroll
// ==============================

router.delete("/:id", async (req, res) => {

    try {

        await Payroll.findByIdAndDelete(req.params.id);

        res.json({ message: "Payroll record deleted successfully" });

    } catch (err) {

        console.error(err);

        res.status(500).json({ message: "Error deleting payroll record" });

    }

});

// ==============================
// PUT: Update Payroll
// ==============================

router.put("/:id", async (req, res) => {
    try {
        const { baseSalary, presentDays, absentDays, overtimeHours, bonus, deductions, deductionReason, netSalary } = req.body;

        const updatedPayroll = await Payroll.findByIdAndUpdate(
            req.params.id,
            { baseSalary, presentDays, absentDays, overtimeHours, bonus, deductions, deductionReason, netSalary },
            { new: true }
        );

        if (!updatedPayroll) return res.status(404).json({ message: "Payroll not found" });

        res.json(updatedPayroll);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Error updating payroll" });
    }
});

module.exports = router;