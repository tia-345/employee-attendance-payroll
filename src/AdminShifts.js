import React, { useState, useEffect } from "react";
import { FiEdit2, FiTrash2, FiPlus, FiClock, FiCalendar, FiX } from "react-icons/fi";

const initialShifts = [
  { name: "Morning Shift", timing: "09:00 AM – 05:00 PM", hours: "8 hrs", off: "Sunday", depts: ["IT", "HR", "Finance"] },
  { name: "Evening Shift", timing: "01:00 PM – 09:00 PM", hours: "8 hrs", off: "Sunday", depts: ["Support", "Operations"] }
];

const initialHolidays = [
  { date: "Jan 01, 2026", day: "Thursday", name: "New Year’s Day", type: "National", status: "Paid" },
  { date: "Jan 14, 2026", day: "Wednesday", name: "Makar Sankranti", type: "Regional", status: "Paid" },
  { date: "Jan 26, 2026", day: "Monday", name: "Republic Day", type: "National", status: "Paid" },
  { date: "Mar 04, 2026", day: "Wednesday", name: "Maha Shivaratri", type: "Religious", status: "Paid" },
  { date: "Mar 25, 2026", day: "Wednesday", name: "Holi", type: "National", status: "Paid" },
  { date: "Apr 03, 2026", day: "Friday", name: "Good Friday", type: "Religious", status: "Paid" },
  { date: "Apr 10, 2026", day: "Friday", name: "Eid al-Fitr", type: "Religious", status: "Paid" },
  { date: "May 01, 2026", day: "Friday", name: "Labour Day", type: "National", status: "Paid" },
  { date: "Aug 15, 2026", day: "Saturday", name: "Independence Day", type: "National", status: "Paid" },
  { date: "Oct 02, 2026", day: "Friday", name: "Gandhi Jayanti", type: "National", status: "Paid" },
  { date: "Oct 21, 2026", day: "Wednesday", name: "Dussehra", type: "Religious", status: "Paid" },
  { date: "Nov 09, 2026", day: "Monday", name: "Diwali", type: "National", status: "Paid" },
  { date: "Dec 25, 2026", day: "Friday", name: "Christmas", type: "National", status: "Paid" }
];

