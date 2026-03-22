import React, { useState, useEffect } from "react";
import { FiClock, FiCalendar } from "react-icons/fi";

const initialShifts = [
  { name: "Morning Shift", timing: "09:00 AM – 05:00 PM", hours: "8 hrs", off: "Sunday", depts: ["IT", "HR", "Finance"] },
  { name: "Evening Shift", timing: "01:00 PM – 09:00 PM", hours: "8 hrs", off: "Sunday", depts: ["Support", "Operations"] }
];

const initialHolidays = [
  { date: "Jan 01, 2026", day: "Thursday", name: "New Year’s Day", type: "National", status: "Paid" },
  { date: "Jan 14, 2026", day: "Wednesday", name: "Makar Sankranti", type: "Regional", status: "Paid" },
  { date: "Jan 26, 2026", day: "Monday", name: "Republic Day", type: "National", status: "Paid" },
  { date: "Mar 25, 2026", day: "Wednesday", name: "Holi", type: "National", status: "Paid" },
  { date: "Apr 03, 2026", day: "Friday", name: "Good Friday", type: "Religious", status: "Paid" },
  { date: "Aug 15, 2026", day: "Saturday", name: "Independence Day", type: "National", status: "Paid" },
  { date: "Oct 02, 2026", day: "Friday", name: "Gandhi Jayanti", type: "National", status: "Paid" },
  { date: "Nov 09, 2026", day: "Monday", name: "Diwali", type: "National", status: "Paid" },
  { date: "Dec 25, 2026", day: "Friday", name: "Christmas", type: "National", status: "Paid" }
];

export default function ShiftsHolidays() {
  const [shifts, setShifts] = useState(initialShifts);
  const [holidays, setHolidays] = useState(initialHolidays);

  useEffect(() => {
    const savedShifts = localStorage.getItem("adminShifts");
    if (savedShifts) setShifts(JSON.parse(savedShifts));

    const savedHolidays = localStorage.getItem("adminHolidays");
    if (savedHolidays) setHolidays(JSON.parse(savedHolidays));
  }, []);

  const sortedHolidays = [...holidays].sort((a, b) => new Date(a.date) - new Date(b.date));

  return (
    <div style={styles.page}>

      {/* Header */}
      <div style={styles.header}>
        <h1 style={styles.title}>Corporate Roster</h1>
        <p style={styles.subtitle}>View your active working shift configurations and upcoming public holidays.</p>
      </div>

      {/* Main Containers */}
      <div style={styles.mainContainer}>

        {/* SHIFTS PANEL */}
        <div style={styles.panel}>
          <div style={styles.panelHeader}>
            <div style={styles.panelTitleWrap}>
              <FiClock size={18} color="#0284c7" />
              <h3 style={styles.panelTitle}>Active Shifts</h3>
            </div>
          </div>

          <div style={styles.tableWrapper}>
            <table style={styles.table}>
              <thead style={styles.thead}>
                <tr>
                  <th style={styles.th}>Shift Details</th>
                  <th style={styles.th}>Schedule</th>
                  <th style={styles.th}>Departments</th>
                </tr>
              </thead>
              <tbody>
                {shifts.map((s, i) => (
                  <tr key={i} style={styles.tr}>
                    <td style={styles.td}>
                      <div style={{ fontWeight: "700", color: "#0f172a" }}>{s.name}</div>
                      <span style={styles.hoursBadge}>{s.hours}</span>
                    </td>
                    <td style={styles.td}>
                      <div style={{ fontFamily: "monospace", fontWeight: "600", fontSize: "13px" }}>{s.timing}</div>
                      <div style={{ fontSize: "12px", color: "#64748b", marginTop: "2px" }}>Off: {s.off}</div>
                    </td>
                    <td style={styles.td}>
                      <div style={{ display: "flex", flexWrap: "wrap", gap: "4px", maxWidth: "200px" }}>
                        {s.depts && s.depts.map((d, idx) => (
                          <span key={idx} style={styles.deptTag}>{d}</span>
                        ))}
                      </div>
                    </td>
                  </tr>
                ))}
                {shifts.length === 0 && <tr><td colSpan="3" style={styles.emptyText}>No shifts configured.</td></tr>}
              </tbody>
            </table>
          </div>
        </div>

        {/* HOLIDAYS PANEL */}
        <div style={styles.panel}>
          <div style={styles.panelHeader}>
            <div style={styles.panelTitleWrap}>
              <FiCalendar size={18} color="#10b981" />
              <h3 style={styles.panelTitle}>Public Holidays Table</h3>
            </div>
          </div>

          <div style={styles.tableWrapper}>
            <table style={styles.table}>
              <thead style={styles.thead}>
                <tr>
                  <th style={styles.th}>Date</th>
                  <th style={styles.th}>Holiday Details</th>
                  <th style={styles.th}>Status</th>
                </tr>
              </thead>
              <tbody>
                {sortedHolidays.map((h, index) => (
                  <tr key={index} style={styles.tr}>
                    <td style={styles.td}>
                      <div style={{ fontWeight: "700", color: "#0f172a" }}>{h.date}</div>
                      <div style={{ fontSize: "12px", color: "#64748b" }}>{h.day}</div>
                    </td>
                    <td style={styles.td}>
                      <div style={{ fontWeight: "600", color: "#1e293b" }}>{h.name}</div>
                      <div style={{ fontSize: "11px", color: "#64748b", textTransform: "uppercase", letterSpacing: "0.5px" }}>{h.type}</div>
                    </td>
                    <td style={styles.td}>
                      <span style={h.status === "Paid" ? styles.statusPaid : styles.statusUnpaid}>{h.status}</span>
                    </td>
                  </tr>
                ))}
                {holidays.length === 0 && <tr><td colSpan="3" style={styles.emptyText}>No holidays configured.</td></tr>}
              </tbody>
            </table>
          </div>
        </div>
      </div>

    </div>
  );
}

