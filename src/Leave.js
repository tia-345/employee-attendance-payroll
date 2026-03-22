import React, { useState } from "react";
import { FiCalendar, FiClock, FiCheckCircle, FiXCircle, FiInfo, FiSend, FiFileText } from "react-icons/fi";

function Leave({ leaves, setLeaves }) {
  const [type, setType] = useState("Casual Leave");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [reason, setReason] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const applyLeave = () => {
    if (!fromDate || !toDate || !reason) {
      alert("Please fill in all details before submitting.");
      return;
    }

    setIsSubmitting(true);

    setTimeout(() => {
      const newLeave = {
        id: Date.now(),
        employeeId: "EMP-7822",
        type,
        fromDate,
        toDate,
        reason,
        status: "Pending",
        appliedOn: new Date().toLocaleDateString(),
      };

      setLeaves([newLeave, ...leaves]);
      setFromDate("");
      setToDate("");
      setReason("");
      setType("Casual Leave");
      setIsSubmitting(false);
    }, 600); // Simulate network request for UX
  };

  return (
    <div style={styles.page}>

      {/* Header Area */}
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>Time Off & Leaves</h1>
          <p style={styles.subtitle}>Manage your leave balances and track your upcoming time off.</p>
        </div>
        <div style={styles.liveBadge}>
          <span style={styles.pulseDot}>●</span> Live Synchronization
        </div>
      </div>

      {/* LEAVE BALANCE CARDS */}
      <div style={styles.balanceGrid}>

        {/* Annual Leave Card */}
        <div style={{ ...styles.balanceCard, ...styles.cardBlue }}>
          <div style={styles.cardTop}>
            <div style={styles.cardIconBoxBlue}><FiCalendar size={20} /></div>
            <span style={styles.balanceLabelBlue}>Annual Leave</span>
          </div>
          <div style={styles.balanceData}>
            <span style={styles.balanceValueBlue}>12</span>
            <span style={styles.smallTotal}>/ 18 days left</span>
          </div>
          <div style={styles.progressBar}><div style={{ ...styles.progressIn, width: '66%', background: '#0284c7' }} /></div>
        </div>

        {/* Sick Leave Card */}
        <div style={{ ...styles.balanceCard, ...styles.cardGreen }}>
          <div style={styles.cardTop}>
            <div style={styles.cardIconBoxGreen}><FiCheckCircle size={20} /></div>
            <span style={styles.balanceLabelGreen}>Sick Leave</span>
          </div>
          <div style={styles.balanceData}>
            <span style={styles.balanceValueGreen}>04</span>
            <span style={styles.smallTotal}>/ 06 days left</span>
          </div>
          <div style={styles.progressBar}><div style={{ ...styles.progressIn, width: '75%', background: '#10b981' }} /></div>
        </div>

        {/* Casual Leave Card */}
        <div style={{ ...styles.balanceCard, ...styles.cardOrange }}>
          <div style={styles.cardTop}>
            <div style={styles.cardIconBoxOrange}><FiClock size={20} /></div>
            <span style={styles.balanceLabelOrange}>Casual Leave</span>
          </div>
          <div style={styles.balanceData}>
            <span style={styles.balanceValueOrange}>02</span>
            <span style={styles.smallTotal}>/ 04 days left</span>
          </div>
          <div style={styles.progressBar}><div style={{ ...styles.progressIn, width: '50%', background: '#f59e0b' }} /></div>
        </div>
      </div>

      <div style={styles.mainLayout}>

        {/* APPLY LEAVE FORM */}
        <div style={styles.formPanel}>
          <div style={styles.panelHeader}>
            <div style={styles.panelIcon}><FiFileText size={20} /></div>
            <h3 style={styles.panelTitle}>Request New Leave</h3>
          </div>

          <div style={styles.formBody}>
            <div style={styles.inputGroup}>
              <label style={styles.label}>Leave Category</label>
              <select style={styles.selectInput} value={type} onChange={(e) => setType(e.target.value)}>
                <option value="Casual Leave">Casual Leave</option>
                <option value="Sick Leave">Sick Leave</option>
                <option value="Earned Leave">Earned Leave</option>
                <option value="Maternity/Paternity">Maternity/Paternity</option>
                <option value="Unpaid Leave">Unpaid Leave</option>
              </select>
            </div>

            <div style={styles.inputGroup}>
              <label style={styles.label}>Duration Period</label>
              <div style={styles.dateRow}>
                <div style={styles.dateWrap}>
                  <label style={styles.dateSubLabel}>From</label>
                  <input type="date" style={styles.dateInput} value={fromDate} onChange={(e) => setFromDate(e.target.value)} />
                </div>
                <div style={styles.dateWrap}>
                  <label style={styles.dateSubLabel}>To</label>
                  <input type="date" style={styles.dateInput} value={toDate} onChange={(e) => setToDate(e.target.value)} />
                </div>
              </div>
            </div>

            <div style={styles.inputGroup}>
              <label style={styles.label}>Reason for Absence</label>
              <textarea
                style={styles.textArea}
                placeholder="Please provide a brief reason for your leave request..."
                value={reason}
                onChange={(e) => setReason(e.target.value)}
              />
            </div>

            <div style={styles.infoBox}>
              <FiInfo size={16} style={{ color: '#0284c7' }} />
              <span>Leaves require at least 24 hours prior approval from your reporting manager.</span>
            </div>

            <button
              style={{ ...styles.submitBtn, opacity: isSubmitting ? 0.7 : 1 }}
              onClick={applyLeave}
              disabled={isSubmitting}
            >
              <FiSend size={18} /> {isSubmitting ? "Submitting Application..." : "Submit Application"}
            </button>
          </div>
        </div>

        {/* LEAVE HISTORY TIMELINE */}
        <div style={styles.historyPanel}>
          <div style={styles.panelHeader}>
            <div style={styles.panelIconGray}><FiClock size={20} /></div>
            <h3 style={styles.panelTitle}>Application History</h3>
          </div>

          <div style={styles.historyList}>
            {leaves.length === 0 ? (
              <div style={styles.emptyState}>
                <div style={styles.emptyIcon}><FiCalendar size={32} /></div>
                <p style={styles.emptyText}>You haven't requested any time off recently.</p>
              </div>
            ) : (
              leaves.map((l) => (
                <div key={l.id} style={styles.historyItem}>
                  <div style={styles.historyIconBox(l.status)}>
                    {l.status === "Approved" ? <FiCheckCircle size={20} /> : l.status === "Rejected" ? <FiXCircle size={20} /> : <FiClock size={20} />}
                  </div>

                  <div style={styles.historyDetails}>
                    <div style={styles.historyHeader}>
                      <span style={styles.historyType}>{l.type}</span>
                      <span style={statusBadge(l.status)}>{l.status}</span>
                    </div>
                    <div style={styles.historyDates}>
                      <strong>{l.fromDate}</strong> to <strong>{l.toDate}</strong>
                    </div>
                    <div style={styles.historyApplied}>Applied on: {l.appliedOn || "Today"}</div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

      </div>
    </div>
  );
}

// Helper styling for status badges inside history list
const statusBadge = (status) => ({
  fontSize: '11px',
  fontWeight: '800',
  padding: '4px 10px',
  borderRadius: '12px',
  textTransform: 'uppercase',
  letterSpacing: '0.5px',
  background: status === "Approved" ? "#dcfce7" : status === "Rejected" ? "#fee2e2" : "#fef3c7",
  color: status === "Approved" ? "#166534" : status === "Rejected" ? "#991b1b" : "#b45309",
});

const styles = {
  page: { padding: "40px", maxWidth: "1300px", margin: "0 auto", color: "#1e293b", minHeight: "100vh" },

  header: { display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: "40px" },
  title: { fontSize: "36px", fontWeight: "900", margin: "0 0 8px", color: "#0f172a", letterSpacing: "-0.5px" },
  subtitle: { color: "#64748b", margin: 0, fontSize: "16px", fontWeight: "500" },
  liveBadge: { display: "flex", alignItems: "center", gap: "8px", background: "#f1f5f9", color: "#475569", padding: "8px 16px", borderRadius: "20px", fontSize: "13px", fontWeight: "700", border: "1px solid #cbd5e1" },
  pulseDot: { color: "#22c55e", fontSize: "10px", animation: "pulse 2s infinite" },

  balanceGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "24px", marginBottom: "40px" },
  balanceCard: { borderRadius: "24px", padding: "26px", border: "1px solid", position: "relative", overflow: "hidden", transition: "transform 0.2s, box-shadow 0.2s" },

  cardBlue: { background: "#f0f9ff", borderColor: "#bae6fd", boxShadow: "0 4px 6px -1px rgba(2, 132, 199, 0.05)" },
  cardGreen: { background: "#f0fdf4", borderColor: "#bbf7d0", boxShadow: "0 4px 6px -1px rgba(34, 197, 94, 0.05)" },
  cardOrange: { background: "#fffbeb", borderColor: "#fde68a", boxShadow: "0 4px 6px -1px rgba(245, 158, 11, 0.05)" },

  cardTop: { display: "flex", alignItems: "center", gap: "12px", marginBottom: "16px" },
  cardIconBoxBlue: { width: "40px", height: "40px", borderRadius: "12px", background: "#e0f2fe", color: "#0284c7", display: "flex", alignItems: "center", justifyContent: "center" },
  balanceLabelBlue: { fontSize: "15px", color: "#0369a1", fontWeight: "800", textTransform: "uppercase", letterSpacing: "0.5px" },
  balanceValueBlue: { fontSize: "40px", fontWeight: "900", color: "#0c4a6e", lineHeight: "1" },

  cardIconBoxGreen: { width: "40px", height: "40px", borderRadius: "12px", background: "#dcfce7", color: "#16a34a", display: "flex", alignItems: "center", justifyContent: "center" },
  balanceLabelGreen: { fontSize: "15px", color: "#15803d", fontWeight: "800", textTransform: "uppercase", letterSpacing: "0.5px" },
  balanceValueGreen: { fontSize: "40px", fontWeight: "900", color: "#14532d", lineHeight: "1" },

  cardIconBoxOrange: { width: "40px", height: "40px", borderRadius: "12px", background: "#fef3c7", color: "#d97706", display: "flex", alignItems: "center", justifyContent: "center" },
  balanceLabelOrange: { fontSize: "15px", color: "#b45309", fontWeight: "800", textTransform: "uppercase", letterSpacing: "0.5px" },
  balanceValueOrange: { fontSize: "40px", fontWeight: "900", color: "#78350f", lineHeight: "1" },

  balanceData: { display: "flex", alignItems: "baseline", gap: "8px" },
  smallTotal: { fontSize: "15px", color: "#64748b", fontWeight: "600" },

  progressBar: { height: "6px", background: "#ffffff", borderRadius: "10px", marginTop: "20px", overflow: "hidden", border: "1px solid rgba(0,0,0,0.05)" },
  progressIn: { height: "100%", borderRadius: "10px", transition: "width 1s ease-in-out" },

  mainLayout: { display: "grid", gridTemplateColumns: "1.4fr 1fr", gap: "35px" },

  formPanel: { background: "#ffffff", border: "1px solid #e2e8f0", borderRadius: "24px", padding: "35px", boxShadow: "0 10px 15px -3px rgba(0,0,0,0.02)" },
  panelHeader: { display: "flex", alignItems: "center", gap: "14px", marginBottom: "30px", paddingBottom: "20px", borderBottom: "1px solid #f1f5f9" },
  panelIcon: { width: "40px", height: "40px", borderRadius: "12px", background: "#0284c7", color: "#ffffff", display: "flex", alignItems: "center", justifyContent: "center" },
  panelIconGray: { width: "40px", height: "40px", borderRadius: "12px", background: "#f1f5f9", color: "#64748b", display: "flex", alignItems: "center", justifyContent: "center" },
  panelTitle: { fontSize: "20px", fontWeight: "800", color: "#0f172a", margin: 0 },

  formBody: { display: "flex", flexDirection: "column", gap: "24px" },
  inputGroup: { display: "flex", flexDirection: "column", gap: "10px" },
  label: { fontSize: "13px", color: "#475569", fontWeight: "700", textTransform: "uppercase", letterSpacing: "0.5px" },

  selectInput: { background: "#f8fafc", border: "2px solid #e2e8f0", color: "#0f172a", padding: "16px", borderRadius: "12px", outline: 'none', fontSize: "15px", fontWeight: "600", cursor: "pointer", transition: "border-color 0.2s" },

  dateRow: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" },
  dateWrap: { display: "flex", flexDirection: "column", gap: "6px" },
  dateSubLabel: { fontSize: "12px", color: "#94a3b8", fontWeight: "600" },
  dateInput: { background: "#f8fafc", border: "2px solid #e2e8f0", color: "#0f172a", padding: "14px", borderRadius: "12px", outline: 'none', fontSize: "15px", fontWeight: "600", transition: "border-color 0.2s" },

  textArea: { background: "#f8fafc", border: "2px solid #e2e8f0", color: "#0f172a", padding: "16px", borderRadius: "12px", outline: 'none', fontSize: "15px", minHeight: "120px", resize: "vertical", lineHeight: "1.5", transition: "border-color 0.2s" },

  infoBox: { display: "flex", alignItems: "center", gap: "12px", background: "#f0f9ff", padding: "16px", borderRadius: "12px", fontSize: "13px", color: "#0369a1", fontWeight: "600", border: "1px dashed #bae6fd" },

  submitBtn: { display: "flex", alignItems: "center", justifyContent: "center", gap: "10px", width: "100%", marginTop: "10px", padding: "18px", background: "linear-gradient(135deg, #0284c7, #2563eb)", color: "#ffffff", border: "none", borderRadius: "14px", fontWeight: "800", fontSize: "16px", cursor: "pointer", boxShadow: "0 4px 6px -1px rgba(2, 132, 199, 0.3)", transition: "transform 0.1s" },

  historyPanel: { background: "#ffffff", border: "1px solid #e2e8f0", borderRadius: "24px", padding: "35px", boxShadow: "0 10px 15px -3px rgba(0,0,0,0.02)", display: "flex", flexDirection: "column" },
  historyList: { display: "flex", flexDirection: "column", gap: "16px", flex: 1, overflowY: "auto", paddingRight: "5px" },

  historyItem: { display: "flex", gap: "16px", padding: "20px", background: "#f8fafc", borderRadius: "16px", border: "1px solid #e2e8f0", transition: "transform 0.2s, box-shadow 0.2s" },
  historyIconBox: (status) => ({
    width: "44px", height: "44px", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", shrink: 0,
    background: status === "Approved" ? "#dcfce7" : status === "Rejected" ? "#fee2e2" : "#fef3c7",
    color: status === "Approved" ? "#16a34a" : status === "Rejected" ? "#dc2626" : "#d97706"
  }),
  historyDetails: { flex: 1, display: "flex", flexDirection: "column", gap: "6px" },
  historyHeader: { display: "flex", justifyContent: "space-between", alignItems: "center" },
  historyType: { fontWeight: "800", fontSize: "15px", color: "#0f172a" },
  historyDates: { fontSize: "14px", color: "#475569" },
  historyApplied: { fontSize: "12px", color: "#94a3b8", fontWeight: "500", marginTop: "4px" },

  emptyState: { display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100%", textAlign: "center", color: "#64748b", background: "#f8fafc", border: "2px dashed #cbd5e1", borderRadius: "16px", padding: "40px 20px" },
  emptyIcon: { color: "#cbd5e1", marginBottom: "12px" },
  emptyText: { margin: 0, fontSize: "15px", fontWeight: "600" }
};

export default Leave;