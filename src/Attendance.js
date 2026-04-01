import React, { useState, useEffect } from "react";
import API_URL from "./apiConfig";


function Attendance() {
  const [records, setRecords] = useState([]);

  const [formData, setFormData] = useState({
    date: new Date().toISOString().split("T")[0],
    checkIn: "09:00",
    checkOut: "18:00"
  });
  const [loading, setLoading] = useState(false);

  const fetchRecords = () => {
    const token = localStorage.getItem("token");
    fetch(`${API_URL}/api/attendance/my`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => setRecords(data))
      .catch(err => console.error(err));
  };

  useEffect(() => {
    fetchRecords();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const calculateAutoStatus = (cIn, cOut) => {
    const inT = new Date(`1970-01-01T${cIn}`);
    const outT = new Date(`1970-01-01T${cOut}`);
    const diff = (outT - inT) / (1000 * 60 * 60);
    if (diff >= 8) return "Full Day";
    if (diff >= 4) return "Half Day";
    return "Insufficient Hours";
  };

  const currentStatus = calculateAutoStatus(formData.checkIn, formData.checkOut);

  const handlePunch = async (e) => {
    e.preventDefault();
    setLoading(true);
    const token = localStorage.getItem("token");

    try {
      const res = await fetch(`${API_URL}/api/attendance/punch`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });
      const data = await res.json();
      if (res.ok) {
        alert("Attendance Recorded!");
        fetchRecords();
      } else {
        alert(data.message || "Error recorded attendance");
      }
    } catch (err) {
      alert("Connection Error");
    } finally {
      setLoading(false);
    }
  };

  const handleExportCSV = () => {
    if (records.length === 0) {
      alert("No attendance data available.");
      return;
    }

    const headers = ["Date", "Status", "Check In", "Check Out", "Hours"];
    const rows = records.map(r => [
      r.date,
      r.status,
      r.checkIn,
      r.checkOut,
      r.hoursWorked
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers, ...rows].map(e => e.join(",")).join("\n");

    const link = document.createElement("a");
    link.href = encodeURI(csvContent);
    link.download = "attendance_log.csv";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // ====== KPI CALCULATIONS ======
  const totalWorkingDays = records.length;
  const daysPresent = records.filter(r => r.status === "Full Day" || r.status === "Half Day").length;
  const lateMarks = records.filter(r => r.checkIn && r.checkIn > "09:15:00").length;
  const avgHours = totalWorkingDays > 0 ? (records.reduce((sum, r) => sum + (r.hoursWorked || 0), 0) / totalWorkingDays).toFixed(1) : 0;

  return (
    <div style={styles.page}>
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>Attendance Registry</h1>
          <p style={styles.subtitle}>Monthly Attendance Overview</p>
        </div>
        <button style={styles.downloadBtn} onClick={handleExportCSV}>Export Log (CSV)</button>
      </div>

      {/* PUNCH CARD SECTION */}
      <div style={styles.punchCard}>
        <h3 style={styles.cardHeaderSmall}>Digital Punch Card</h3>
        <form onSubmit={handlePunch} style={styles.punchForm}>
            <div style={styles.inputWrap}>
                <label style={styles.label}>Date</label>
                <input type="date" value={formData.date} style={styles.input} onChange={e => setFormData({...formData, date: e.target.value})} />
            </div>
            <div style={styles.inputWrap}>
                <label style={styles.label}>Check In</label>
                <input type="time" value={formData.checkIn} style={styles.input} onChange={e => setFormData({...formData, checkIn: e.target.value})} />
            </div>
            <div style={styles.inputWrap}>
                <label style={styles.label}>Check Out</label>
                <input type="time" value={formData.checkOut} style={styles.input} onChange={e => setFormData({...formData, checkOut: e.target.value})} />
            </div>
            <div style={styles.statusPreview}>
               <span style={styles.label}>Auto-Calculated Status</span>
               <div style={{...styles.badge, background: currentStatus === "Full Day" ? "#22c55e" : "#eab308"}}>
                    {currentStatus}
               </div>
            </div>
            <button type="submit" disabled={loading || currentStatus === "Insufficient Hours"} style={styles.punchBtnActive}>
                {loading ? "Recording..." : "Punch Attendance"}
            </button>
        </form>
      </div>

      {/* KPI SECTION */}
      <div style={styles.kpiRibbon}>
        <div style={styles.kpiItem}>
          <span style={styles.kpiLabel}>Total Days</span>
          <span style={styles.kpiValue}>{totalWorkingDays}</span>
        </div>

        <div style={styles.kpiItem}>
          <span style={styles.kpiLabel}>Days Present</span>
          <span style={{ ...styles.kpiValue, color: "#22c55e" }}>
            {daysPresent}
          </span>
        </div>

        <div style={styles.kpiItem}>
          <span style={styles.kpiLabel}>Late Marks</span>
          <span style={{ ...styles.kpiValue, color: "#eab308" }}>
            {lateMarks}
          </span>
        </div>

        <div style={styles.kpiItem}>
          <span style={styles.kpiLabel}>Avg. Daily Hours</span>
          <span style={{ ...styles.kpiValue, color: "#0284c7" }}>
            {avgHours}h
          </span>
        </div>
      </div>

      {/* TABLE */}
      <div style={styles.tableCard}>
        <table style={styles.table}>
          <thead>
            <tr style={styles.tableHeader}>
              <th style={{ paddingLeft: "20px" }}>Date</th>
              <th>Status</th>
              <th>Shift In</th>
              <th>Shift Out</th>
              <th>Total Hours</th>
            </tr>
          </thead>

          <tbody>
            {records.map((rec, i) => (
              <tr key={i} style={styles.row}>
                <td style={{ paddingLeft: "20px", fontWeight: "600" }}>
                  {rec.date}
                </td>

                <td>
                  <span
                    style={
                      rec.status === "Full Day"
                        ? styles.tagPresent
                        : rec.status === "Half Day"
                        ? styles.tagHalf
                        : styles.tagAbsent
                    }
                  >
                    {rec.status}
                  </span>
                </td>

                <td style={styles.timeText}>{rec.checkIn}</td>
                <td style={styles.timeText}>{rec.checkOut}</td>
                <td style={{ fontWeight: "700", color: "#0284c7" }}>
                  {rec.hoursWorked}h
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div style={styles.policyFooter}>
        <h4 style={{ color: "#0284c7", marginBottom: "10px" }}>
          Attendance Policy
        </h4>
        <p>• Standard shift: 09:00 AM – 06:00 PM</p>
        <p>• After 09:15 AM → Late Mark</p>
        <p>• 8+ hours → Full Day</p>
        <p>• 4–7 hours → Half Day</p>
      </div>
    </div>
  );
}

const styles = {
  page: { padding: "40px", maxWidth: "1200px", margin: "0 auto", color: "#1e293b" },
  header: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "30px" },
  title: { fontSize: "28px", fontWeight: "800", margin: 0 },
  subtitle: { color: "#475569", fontSize: "14px" },
  downloadBtn: { background: "transparent", border: "1px solid #94a3b8", color: "#0284c7", padding: "10px 20px", borderRadius: "8px", cursor: "pointer", fontWeight: "600" },

  kpiRibbon: { display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "20px", marginBottom: "30px", background: "#ffffff", padding: "20px", borderRadius: "16px", border: "1px solid #cbd5e1" },
  kpiItem: { display: "flex", flexDirection: "column", gap: "5px" },
  kpiLabel: { fontSize: "11px", color: "#475569", fontWeight: "800", textTransform: "uppercase" },
  kpiValue: { fontSize: "24px", fontWeight: "800" },

  tableCard: { background: "#ffffff", border: "1px solid #cbd5e1", borderRadius: "16px", overflow: "hidden" },
  table: { width: "100%", borderCollapse: "collapse", textAlign: "left" },
  tableHeader: { background: "#e2e8f0", height: "50px", fontSize: "12px", color: "#475569", textTransform: "uppercase" },
  row: { borderBottom: "1px solid #cbd5e1", height: "65px", fontSize: "14px" },
  timeText: { color: "#475569", fontFamily: "monospace" },

  tagPresent: { background: "rgba(34,197,94,0.15)", color: "#22c55e", padding: "5px 12px", borderRadius: "6px", fontSize: "12px", fontWeight: "bold" },
  tagHalf: { background: "rgba(234,179,8,0.15)", color: "#eab308", padding: "5px 12px", borderRadius: "6px", fontSize: "12px", fontWeight: "bold" },
  tagAbsent: { background: "rgba(239,68,68,0.15)", color: "#ef4444", padding: "5px 12px", borderRadius: "6px", fontSize: "12px", fontWeight: "bold" },

  policyFooter: { marginTop: "30px", padding: "25px", background: "#f1f5f9", border: "1px solid #cbd5e1", borderRadius: "16px", fontSize: "13px", color: "#475569", lineHeight: "1.8" },
  
  // NEW STYLES
  punchCard: { background: "#ffffff", border: "1px solid #cbd5e1", borderRadius: "20px", padding: "30px", marginBottom: "30px", boxShadow: "0 10px 15px -3px rgba(0,0,0,0.05)" },
  cardHeaderSmall: { margin: "0 0 20px 0", fontSize: "18px", fontWeight: "800", color: "#0f172a" },
  punchForm: { display: "flex", gap: "25px", alignItems: "flex-end", flexWrap: "wrap" },
  inputWrap: { display: "flex", flexDirection: "column", gap: "8px" },
  label: { fontSize: "12px", fontWeight: "700", color: "#64748b", textTransform: "uppercase" },
  input: { padding: "12px 16px", borderRadius: "10px", border: "1px solid #cbd5e1", outline: "none", fontSize: "14px", fontWeight: "600", color: "#1e293b", background: "#f8fafc" },
  statusPreview: { display: "flex", flexDirection: "column", gap: "8px" },
  badge: { padding: "10px 18px", borderRadius: "10px", color: "white", fontSize: "13px", fontWeight: "800", textAlign: "center", textTransform: "uppercase" },
  punchBtnActive: { 
    background: "linear-gradient(135deg, #0ea5e9, #2563eb)", 
    color: "white", 
    padding: "13px 30px", 
    borderRadius: "12px", 
    border: "none", 
    cursor: "pointer", 
    fontWeight: "800",
    fontSize: "14px",
    transition: "all 0.2s",
    boxShadow: "0 4px 6px -1px rgba(37,99,235,0.3)"
  }
};

export default Attendance;