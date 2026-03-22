import React, { useState, useEffect } from "react";
import { FiClock, FiCalendar, FiBriefcase, FiCheckCircle, FiCoffee, FiTrendingUp, FiActivity, FiMapPin, FiMail } from "react-icons/fi";

function EmployeeDashboard({ user, onNavigate }) {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const [attendanceStats, setAttendanceStats] = useState({
    present: 0,
    absent: 0,
    late: 0
  });

  const [dbUser, setDbUser] = useState(user);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      fetch("http://localhost:5000/api/attendance/my", {
        headers: { Authorization: `Bearer ${token}` }
      })
        .then(res => res.json())
        .then(data => {
          if (Array.isArray(data)) {
            const present = data.filter(r => r.status === "Full Day" || r.status === "Half Day").length;
            const absent = data.filter(r => r.status === "Absent").length;
            const late = data.filter(r => r.checkIn && r.checkIn > "09:15:00").length;
            setAttendanceStats({ present, absent, late });
          }
        })
        .catch(console.error);

      fetch("http://localhost:5000/api/employees/me", {
        headers: { Authorization: `Bearer ${token}` }
      })
        .then(res => res.json())
        .then(data => {
          if (data && data._id) setDbUser(data);
        })
        .catch(console.error);
    }
  }, []);

  const greeting = time.getHours() < 12 ? "Good Morning" : time.getHours() < 18 ? "Good Afternoon" : "Good Evening";

  return (
    <div style={styles.container}>

      {/* PROFESSIONAL IDENTITY HEADER */}
      <div style={styles.header}>
        <div style={styles.identityGroup}>
          <div style={styles.avatarWrapper}>
            {dbUser?.profilePicture ? (
              <img 
                src={dbUser.profilePicture} 
                alt={dbUser.name} 
                style={{ width: "100%", height: "100%", borderRadius: "20px", objectFit: "cover" }} 
              />
            ) : (
              <div style={styles.avatarLetter}>{dbUser?.name?.charAt(0) || "E"}</div>
            )}
          </div>
          <div style={styles.idInfo}>
            <div style={styles.statusBox}>
              <span style={styles.statusDot}>●</span> <span style={styles.statusText}>System Online</span>
            </div>
            <h2 style={styles.idText}>{greeting}, {dbUser?.name?.split(' ')[0] || "Employee"}!</h2>
            <div style={styles.roleSubtext}>
              <FiBriefcase size={14} /> {dbUser?.designation || "Staff Member"} &nbsp;| &nbsp;
              <FiMapPin size={14} /> {dbUser?.location || "Headquarters"} &nbsp;| &nbsp;
              <FiMail size={14} /> {dbUser?.email || "worker@company.com"}
            </div>
          </div>
        </div>

        <div style={styles.timeGroup}>
          <div style={styles.dateLabel}>{time.toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}</div>
          <div style={styles.digitalClock}>
            {time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
          </div>
          <button style={styles.punchBtn} onClick={() => onNavigate("attendance")}>
            <FiActivity style={{ marginRight: '6px' }} /> Record Punch
          </button>
        </div>
      </div>

      {/* METRICS GRID */}
      <div style={styles.kpiGrid}>
        <div style={{ ...styles.kpiCard, ...styles.cardBlue }}>
          <div style={styles.kpiTop}>
            <div style={styles.iconBoxBlue}><FiTrendingUp size={22} /></div>
            <span style={styles.kpiLabel}>Attendance Rate</span>
          </div>
          <div style={styles.kpiValueBlue}>
            {Math.round((attendanceStats.present / (attendanceStats.present + attendanceStats.absent)) * 100) || 98}%
          </div>
          <div style={styles.kpiTrendPositive}>↑ Excellent performance</div>
        </div>

        <div style={{ ...styles.kpiCard, ...styles.cardGreen }}>
          <div style={styles.kpiTop}>
            <div style={styles.iconBoxGreen}><FiCheckCircle size={22} /></div>
            <span style={styles.kpiLabel}>Days Present</span>
          </div>
          <div style={styles.kpiValueGreen}>{attendanceStats.present}</div>
          <div style={styles.kpiTrendNeutral}>Current Month (MTD)</div>
        </div>

        <div style={{ ...styles.kpiCard, ...styles.cardOrange }}>
          <div style={styles.kpiTop}>
            <div style={styles.iconBoxOrange}><FiCoffee size={22} /></div>
            <span style={styles.kpiLabel}>Leave Balance</span>
          </div>
          <div style={styles.kpiValueOrange}>14 <span style={{ fontSize: '20px', fontWeight: '600', color: '#b45309' }}>Days</span></div>
          <div style={styles.kpiTrendNeutral}>Next Accrual: 1st of next month</div>
        </div>

        <div style={{ ...styles.kpiCard, ...styles.cardPurple }}>
          <div style={styles.kpiTop}>
            <div style={styles.iconBoxPurple}><FiClock size={22} /></div>
            <span style={styles.kpiLabel}>Active Shift</span>
          </div>
          <div style={{ ...styles.kpiValuePurple, fontSize: '24px', paddingTop: '10px' }}>{dbUser?.shift || "Standard"}</div>
          <div style={styles.kpiTrendNeutral}>Based on your scheduled roster</div>
        </div>
      </div>

      {/* TWO COLUMN CONTENT AREA */}
      <div style={styles.contentLayout}>

        {/* Left Col - Weekly Schedule & Quick Actions */}
        <div style={styles.leftCol}>

          <div style={styles.dataPanel}>
            <div style={styles.panelHeader}>
              <FiCalendar style={styles.panelIcon} />
              <h3 style={styles.panelTitle}>Your Weekly Roster</h3>
            </div>
            <div style={styles.rosterContainer}>
              {["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"].map((day, i) => {
                const isToday = new Date().toLocaleDateString('en-US', { weekday: 'long' }) === day;
                return (
                  <div key={day} style={{ ...styles.listRow, ...(isToday ? styles.activeRow : {}) }}>
                    <div style={styles.dayCol}>
                      <span style={{ fontWeight: isToday ? '800' : '600', color: isToday ? '#0284c7' : '#1e293b' }}>{day}</span>
                      {isToday && <span style={styles.todayBadge}>TODAY</span>}
                    </div>
                    <span style={styles.shiftBadge}>09:00 - 18:00</span>
                    <span style={styles.locationBadge}>Office HQ</span>
                  </div>
                );
              })}
            </div>
          </div>

          <div style={styles.actionsPanel}>
            <h3 style={styles.panelTitle}>Quick Actions</h3>
            <div style={styles.actionGrid}>
              <button style={styles.actionBtn} onClick={() => onNavigate("leave")}>Request Leave</button>
              <button style={styles.actionBtn} onClick={() => onNavigate("payroll")}>View Payslips</button>
              <button style={styles.actionBtn} onClick={() => onNavigate("chat")}>Message Admin</button>
            </div>
          </div>

        </div>

        {/* Right Col - System Logs & Announcements */}
        <div style={styles.rightCol}>

          <div style={{ ...styles.dataPanel, flex: 1 }}>
            <div style={styles.panelHeader}>
              <FiActivity style={styles.panelIconGray} />
              <h3 style={styles.panelTitle}>Recent Activity Log</h3>
            </div>

            <div style={styles.logContainer}>
              {[
                { msg: "System Login Successful", time: "Just now", type: "success" },
                { msg: "Punch-in Recorded (Office Network)", time: "Today, 08:55 AM", type: "success" },
                { msg: "IT Security Policy Updated", time: "Yesterday, 02:30 PM", type: "info" },
                { msg: "September Payroll Slip Generated", time: "Sep 28, 05:45 PM", type: "info" },
                { msg: "Leave Request Approved by Manager", time: "Sep 15, 10:30 AM", type: "success" }
              ].map((log, i) => (
                <div key={i} style={styles.logRow}>
                  <div style={styles.timelineConnect} />
                  <div style={{ ...styles.logIndicator, background: log.type === 'success' ? '#10b981' : '#3b82f6' }} />
                  <div style={styles.logContent}>
                    <div style={styles.logMsg}>{log.msg}</div>
                    <div style={styles.logTime}>{log.time}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

const styles = {
  container: { padding: "40px", maxWidth: "1400px", margin: "0 auto", color: "#1e293b", minHeight: "100vh" },

  // Header
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    background: "#ffffff",
    padding: "30px 40px",
    borderRadius: "24px",
    border: "1px solid #e2e8f0",
    marginBottom: "40px",
    boxShadow: "0 10px 15px -3px rgba(0,0,0,0.02)"
  },
  identityGroup: { display: "flex", alignItems: "center", gap: "24px" },
  avatarWrapper: { width: "70px", height: "70px", background: "linear-gradient(135deg, #0284c7, #4f46e5)", borderRadius: "20px", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 4px 6px -1px rgba(2, 132, 199, 0.4)" },
  avatarLetter: { fontSize: "32px", fontWeight: "900", color: "#ffffff" },
  idInfo: { display: "flex", flexDirection: "column", gap: "4px" },
  statusBox: { display: "flex", alignItems: "center", gap: "6px" },
  statusDot: { fontSize: "10px", color: "#10b981", animation: "pulse 2s infinite" },
  statusText: { fontSize: "12px", color: "#64748b", fontWeight: "700", textTransform: "uppercase", letterSpacing: "1px" },
  idText: { fontSize: "28px", fontWeight: "900", margin: "2px 0 6px", color: "#0f172a", letterSpacing: "-0.5px" },
  roleSubtext: { display: "flex", alignItems: "center", gap: "6px", fontSize: "14px", color: "#475569", fontWeight: "500" },

  timeGroup: { display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "8px" },
  dateLabel: { fontSize: "14px", color: "#64748b", fontWeight: "600", textTransform: "uppercase", letterSpacing: "0.5px" },
  digitalClock: { fontSize: "32px", fontWeight: "800", color: "#0f172a", fontFamily: "'SF Mono', monospace", letterSpacing: "-1px" },
  punchBtn: { marginTop: "4px", padding: "10px 20px", background: "#f1f5f9", color: "#0284c7", border: "1px solid #cbd5e1", borderRadius: "10px", fontWeight: "800", display: "flex", alignItems: "center", cursor: "pointer", transition: "all 0.2s" },

  // KPI Grid
  kpiGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "24px", marginBottom: "40px" },
  kpiCard: { borderRadius: "24px", padding: "28px", border: "1px solid", position: "relative", overflow: "hidden", boxShadow: "0 4px 6px -1px rgba(0,0,0,0.02)", transition: "transform 0.2s" },

  cardBlue: { background: "#f0f9ff", borderColor: "#bae6fd" },
  cardGreen: { background: "#f0fdf4", borderColor: "#bbf7d0" },
  cardOrange: { background: "#fffbeb", borderColor: "#fde68a" },
  cardPurple: { background: "#faf5ff", borderColor: "#e9d5ff" },

  kpiTop: { display: "flex", alignItems: "center", gap: "12px", marginBottom: "16px" },
  kpiLabel: { fontSize: "14px", color: "#475569", textTransform: "uppercase", fontWeight: "800", letterSpacing: "0.5px" },

  iconBoxBlue: { width: "42px", height: "42px", borderRadius: "12px", background: "#e0f2fe", color: "#0284c7", display: "flex", alignItems: "center", justifyContent: "center" },
  iconBoxGreen: { width: "42px", height: "42px", borderRadius: "12px", background: "#dcfce7", color: "#16a34a", display: "flex", alignItems: "center", justifyContent: "center" },
  iconBoxOrange: { width: "42px", height: "42px", borderRadius: "12px", background: "#fef3c7", color: "#d97706", display: "flex", alignItems: "center", justifyContent: "center" },
  iconBoxPurple: { width: "42px", height: "42px", borderRadius: "12px", background: "#f3e8ff", color: "#9333ea", display: "flex", alignItems: "center", justifyContent: "center" },

  kpiValueBlue: { fontSize: "42px", fontWeight: "900", color: "#0c4a6e", letterSpacing: "-1px" },
  kpiValueGreen: { fontSize: "42px", fontWeight: "900", color: "#14532d", letterSpacing: "-1px" },
  kpiValueOrange: { fontSize: "42px", fontWeight: "900", color: "#78350f" },
  kpiValuePurple: { fontSize: "42px", fontWeight: "900", color: "#4c1d95" },

  kpiTrendPositive: { fontSize: "13px", color: "#16a34a", fontWeight: "700", marginTop: "12px" },
  kpiTrendNeutral: { fontSize: "13px", color: "#64748b", fontWeight: "600", marginTop: "12px" },

  // Content Area
  contentLayout: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "30px" },
  leftCol: { display: "flex", flexDirection: "column", gap: "30px" },
  rightCol: { display: "flex", flexDirection: "column", gap: "30px" },

  dataPanel: { background: "#ffffff", border: "1px solid #e2e8f0", borderRadius: "24px", padding: "32px", boxShadow: "0 10px 15px -3px rgba(0,0,0,0.02)" },
  panelHeader: { display: "flex", alignItems: "center", gap: "12px", marginBottom: "28px" },
  panelIcon: { fontSize: "24px", color: "#0284c7" },
  panelIconGray: { fontSize: "24px", color: "#64748b" },
  panelTitle: { fontSize: "20px", color: "#0f172a", fontWeight: "800", margin: 0 },

  // Weekly Roster
  rosterContainer: { display: "flex", flexDirection: "column", gap: "12px" },
  listRow: { display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 20px", background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: "16px" },
  activeRow: { background: "#f0f9ff", borderColor: "#bae6fd", boxShadow: "0 2px 4px rgba(2,132,199,0.05)" },
  dayCol: { display: "flex", alignItems: "center", gap: "10px", width: "120px" },
  todayBadge: { background: "#0284c7", color: "white", padding: "3px 8px", borderRadius: "6px", fontSize: "10px", fontWeight: "900" },
  shiftBadge: { fontFamily: "'SF Mono', monospace", fontSize: "14px", fontWeight: "700", color: "#334155" },
  locationBadge: { background: "#e2e8f0", padding: "6px 12px", borderRadius: "8px", fontSize: "12px", fontWeight: "800", color: "#475569" },

  // Quick Actions Widget
  actionsPanel: { background: "linear-gradient(135deg, #0f172a, #1e293b)", border: "none", borderRadius: "24px", padding: "32px", color: "white", boxShadow: "0 15px 25px -5px rgba(15, 23, 42, 0.4)" },
  actionGrid: { display: "flex", gap: "16px", marginTop: "24px" },
  actionBtn: { flex: 1, padding: "14px", background: "rgba(255,255,255,0.1)", color: "white", border: "1px solid rgba(255,255,255,0.2)", borderRadius: "12px", fontWeight: "700", fontSize: "14px", cursor: "pointer", transition: "background 0.2s" },

  // Activity Log
  logContainer: { display: "flex", flexDirection: "column", gap: "20px", position: "relative" },
  logRow: { display: "flex", gap: "20px", position: "relative", zIndex: 1 },
  timelineConnect: { position: "absolute", left: "11px", top: "24px", bottom: "-20px", width: "2px", background: "#f1f5f9", zIndex: -1 },
  logIndicator: { width: "24px", height: "24px", borderRadius: "50%", border: "4px solid #ffffff", boxShadow: "0 0 0 1px #e2e8f0", shrink: 0 },
  logContent: { flex: 1, background: "#f8fafc", padding: "16px 20px", borderRadius: "16px", border: "1px solid #e2e8f0" },
  logMsg: { fontSize: "15px", fontWeight: "700", color: "#1e293b", marginBottom: "4px" },
  logTime: { fontSize: "12px", color: "#64748b", fontWeight: "600" }
};

export default EmployeeDashboard;