const styles = {
  page: { height: "calc(100vh - 120px)", display: "flex", flexDirection: "column", color: "#1e293b", padding: "0" },
  header: { shrink: 0, marginBottom: "25px" },
  title: { fontSize: "28px", fontWeight: "800", margin: 0, color: "#0f172a" },
  subtitle: { color: "#64748b", margin: "4px 0 0 0", fontSize: "14px" },

  mainContainer: { display: "flex", gap: "30px", flex: 1, minHeight: 0 },

  panel: { flex: 1, background: "#fff", border: "1px solid #e2e8f0", borderRadius: "16px", display: "flex", flexDirection: "column", minWidth: 0, boxShadow: "0 4px 6px -1px rgba(0,0,0,0.02)" },
  panelHeader: { padding: "18px 24px", borderBottom: "1px solid #e2e8f0", display: "flex", justifyContent: "space-between", alignItems: "center", background: "#f8fafc", borderTopLeftRadius: "16px", borderTopRightRadius: "16px", shrink: 0 },
  panelTitleWrap: { display: "flex", alignItems: "center", gap: "10px" },
  panelTitle: { margin: 0, fontSize: "16px", fontWeight: "700", color: "#0f172a" },

  tableWrapper: { flex: 1, overflowY: "auto", overflowX: "auto" },
  table: { width: "100%", borderCollapse: "collapse", textAlign: "left" },
  thead: { position: "sticky", top: 0, zIndex: 1 },
  th: { background: "#f1f5f9", padding: "12px 24px", fontSize: "11px", color: "#475569", fontWeight: "800", textTransform: "uppercase", letterSpacing: "0.5px", borderBottom: "1px solid #e2e8f0" },
  tr: { borderBottom: "1px solid #f1f5f9" },
  td: { padding: "16px 24px", fontSize: "14px", color: "#1e293b", verticalAlign: "middle" },

  deptTag: { display: "inline-block", background: "#e2e8f0", color: "#475569", fontSize: "11px", padding: "3px 8px", borderRadius: "6px", fontWeight: "600" },
  hoursBadge: { display: "inline-block", marginTop: "4px", background: "#e0f2fe", color: "#0284c7", fontSize: "11px", padding: "2px 8px", borderRadius: "6px", fontWeight: "700" },

  statusPaid: { color: "#16a34a", background: "#dcfce7", padding: "4px 10px", borderRadius: "6px", fontSize: "11px", fontWeight: "800", textTransform: "uppercase" },
  statusUnpaid: { color: "#ea580c", background: "#ffedd5", padding: "4px 10px", borderRadius: "6px", fontSize: "11px", fontWeight: "800", textTransform: "uppercase" },

  emptyText: { textAlign: "center", padding: "40px", color: "#94a3b8", fontSize: "14px" }
};