export default function AdminShifts() {
  const [shifts, setShifts] = useState(initialShifts);
  const [holidays, setHolidays] = useState(initialHolidays);

  useEffect(() => {
    const savedShifts = localStorage.getItem("adminShifts");
    if (savedShifts) setShifts(JSON.parse(savedShifts));

    const savedHolidays = localStorage.getItem("adminHolidays");
    if (savedHolidays) setHolidays(JSON.parse(savedHolidays));
  }, []);

  const saveShifts = (newShifts) => {
    setShifts(newShifts);
    localStorage.setItem("adminShifts", JSON.stringify(newShifts));
  };

  const saveHolidays = (newHolidays) => {
    setHolidays(newHolidays);
    localStorage.setItem("adminHolidays", JSON.stringify(newHolidays));
  };

  // Shift Modal State
  const [showShiftModal, setShowShiftModal] = useState(false);
  const [editShiftIndex, setEditShiftIndex] = useState(null);
  const [shiftData, setShiftData] = useState({ name: "", timing: "", hours: "", off: "", depts: "" });

  const openShiftModal = (index = null) => {
    if (index !== null) {
      const s = shifts[index];
      setShiftData({ name: s.name, timing: s.timing, hours: s.hours, off: s.off, depts: s.depts.join(", ") });
      setEditShiftIndex(index);
    } else {
      setShiftData({ name: "", timing: "", hours: "", off: "", depts: "" });
      setEditShiftIndex(null);
    }
    setShowShiftModal(true);
  };

  const saveShift = (e) => {
    e.preventDefault();
    const deptsArray = shiftData.depts.split(",").map(d => d.trim()).filter(d => d);
    const newShift = { ...shiftData, depts: deptsArray.length ? deptsArray : ["All"] };

    let updated = [...shifts];
    if (editShiftIndex !== null) updated[editShiftIndex] = newShift;
    else updated.push(newShift);

    saveShifts(updated);
    setShowShiftModal(false);
  };

  const deleteShift = (index) => {
    if (window.confirm("Delete this shift?")) saveShifts(shifts.filter((_, i) => i !== index));
  };

  // Holiday Modal State
  const [showHolModal, setShowHolModal] = useState(false);
  const [editHolIndex, setEditHolIndex] = useState(null);
  const [holData, setHolData] = useState({ date: "", day: "", name: "", type: "National", status: "Paid" });

  const openHolModal = (index = null) => {
    if (index !== null) {
      setHolData(holidays[index]);
      setEditHolIndex(index);
    } else {
      setHolData({ date: "", day: "", name: "", type: "National", status: "Paid" });
      setEditHolIndex(null);
    }
    setShowHolModal(true);
  };

  const saveHoliday = (e) => {
    e.preventDefault();
    let updated = [...holidays];
    if (editHolIndex !== null) updated[editHolIndex] = holData;
    else updated.push(holData);

    saveHolidays(updated);
    setShowHolModal(false);
  };

  const deleteHoliday = (index) => {
    if (window.confirm("Delete this holiday?")) saveHolidays(holidays.filter((_, i) => i !== index));
  };

  const sortedHolidays = [...holidays].sort((a, b) => new Date(a.date) - new Date(b.date));

  return (
    <div style={styles.page}>

      {/* Header */}
      <div style={styles.header}>
        <h1 style={styles.title}>System Setup</h1>
        <p style={styles.subtitle}>Configure organizational working shifts and statutory holidays.</p>
      </div>

      {/* Main Containers */}
      <div style={styles.mainContainer}>

        {/* SHIFTS PANEL */}
        <div style={styles.panel}>
          <div style={styles.panelHeader}>
            <div style={styles.panelTitleWrap}>
              <FiClock size={18} color="#0284c7" />
              <h3 style={styles.panelTitle}>Working Shifts</h3>
            </div>
            <button style={styles.addButton} onClick={() => openShiftModal(null)}>
              <FiPlus size={16} /> Add Shift
            </button>
          </div>

          <div style={styles.tableWrapper}>
            <table style={styles.table}>
              <thead style={styles.thead}>
                <tr>
                  <th style={styles.th}>Shift Details</th>
                  <th style={styles.th}>Schedule</th>
                  <th style={styles.th}>Departments</th>
                  <th style={{ ...styles.th, textAlign: "right" }}>Actions</th>
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
                        {s.depts.map((d, idx) => (
                          <span key={idx} style={styles.deptTag}>{d}</span>
                        ))}
                      </div>
                    </td>
                    <td style={{ ...styles.td, textAlign: "right" }}>
                      <button style={styles.actionBtnEdit} onClick={() => openShiftModal(i)}><FiEdit2 size={15} /></button>
                      <button style={styles.actionBtnTrash} onClick={() => deleteShift(i)}><FiTrash2 size={15} /></button>
                    </td>
                  </tr>
                ))}
                {shifts.length === 0 && <tr><td colSpan="4" style={styles.emptyText}>No shifts configured.</td></tr>}
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
            <button style={{ ...styles.addButton, background: "#10b981" }} onClick={() => openHolModal(null)}>
              <FiPlus size={16} /> Add Holiday
            </button>
          </div>

          <div style={styles.tableWrapper}>
            <table style={styles.table}>
              <thead style={styles.thead}>
                <tr>
                  <th style={styles.th}>Date</th>
                  <th style={styles.th}>Holiday Details</th>
                  <th style={styles.th}>Status</th>
                  <th style={{ ...styles.th, textAlign: "right" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {sortedHolidays.map((h, index) => {
                  const origIndex = holidays.findIndex(hol => hol === h);
                  return (
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
                      <td style={{ ...styles.td, textAlign: "right" }}>
                        <button style={styles.actionBtnEdit} onClick={() => openHolModal(origIndex)}><FiEdit2 size={15} /></button>
                        <button style={styles.actionBtnTrash} onClick={() => deleteHoliday(origIndex)}><FiTrash2 size={15} /></button>
                      </td>
                    </tr>
                  );
                })}
                {holidays.length === 0 && <tr><td colSpan="4" style={styles.emptyText}>No holidays configured.</td></tr>}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* SHIFT MODAL */}
      {showShiftModal && (
        <div style={styles.modalOverlay}>
          <div style={styles.modalContent}>
            <div style={styles.modalHeader}>
              <h4 style={styles.modalTitle}>{editShiftIndex !== null ? "Edit Shift" : "Create Shift"}</h4>
              <button style={styles.closeBtn} onClick={() => setShowShiftModal(false)}><FiX size={20} /></button>
            </div>
            <form onSubmit={saveShift}>
              <div style={styles.modalBody}>
                <div style={styles.inputWrap}>
                  <label style={styles.label}>Shift Name</label>
                  <input required placeholder="E.g., Morning Shift" style={styles.input} value={shiftData.name} onChange={e => setShiftData({ ...shiftData, name: e.target.value })} />
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                  <div style={styles.inputWrap}>
                    <label style={styles.label}>Timing</label>
                    <input required placeholder="09:00 AM – 05:00 PM" style={styles.input} value={shiftData.timing} onChange={e => setShiftData({ ...shiftData, timing: e.target.value })} />
                  </div>
                  <div style={styles.inputWrap}>
                    <label style={styles.label}>Hours</label>
                    <input required placeholder="8 hrs" style={styles.input} value={shiftData.hours} onChange={e => setShiftData({ ...shiftData, hours: e.target.value })} />
                  </div>
                </div>
                <div style={styles.inputWrap}>
                  <label style={styles.label}>Weekly Off</label>
                  <input required placeholder="Sunday" style={styles.input} value={shiftData.off} onChange={e => setShiftData({ ...shiftData, off: e.target.value })} />
                </div>
                <div style={styles.inputWrap}>
                  <label style={styles.label}>Departments (comma separated)</label>
                  <input required placeholder="IT, HR, Sales" style={styles.input} value={shiftData.depts} onChange={e => setShiftData({ ...shiftData, depts: e.target.value })} />
                </div>
              </div>
              <div style={styles.modalFooter}>
                <button type="button" style={styles.cancelBtn} onClick={() => setShowShiftModal(false)}>Cancel</button>
                <button type="submit" style={styles.saveBtn}>Save Shift</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* HOLIDAY MODAL */}
      {showHolModal && (
        <div style={styles.modalOverlay}>
          <div style={styles.modalContent}>
            <div style={styles.modalHeader}>
              <h4 style={styles.modalTitle}>{editHolIndex !== null ? "Edit Holiday" : "Create Holiday"}</h4>
              <button style={styles.closeBtn} onClick={() => setShowHolModal(false)}><FiX size={20} /></button>
            </div>
            <form onSubmit={saveHoliday}>
              <div style={styles.modalBody}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                  <div style={styles.inputWrap}>
                    <label style={styles.label}>Date</label>
                    <input required placeholder="Jan 01, 2026" style={styles.input} value={holData.date} onChange={e => setHolData({ ...holData, date: e.target.value })} />
                  </div>
                  <div style={styles.inputWrap}>
                    <label style={styles.label}>Day</label>
                    <input required placeholder="Thursday" style={styles.input} value={holData.day} onChange={e => setHolData({ ...holData, day: e.target.value })} />
                  </div>
                </div>
                <div style={styles.inputWrap}>
                  <label style={styles.label}>Holiday Name</label>
                  <input required placeholder="New Year's Day" style={styles.input} value={holData.name} onChange={e => setHolData({ ...holData, name: e.target.value })} />
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                  <div style={styles.inputWrap}>
                    <label style={styles.label}>Type</label>
                    <select style={styles.input} value={holData.type} onChange={e => setHolData({ ...holData, type: e.target.value })}>
                      <option>National</option>
                      <option>Regional</option>
                      <option>Religious</option>
                      <option>Other</option>
                    </select>
                  </div>
                  <div style={styles.inputWrap}>
                    <label style={styles.label}>Status</label>
                    <select style={styles.input} value={holData.status} onChange={e => setHolData({ ...holData, status: e.target.value })}>
                      <option>Paid</option>
                      <option>Unpaid</option>
                    </select>
                  </div>
                </div>
              </div>
              <div style={styles.modalFooter}>
                <button type="button" style={styles.cancelBtn} onClick={() => setShowHolModal(false)}>Cancel</button>
                <button type="submit" style={{ ...styles.saveBtn, background: "#10b981" }}>Save Holiday</button>
              </div>
            </form>
          </div>
        </div>
      )}

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
  addButton: { display: "flex", alignItems: "center", gap: "6px", background: "#0ea5e9", color: "#fff", border: "none", padding: "8px 14px", borderRadius: "8px", cursor: "pointer", fontWeight: "600", fontSize: "13px", transition: "opacity 0.2s" },

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

  actionBtnEdit: { background: "none", border: "none", color: "#3b82f6", cursor: "pointer", padding: "6px" },
  actionBtnTrash: { background: "none", border: "none", color: "#ef4444", cursor: "pointer", padding: "6px" },
  emptyText: { textAlign: "center", padding: "40px", color: "#94a3b8", fontSize: "14px" },

  // Modals
  modalOverlay: { position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(15, 23, 42, 0.4)", backdropFilter: "blur(2px)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center" },
  modalContent: { background: "#fff", width: "420px", maxWidth: "90%", borderRadius: "16px", boxShadow: "0 25px 50px -12px rgba(0,0,0,0.25)", display: "flex", flexDirection: "column" },
  modalHeader: { padding: "18px 24px", borderBottom: "1px solid #e2e8f0", display: "flex", justifyContent: "space-between", alignItems: "center", background: "#f8fafc", borderTopLeftRadius: "16px", borderTopRightRadius: "16px" },
  modalTitle: { margin: 0, fontSize: "16px", fontWeight: "700", color: "#0f172a" },
  closeBtn: { background: "none", border: "none", color: "#64748b", cursor: "pointer", display: "flex" },
  modalBody: { padding: "24px", display: "flex", flexDirection: "column", gap: "16px" },
  inputWrap: { display: "flex", flexDirection: "column", gap: "6px" },
  label: { fontSize: "11px", fontWeight: "700", color: "#64748b", textTransform: "uppercase", letterSpacing: "0.5px" },
  input: { padding: "10px 14px", border: "1px solid #cbd5e1", borderRadius: "8px", fontSize: "14px", color: "#0f172a", outline: "none", background: "#f8fafc" },
  modalFooter: { padding: "16px 24px", borderTop: "1px solid #e2e8f0", display: "flex", justifyContent: "flex-end", gap: "12px", background: "#f8fafc", borderBottomLeftRadius: "16px", borderBottomRightRadius: "16px" },
  cancelBtn: { padding: "10px 18px", border: "1px solid #cbd5e1", background: "#fff", borderRadius: "8px", color: "#475569", fontWeight: "600", cursor: "pointer" },
  saveBtn: { padding: "10px 18px", border: "none", background: "#0ea5e9", color: "#fff", borderRadius: "8px", fontWeight: "600", cursor: "pointer" }
};