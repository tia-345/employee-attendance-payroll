import React, { useState } from "react";
import jsPDF from "jspdf";
import "jspdf-autotable";

function AdminReports() {
  const [reportType, setReportType] = useState("Employee Directory");
  const [format, setFormat] = useState("pdf");
  const [loading, setLoading] = useState(false);

  const reportOptions = [
    { title: "Employee Directory", desc: "Complete census of all staff roles, salaries, and contacts.", icon: "👥" },
    { title: "Payroll Summary", desc: "Full history of salaries, bonuses, and tax deductions.", icon: "💰" },
    { title: "Attendance Logs", desc: "Raw punch-in/out logs for all active staff members.", icon: "📊" }
  ];

  // 🔹 GENERATE REPORT
  const handleGenerate = async () => {
    setLoading(true);
    try {
      let data = [];
      let headers = [];
      let rows = [];

      if (reportType === "Employee Directory") {
        const res = await fetch("http://localhost:5000/api/employees");
        data = await res.json();
        headers = ["Name", "Email", "Role", "Department", "Designation", "Salary"];
        rows = data.map(emp => [
          emp.name || "-",
          emp.email || "-",
          emp.role?.toUpperCase() || "-",
          emp.department || "-",
          emp.designation || "-",
          `INR ${emp.salary || 0}`
        ]);
      }
      else if (reportType === "Payroll Summary") {
        const res = await fetch("http://localhost:5000/api/payroll");
        data = await res.json();
        // Sort chronologically if needed, but endpoint usually does it
        headers = ["Month/Year", "Employee Email", "Base Salary", "Attendance", "OT Hrs", "Bonus", "Deductions", "Deduction Reason", "Net Deposit"];
        rows = data.map(p => [
          `${p.month} ${p.year}`,
          p.employeeEmail || p.email || "-",
          `INR ${p.baseSalary || 0}`,
          `${p.presentDays}P / ${p.absentDays}A`,
          p.overtimeHours || 0,
          `INR ${p.bonus || 0}`,
          `INR ${p.deductions || 0}`,
          p.deductionReason || "-",
          `INR ${p.netSalary || 0}`
        ]);
      }
      else if (reportType === "Attendance Logs") {
        const res = await fetch("http://localhost:5000/api/attendance");
        data = await res.json();
        headers = ["Date", "Employee Email", "Status", "Check In", "Check Out", "Hrs Worked"];
        rows = data.map(a => [
          a.date || "-",
          a.employeeEmail || "-",
          a.status?.toUpperCase() || "-",
          a.checkInTime || "-",
          a.checkOutTime || "-",
          a.hoursWorked || 0
        ]);
      }

      if (data.length === 0) {
        alert(`No data found for ${reportType} in the database.`);
        setLoading(false);
        return;
      }

      // Execute format specific download
      if (format === "pdf") {
        generatePDF(headers, rows);
      } else {
        generateCSV(headers, rows);
      }

    } catch (err) {
      console.error(err);
      alert("Failed to fetch data from the server. Ensure the backend is running.");
    } finally {
      setLoading(false);
    }
  };

  // 📄 PDF (Using jsPDF AutoTable)
  const generatePDF = (headers, rows) => {
    const doc = new jsPDF("landscape");

    // Header
    doc.setFontSize(22);
    doc.setTextColor(2, 132, 199); // Brand Blue
    doc.text("ClockIn Corporate", 14, 20);

    doc.setFontSize(14);
    doc.setTextColor(71, 85, 105);
    doc.text(`${reportType} Report`, 14, 30);
    doc.setFontSize(10);
    doc.text(`Generated on: ${new Date().toLocaleString()}`, 14, 38);
    doc.text(`Total Records: ${rows.length}`, 14, 44);

    // Auto Table
    doc.autoTable({
      startY: 50,
      head: [headers],
      body: rows,
      theme: "striped",
      headStyles: { fillColor: [2, 132, 199] }, // Blue headers
      styles: { fontSize: 9, cellPadding: 4 },
      alternateRowStyles: { fillColor: [248, 250, 252] }
    });

    doc.save(`ClockIn_${reportType.replace(" ", "_")}.pdf`);
  };

  // 📊 CSV / XLSX
  const generateCSV = (headers, rows) => {
    let csvContent = headers.join(",") + "\n";
    rows.forEach(row => {
      // Escape commas in strings
      let formattedRow = row.map(cell => typeof cell === "string" && cell.includes(",") ? `"${cell}"` : cell);
      csvContent += formattedRow.join(",") + "\n";
    });

    const blob = new Blob([csvContent], { type: format === "xlsx" ? "application/vnd.ms-excel" : "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `ClockIn_${reportType.replace(" ", "_")}.${format}`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div style={styles.page}>
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>Analytics & Data Export</h1>
          <p style={styles.subtitle}>Download true operational data straight from the server.</p>
        </div>
        <div style={styles.liveBadge}>
          <span style={styles.pulseDot}>●</span> Secure Database Connection
        </div>
      </div>

      <div style={styles.mainGrid}>
        <div style={styles.generatorPanel}>
          <h3 style={styles.panelTitle}>Available Data Vectors</h3>

          <div style={styles.optionsGrid}>
            {reportOptions.map(opt => (
              <div
                key={opt.title}
                style={{
                  ...styles.reportCard,
                  borderColor: reportType === opt.title ? "#0284c7" : "#e2e8f0",
                  backgroundColor: reportType === opt.title ? "#f0f9ff" : "#ffffff",
                }}
                onClick={() => setReportType(opt.title)}
              >
                <div style={styles.cardHeader}>
                  <span style={styles.cardIcon}>{opt.icon}</span>
                  <div style={styles.radioPlaceholder}>
                    {reportType === opt.title && <div style={styles.radioDot} />}
                  </div>
                </div>
                <h4 style={styles.cardTitle}>{opt.title}</h4>
                <p style={styles.cardDesc}>{opt.desc}</p>
              </div>
            ))}
          </div>

          <div style={styles.configBox}>
            <div style={styles.configHeader}>
              <h4 style={styles.configTitle}>Export Configuration</h4>
            </div>

            <label style={styles.label}>Select File Format</label>
            <select style={styles.input} onChange={(e) => setFormat(e.target.value)} value={format}>
              <option value="pdf">📄 PDF Document (Formatted & Printable)</option>
              <option value="csv">📊 CSV Spreadsheet (Raw Data)</option>
              <option value="xlsx">📗 XLSX (Excel Compatible)</option>
            </select>

            <button
              style={{ ...styles.generateBtn, opacity: loading ? 0.7 : 1 }}
              onClick={handleGenerate}
              disabled={loading}
            >
              {loading ? "Querying Database..." : `Compile & Download ${reportType}`}
            </button>
          </div>
        </div>

        <div style={styles.sidePanel}>
          <div style={styles.infoCard}>
            <h3 style={styles.panelTitle}>About Data Exports</h3>
            <p style={styles.infoText}>
              All reports are generated in real-time by querying the live MongoDB collections.
              PDFs are generated utilizing <strong>jsPDF-AutoTable</strong>, ensuring headers, pagination, and data rows are perfectly formatted for professional auditing.
            </p>
            <p style={styles.infoText}>
              The CSV option provides raw, comma-separated values ideal for importing into external Business Intelligence (BI) tools, ERPs, or custom pivot tables.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

const styles = {
  page: { padding: "40px", maxWidth: "1300px", margin: "0 auto", color: "#1e293b", minHeight: "100vh" },
  header: { display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: "40px" },
  title: { fontSize: "36px", fontWeight: "900", margin: "0 0 8px", color: "#0f172a", letterSpacing: "-0.5px" },
  subtitle: { color: "#475569", margin: 0, fontSize: "16px" },

  liveBadge: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    background: "#dcfce7",
    color: "#166534",
    padding: "8px 16px",
    borderRadius: "20px",
    fontSize: "13px",
    fontWeight: "700"
  },
  pulseDot: { color: "#22c55e", fontSize: "10px" },

  mainGrid: { display: "grid", gridTemplateColumns: "1.8fr 1fr", gap: "30px" },
  generatorPanel: { background: "#ffffff", padding: "35px", borderRadius: "24px", border: "1px solid #e2e8f0", boxShadow: "0 10px 15px -3px rgba(0,0,0,0.02)" },
  panelTitle: { color: "#0284c7", marginBottom: "20px", fontSize: "20px", fontWeight: "800", marginTop: 0 },

  optionsGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "20px" },
  reportCard: {
    padding: "24px",
    border: "2px solid #e2e8f0",
    borderRadius: "16px",
    cursor: "pointer",
    transition: "all 0.2s"
  },
  cardHeader: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" },
  cardIcon: { fontSize: "28px" },
  radioPlaceholder: { width: "18px", height: "18px", borderRadius: "50%", border: "2px solid #0284c7", display: "flex", alignItems: "center", justifyContent: "center" },
  radioDot: { width: "10px", height: "10px", borderRadius: "50%", background: "#0284c7" },
  cardTitle: { margin: "0 0 8px", fontSize: "16px", fontWeight: "800", color: "#0f172a" },
  cardDesc: { margin: 0, fontSize: "13px", color: "#64748b", lineHeight: "1.5" },

  configBox: { marginTop: "35px", background: "#f8fafc", padding: "25px", borderRadius: "16px", border: "1px solid #e2e8f0" },
  configHeader: { marginBottom: "16px" },
  configTitle: { margin: 0, fontSize: "16px", fontWeight: "700", color: "#0f172a" },
  label: { fontSize: "12px", color: "#475569", fontWeight: "700", textTransform: "uppercase", letterSpacing: "1px" },
  input: { width: "100%", padding: "16px", marginTop: "8px", marginBottom: "20px", borderRadius: "12px", border: "1px solid #cbd5e1", outline: "none", fontSize: "15px", fontWeight: "600", color: "#1e293b", background: "#ffffff" },

  generateBtn: {
    width: "100%",
    padding: "16px",
    background: "linear-gradient(135deg, #0284c7, #4f46e5)",
    color: "#ffffff",
    border: "none",
    borderRadius: "12px",
    fontWeight: "800",
    fontSize: "16px",
    cursor: "pointer",
    boxShadow: "0 4px 6px -1px rgba(2, 132, 199, 0.3)"
  },

  sidePanel: { display: "flex", flexDirection: "column", gap: "20px" },
  infoCard: { background: "#ffffff", borderRadius: "24px", padding: "35px", border: "1px solid #e2e8f0", boxShadow: "0 10px 15px -3px rgba(0,0,0,0.02)" },
  infoText: { color: "#475569", fontSize: "15px", lineHeight: "1.6", marginBottom: "16px" }
};

export default AdminReports;
