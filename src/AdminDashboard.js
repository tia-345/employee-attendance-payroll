import React, { useState, useEffect } from "react";
import API_URL from "./apiConfig";


function AdminDashboard() {
  const [employees, setEmployees] = useState([]);

  const [adminProfile, setAdminProfile] = useState(null);
  const [chatHistory, setChatHistory] = useState([]);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      fetch(`${API_URL}/api/employees/me`, {
        headers: { Authorization: `Bearer ${token}` }
      })
        .then(res => res.json())
        .then(data => setAdminProfile(data))
        .catch(console.error);
    }

    fetch(`${API_URL}/api/employees`)
      .then(res => res.json())
      .then(data => setEmployees(data))
      .catch(console.error);

    // Poll for messages to show notification bulbs
    const checkMsgs = () => {
        const msgs = JSON.parse(localStorage.getItem("chat_messages")) || [];
        setChatHistory(msgs);
    };
    checkMsgs();
    const interval = setInterval(checkMsgs, 2000);
    return () => clearInterval(interval);
  }, []);

  const hasUnread = (email) => {
    const lastRead = localStorage.getItem("last_read_admin") || 0;
    return chatHistory.some(msg => msg.sender === email && msg.receiver === "admin" && msg.id > Number(lastRead));
  };

  const stats = [
    { label: "Total Workforce", value: employees.length.toString(), sub: "Registered Employees", color: "#0284c7" },
    { label: "On-Site Today", value: "17", sub: "Active now", color: "#22c55e" },
    { label: "Pending Leaves", value: "03", sub: "Requires action", color: "#eab308" },
    { label: "Absence Rate", value: "4.2%", sub: "Last 30 days", color: "#ef4444" },
  ];

  return (
    <div style={styles.page}>
      {/* HEADER SECTION */}
      <div style={styles.header}>
        <div style={{ display: "flex", gap: "25px", alignItems: "center" }}>
          <div style={styles.adminAvatar}>
            {adminProfile?.profilePicture ? (
              <img 
                src={adminProfile.profilePicture} 
                alt="Admin" 
                style={{ width: "100%", height: "100%", borderRadius: "15px", objectFit: "cover" }} 
              />
            ) : (
              <div style={styles.avatarPlaceholder}>{adminProfile?.name?.charAt(0) || "A"}</div>
            )}
          </div>
          <div>
            <h1 style={styles.title}>Welcome Admin</h1>
            <p style={styles.subtitle}>Administrative Control & Analytics</p>
          </div>
        </div>
        
        <div style={styles.statusGroup}>
          <span style={styles.pulseDot}>●</span>
          <span style={styles.statusText}>Server Status: Operational</span>
        </div>
      </div>

      {/* KPI GRID */}
      <div style={styles.kpiGrid}>
        {stats.map((stat, i) => (
          <div key={i} style={styles.statCard}>
            <span style={styles.statLabel}>{stat.label}</span>
            <div style={{ ...styles.statValue, color: stat.color }}>
              {stat.value}
            </div>
            <span style={styles.statSub}>{stat.sub}</span>
          </div>
        ))}
      </div>

      {/* MAIN GRID */}
      <div style={styles.mainGrid}>
        <div style={styles.panelCard}>
          <div style={styles.panelHeader}>
            <h3>Daily Operations Log</h3>
            <button style={styles.viewBtn}>View All</button>
          </div>

          <div style={styles.logList}>
            {employees.length > 0 ? employees.slice(-4).reverse().map((item, i) => (
              <div key={i} style={styles.logItem}>
                <div style={styles.logMeta}>
                  <span style={styles.logTime}>{item.department || "General"}</span>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <span style={styles.logUser}>{item.name}</span>
                    {hasUnread(item.email) && (
                      <span title="New Message from this Employee" style={styles.bulbPulse}></span>
                    )}
                  </div>
                </div>
                <div style={styles.logAction}>
                  <span style={styles.actionText}>{item.designation || "Employee"}</span>
                  <span style={styles.locTag}>{item.location || "Office"}</span>
                </div>
              </div>
            )) : <p style={{ color: "#475569" }}>No employees found.</p>}
          </div>
        </div>

        <div style={styles.sidebar}>
          <div style={styles.systemCard}>
            <h4 style={styles.cardTitle}>Payroll Readiness</h4>
            <div style={styles.progressContainer}>
              <div style={styles.progressBar} />
            </div>
            <p style={styles.progressText}>85% Data Verification Complete</p>
            <div style={styles.divider} />
            <div style={styles.payrollStat}>
              <span>Next Disbursement:</span>
              <strong>25th Sep 2026</strong>
            </div>
          </div>

          <div style={styles.alertCard}>
            <h4 style={{ ...styles.cardTitle, color: "#ef4444" }}>
              Action Required
            </h4>
            <div style={styles.alertItem}>
              <strong>3 Leave Requests</strong>
              <p>Awaiting approval from HR Manager</p>
            </div>
            <div style={styles.alertItem}>
              <strong>Missing Logs</strong>
              <p>4 Employees forgot to clock-out</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

const styles = {
  page: {
    padding: "40px 60px",
    width: "100%",
    color: "#1e293b",
  },

  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "50px",
  },

  adminAvatar: {
    width: "70px",
    height: "70px",
    background: "#0284c7",
    borderRadius: "15px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "30px",
    fontWeight: "bold",
    color: "white",
    boxShadow: "0 4px 6px rgba(0,0,0,0.1)"
  },

  avatarPlaceholder: {
    textTransform: "uppercase"
  },

  title: { fontSize: "40px", fontWeight: "800", margin: 0 },
  subtitle: { color: "#475569", marginTop: "8px", fontSize: "16px" },

  statusGroup: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    background: "#ffffff",
    padding: "12px 25px",
    borderRadius: "30px",
    border: "1px solid #cbd5e1",
  },

  pulseDot: { color: "#22c55e", fontSize: "12px" },
  statusText: {
    fontSize: "12px",
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: "1px",
  },

  kpiGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
    gap: "30px",
    marginBottom: "50px",
  },

  statCard: {
    background: "#ffffff",
    border: "1px solid #cbd5e1",
    padding: "35px",
    borderRadius: "20px",
  },

  statLabel: {
    fontSize: "13px",
    color: "#475569",
    fontWeight: "700",
    textTransform: "uppercase",
  },

  statValue: {
    fontSize: "42px",
    fontWeight: "800",
    margin: "15px 0",
  },

  statSub: { fontSize: "14px", color: "#475569" },

  mainGrid: {
    display: "grid",
    gridTemplateColumns: "2fr 1fr",
    gap: "40px",
  },

  panelCard: {
    background: "#ffffff",
    border: "1px solid #cbd5e1",
    borderRadius: "20px",
    padding: "40px",
  },

  panelHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "30px",
  },

  viewBtn: {
    background: "transparent",
    border: "1px solid #94a3b8",
    color: "#0284c7",
    padding: "8px 18px",
    borderRadius: "8px",
    cursor: "pointer",
    fontSize: "13px",
  },

  logList: { display: "flex", flexDirection: "column", gap: "20px" },

  logItem: {
    display: "flex",
    justifyContent: "space-between",
    padding: "20px",
    background: "#f1f5f9",
    borderRadius: "14px",
    border: "1px solid #cbd5e1",
  },

  logMeta: { display: "flex", flexDirection: "column", gap: "6px" },
  logTime: { fontSize: "12px", color: "#475569", fontWeight: "700" },
  logUser: { fontSize: "16px", fontWeight: "700" },

  logAction: {
    textAlign: "right",
    display: "flex",
    flexDirection: "column",
    gap: "6px",
  },

  actionText: { fontSize: "14px", color: "#22c55e", fontWeight: "600" },

  locTag: {
    fontSize: "12px",
    color: "#475569",
    background: "#e2e8f0",
    padding: "4px 10px",
    borderRadius: "6px",
  },
    bulbPulse: {
        width: "8px",
        height: "8px",
        background: "#0ea5e9",
        borderRadius: "50%",
        boxShadow: "0 0 8px #0ea5e9, 0 0 16px #0ea5e9",
        display: "inline-block",
        animation: "bulbGlow 1.5s infinite ease-in-out"
    },

  sidebar: { display: "flex", flexDirection: "column", gap: "30px" },

  systemCard: {
    background: "#ffffff",
    border: "1px solid #cbd5e1",
    borderRadius: "20px",
    padding: "35px",
  },

  cardTitle: {
    fontSize: "14px",
    textTransform: "uppercase",
    letterSpacing: "1px",
    marginBottom: "20px",
  },

  progressContainer: {
    height: "10px",
    background: "#e2e8f0",
    borderRadius: "10px",
    overflow: "hidden",
    marginBottom: "15px",
  },

  progressBar: { width: "85%", height: "100%", background: "#0284c7" },

  progressText: { fontSize: "14px", color: "#475569" },

  divider: { height: "1px", background: "#e2e8f0", margin: "25px 0" },

  payrollStat: {
    display: "flex",
    justifyContent: "space-between",
    fontSize: "15px",
  },

  alertCard: {
    background: "rgba(239, 68, 68, 0.05)",
    border: "1px solid rgba(239, 68, 68, 0.2)",
    borderRadius: "20px",
    padding: "35px",
  },

  alertItem: {
    marginBottom: "20px",
    borderLeft: "4px solid #ef4444",
    paddingLeft: "18px",
  },
};

export default AdminDashboard;