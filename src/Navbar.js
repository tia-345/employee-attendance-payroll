import React, { useState, useEffect } from "react";
import logo from "./logo.png";

function Navbar({ onLogout, onNavigate, role, pendingCount }) {
  const [unreadCount, setUnreadCount] = useState(0);

  // Poll for new messages (Both Roles)
  useEffect(() => {
    const currentUser = JSON.parse(localStorage.getItem("user")) || {};
    const userEmail = currentUser.email;

    const checkUnread = () => {
      const msgs = JSON.parse(localStorage.getItem("chat_messages")) || [];
      const lastRead = localStorage.getItem(`last_read_${role === "admin" ? "admin" : userEmail}`) || 0;

      let count = 0;
      msgs.forEach(msg => {
        if (role === "admin") {
          // Admin sees messages where receiver is "admin"
          if (msg.receiver === "admin" && msg.id > Number(lastRead)) {
            count++;
          }
        } else {
          // Employee sees messages from admin
          if ((msg.receiver === "ALL" || msg.receiver === userEmail) && msg.sender === "admin") {
            if (msg.id > Number(lastRead)) {
              count++;
            }
          }
        }
      });
      setUnreadCount(count);
    };

    checkUnread();
    const interval = setInterval(checkUnread, 2000);
    return () => clearInterval(interval);
  }, [role]);

  return (
    <nav style={styles.nav}>
      <div style={styles.brand} onClick={() => onNavigate("dashboard")}>
        <img src={logo} alt="ClockIn Logo" style={styles.logo} />
        <span style={styles.name}>ClockIn</span>
      </div>

      <ul style={styles.menu}>
        <li onClick={() => onNavigate("dashboard")}>Dashboard</li>

        {/* EMPLOYEE SIDEBAR */}
        {role === "employee" && (
          <>
            <li onClick={() => onNavigate("attendance")}>My Attendance</li>
            <li onClick={() => onNavigate("payroll")}>Payroll</li>
            <li onClick={() => onNavigate("leave")}>Leave</li>
            <li onClick={() => onNavigate("chat")} style={styles.relativeLi}>
              Chat
              {unreadCount > 0 && (
                <span title={`${unreadCount} New Message(s) from Admin`} style={styles.notificationBadge}>
                  <span style={styles.bulbPulse}></span>
                </span>
              )}
            </li>
            <li onClick={() => onNavigate("profile")}>Profile</li>
            <li onClick={() => onNavigate("shifts")}>Shifts & Holidays</li>
          </>
        )}

        {/* ADMIN SIDEBAR */}
        {role === "admin" && (
          <>
            <li onClick={() => onNavigate("employees")}>Employees</li>
            <li onClick={() => onNavigate("payroll")}>Payroll</li>
            <li onClick={() => onNavigate("leave")}>
              Leave Requests
              {pendingCount > 0 && (
                <span style={styles.badge}>{pendingCount}</span>
              )}
            </li>
            <li onClick={() => onNavigate("messages")} style={styles.relativeLi}>
              Messages
              {unreadCount > 0 && (
                <span title={`${unreadCount} New Message(s)`} style={styles.notificationBadge}>
                  <span style={styles.bulbPulse}></span>
                </span>
              )}
            </li>
            <li onClick={() => onNavigate("profile")}>Profile</li>
            <li onClick={() => onNavigate("shifts")}>Shifts & Holidays</li>
          </>
        )}

        <li style={styles.logout} onClick={onLogout}>Logout</li>
      </ul>
    </nav>
  );
}

const styles = {
  nav: {
    height: "80px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "0 40px",
    background: "#f1f5f9",
    borderBottom: "1px solid #cbd5e1",
  },
  brand: { display: "flex", alignItems: "center", gap: "14px", cursor: "pointer" },
  logo: { width: "40px", height: "40px" },
  name: { fontSize: "26px", fontWeight: "700", color: "#0284c7" },
  menu: { display: "flex", gap: "26px", listStyle: "none", fontSize: "16px", fontWeight: "600", cursor: "pointer", color: "#334155", alignItems: "center", margin: 0, padding: 0 },
  relativeLi: { position: "relative", display: "flex", alignItems: "center" },
  notificationBadge: {
    marginLeft: "8px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  bulbPulse: {
    width: "10px",
    height: "10px",
    background: "#0ea5e9",
    borderRadius: "50%",
    boxShadow: "0 0 10px #0ea5e9, 0 0 20px #0ea5e9",
    display: "inline-block",
    animation: "bulbGlow 1.5s infinite ease-in-out"
  },
  badge: {
    marginLeft: "6px",
    background: "#ef4444",
    color: "#ffffff",
    padding: "2px 8px",
    borderRadius: "50%",
    fontSize: "12px",
    fontWeight: "800"
  },
  logout: { color: "#dc2626", fontWeight: "bold", cursor: "pointer" },
};

export default Navbar;
