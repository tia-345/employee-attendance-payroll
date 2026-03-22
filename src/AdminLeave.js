import React from "react";

function AdminLeave({ leaves, setLeaves }) {
  const updateStatus = (id, status) => {
    setLeaves(
      leaves.map((l) =>
        l.id === id ? { ...l, status } : l
      )
    );
  };

  // Stats for the top ribbon
  const pendingCount = leaves.filter(l => l.status === "Pending").length;
  const approvedToday = leaves.filter(l => l.status === "Approved").length;

  return (
    <div style={styles.page}>
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>Leave Approvals</h1>
          <p style={styles.subtitle}>Review and manage employee time-off requests</p>
        </div>
        <div style={styles.statsRow}>
          <div style={styles.statMini}>
            <span style={styles.statLabel}>Awaiting Action</span>
            <span style={{...styles.statValue, color: '#eab308'}}>{pendingCount}</span>
          </div>
          <div style={styles.statMini}>
            <span style={styles.statLabel}>Approved (MTD)</span>
            <span style={{...styles.statValue, color: '#22c55e'}}>{approvedToday}</span>
          </div>
        </div>
      </div>

      <div style={styles.container}>
        {leaves.length === 0 ? (
          <div style={styles.emptyState}>
            <p>All clear! No pending leave applications.</p>
          </div>
        ) : (
          <div style={styles.requestGrid}>
            {leaves.map((l) => (
              <div key={l.id} style={styles.requestCard}>
                <div style={styles.cardTop}>
                  <div style={styles.empInfo}>
                    <div style={styles.avatarPlaceholder}>{l.employeeId.charAt(0)}</div>
                    <div>
                      <h4 style={styles.empName}>{l.employeeId}</h4>
                      <span style={styles.appliedDate}>Applied on {l.appliedOn || "Recent"}</span>
                    </div>
                  </div>
                  <span style={statusBadge(l.status)}>{l.status}</span>
                </div>

                <div style={styles.cardBody}>
                  <div style={styles.leaveType}>{l.type}</div>
                  <div style={styles.dateRange}>
                    <strong>{l.fromDate}</strong> 
                    <span style={{color: '#64748b'}}> to </span> 
                    <strong>{l.toDate}</strong>
                  </div>
                  <p style={styles.reasonText}>"{l.reason || "No reason provided."}"</p>
                </div>

                {l.status === "Pending" && (
                  <div style={styles.actionRow}>
                    <button
                      style={styles.rejectBtn}
                      onClick={() => updateStatus(l.id, "Rejected")}
                    >
                      Decline
                    </button>
                    <button
                      style={styles.approveBtn}
                      onClick={() => updateStatus(l.id, "Approved")}
                    >
                      Approve Request
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

const statusBadge = (status) => ({
  fontSize: '10px',
  fontWeight: '800',
  padding: '4px 8px',
  borderRadius: '4px',
  textTransform: 'uppercase',
  letterSpacing: '0.5px',
  background: status === "Approved" ? "rgba(34,197,94,0.1)" : status === "Rejected" ? "rgba(239,68,68,0.1)" : "rgba(234,179,8,0.1)",
  color: status === "Approved" ? "#22c55e" : status === "Rejected" ? "#ef4444" : "#eab308",
  border: `1px solid ${status === "Approved" ? "#22c55e33" : status === "Rejected" ? "#ef444433" : "#eab30833"}`
});

const styles = {
  page: { padding: "40px", maxWidth: "1200px", margin: "0 auto", color: "#1e293b" },
  header: { display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: "40px" },
  title: { fontSize: "32px", fontWeight: "800", margin: 0 },
  subtitle: { color: "#475569", marginTop: "5px" },
  
  statsRow: { display: "flex", gap: "30px" },
  statMini: { textAlign: "right" },
  statLabel: { fontSize: "11px", color: "#475569", fontWeight: "700", textTransform: "uppercase" },
  statValue: { fontSize: "24px", fontWeight: "800", display: "block" },

  requestGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(350px, 1fr))", gap: "25px" },
  requestCard: { background: "#ffffff", border: "1px solid #cbd5e1", borderRadius: "20px", padding: "24px", display: "flex", flexDirection: "column" },
  
  cardTop: { display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "20px" },
  empInfo: { display: "flex", alignItems: "center", gap: "12px" },
  avatarPlaceholder: { width: "40px", height: "40px", borderRadius: "10px", background: "#0284c7", color: "#1e293b", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "800" },
  empName: { margin: 0, fontSize: "16px", fontWeight: "700" },
  appliedDate: { fontSize: "12px", color: "#475569" },

  cardBody: { flex: 1, marginBottom: "24px" },
  leaveType: { color: "#0284c7", fontSize: "13px", fontWeight: "700", marginBottom: "8px" },
  dateRange: { fontSize: "15px", marginBottom: "12px" },
  reasonText: { fontSize: "14px", color: "#475569", fontStyle: "italic", lineHeight: "1.5" },

  actionRow: { display: "grid", gridTemplateColumns: "1fr 2fr", gap: "12px" },
  approveBtn: { background: "#22c55e", color: "#1e293b", border: "none", padding: "12px", borderRadius: "10px", fontWeight: "700", cursor: "pointer" },
  rejectBtn: { background: "transparent", border: "1px solid #94a3b8", color: "#ef4444", padding: "12px", borderRadius: "10px", fontWeight: "700", cursor: "pointer" },

  emptyState: { textAlign: "center", padding: "100px 0", color: "#475569", background: "#ffffff", borderRadius: "20px", border: "2px dashed #cbd5e1" }
};

export default AdminLeave;