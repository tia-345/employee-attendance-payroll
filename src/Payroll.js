import React, { useState, useEffect } from "react";
import API_URL from "./apiConfig";
import {
  Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  AreaChart, Area, ComposedChart, Line
} from "recharts";

function Payroll() {
  const [payrolls, setPayrolls] = useState([]);
  const [loading, setLoading] = useState(true);

  // Edit state (Only for Admins)
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({});

  // Securely get the current logged-in user from localStorage
  const currentUser = JSON.parse(localStorage.getItem("user")) || {};
  const isAdmin = currentUser.role === "admin";

  const fetchPayrolls = () => {
    fetch(`${API_URL}/api/payroll`)
      .then((res) => res.json())
      .then((data) => {
        // Role-based verification
        if (isAdmin) {
          setPayrolls(data);
        } else {
          // Employee only sees their own records based on email
          const userEmail = currentUser.email;
          const userPayrolls = data.filter(p => p.email === userEmail || p.employeeEmail === userEmail);
          setPayrolls(userPayrolls);
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error("Fetch Error:", err);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchPayrolls();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAdmin, currentUser.email]);

  // Handle Edit Click
  const handleEditClick = (p) => {
    setEditingId(p._id);
    setEditForm({
      baseSalary: p.baseSalary,
      presentDays: p.presentDays,
      absentDays: p.absentDays,
      overtimeHours: p.overtimeHours,
      bonus: p.bonus,
      deductions: p.deductions,
      deductionReason: p.deductionReason || "",
      netSalary: p.netSalary
    });
  };

  // Handle Input Change
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditForm(prev => ({ ...prev, [name]: name === "deductionReason" ? value : Number(value) }));
  };

  // Calculate Net Salary Dynamically during Edit
  const calculateEditedNetSalary = () => {
    const dailySalary = editForm.baseSalary / (editForm.presentDays + editForm.absentDays || 1);
    const salaryForPresentDays = dailySalary * editForm.presentDays;
    const overtimePay = editForm.overtimeHours * (dailySalary / 8) * 1.5;
    const net = salaryForPresentDays + overtimePay + editForm.bonus - editForm.deductions;
    setEditForm(prev => ({ ...prev, netSalary: Math.round(net) }));
  };

  // Handle Update Submit
  const handleUpdate = async (id) => {
    try {
      const res = await fetch(`${API_URL}/api/payroll/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editForm),
      });

      if (!res.ok) throw new Error("Correction failed");

      setEditingId(null);
      fetchPayrolls(); // Refresh data
    } catch (err) {
      alert("Error updating record: " + err.message);
    }
  };

  // Summary calculations dynamically based on visible records
  const totalPayroll = payrolls.reduce((s, p) => s + (p.netSalary || 0), 0);
  const totalEmployees = payrolls.length;
  const totalBonus = payrolls.reduce((s, p) => s + (p.bonus || 0), 0);
  const totalDeductions = payrolls.reduce((s, p) => s + (p.deductions || 0), 0);

  const summaryCards = [
    { label: isAdmin ? "Total Org Payroll" : "Total Earnings to Date", value: `₹${totalPayroll.toLocaleString()}`, color: "#22c55e" },
    { label: "Payroll Slips", value: totalEmployees, color: "#0284c7" },
    { label: isAdmin ? "Total Org Bonuses" : "Total Bonuses", value: `₹${totalBonus.toLocaleString()}`, color: "#4f46e5" },
    { label: isAdmin ? "Total Org Deductions" : "Total Deductions", value: `₹${totalDeductions.toLocaleString()}`, color: "#ef4444" },
  ];

  // Prepare chart data chronologically (oldest to newest)
  const chartData = [...payrolls].reverse().map(p => ({
    name: `${p.month.substring(0, 3)} ${p.year}`,
    NetSalary: p.netSalary || 0,
    BaseSalary: p.baseSalary || 0,
    Bonus: p.bonus || 0,
    Deductions: p.deductions || 0
  }));

  // Custom Tooltip for Charts
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div style={styles.chartTooltip}>
          <p style={{ fontWeight: 700, margin: "0 0 5px", color: "#1e293b" }}>{label}</p>
          {payload.map((entry, index) => (
            <p key={index} style={{ margin: "3px 0", color: entry.color, fontWeight: 600 }}>
              {entry.name}: ₹{entry.value.toLocaleString()}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div style={styles.page}>
      {/* Header */}
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>{isAdmin ? "Org Payroll Management" : "My Earnings Dashboard"}</h1>
          <p style={styles.subtitle}>{isAdmin ? "Employee Salary Records & Master Adjustments" : "Your Detailed Financial & Payroll History"}</p>
        </div>
        <div style={styles.badge}>
          <span style={styles.badgeDot}>●</span>
          <span style={styles.badgeText}>Live Sync</span>
        </div>
      </div>

      {/* KPI Cards */}
      <div style={styles.kpiGrid}>
        {summaryCards.map((card, i) => (
          <div key={i} style={styles.kpiCard}>
            <span style={styles.kpiLabel}>{card.label}</span>
            <div style={{ ...styles.kpiValue, color: card.color }}>{card.value}</div>
          </div>
        ))}
      </div>

      {/* DASHBOARD CHARTS FOR EMPLOYEE (Shows visual growth/bonuses) */}
      {!isAdmin && chartData.length > 0 && (
        <div style={styles.chartsGrid}>
          {/* Earnings & Base Salary Trend */}
          <div style={styles.chartCard}>
            <div style={styles.chartHeader}>
              <h3 style={styles.chartTitle}>Salary Progression</h3>
              <span style={styles.chartSubtitle}>Net Earnings vs Base Salary over time</span>
            </div>
            <div style={{ width: "100%", height: 280 }}>
              <ResponsiveContainer>
                <ComposedChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "#64748b" }} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "#64748b" }}
                    tickFormatter={(val) => `₹${val >= 1000 ? val / 1000 + 'k' : val}`} />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend wrapperStyle={{ fontSize: '13px', paddingTop: '10px' }} />
                  <Bar dataKey="BaseSalary" fill="#bae6fd" radius={[4, 4, 0, 0]} barSize={40} name="Base Salary" />
                  <Line type="monotone" dataKey="NetSalary" stroke="#0284c7" strokeWidth={3} dot={{ r: 4, strokeWidth: 2 }} name="Net Paid Amount" />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Bonus vs Deductions Graph */}
          <div style={styles.chartCard}>
            <div style={styles.chartHeader}>
              <h3 style={styles.chartTitle}>Bonuses & Variables</h3>
              <span style={styles.chartSubtitle}>Extra pay and deductions history</span>
            </div>
            <div style={{ width: "100%", height: 280 }}>
              <ResponsiveContainer>
                <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorBonus" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#818cf8" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#818cf8" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="colorDed" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#f87171" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="#f87171" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "#64748b" }} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "#64748b" }} />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend wrapperStyle={{ fontSize: '13px', paddingTop: '10px' }} />
                  <Area type="monotone" dataKey="Bonus" stroke="#4f46e5" strokeWidth={2} fillOpacity={1} fill="url(#colorBonus)" name="Bonuses Earned" />
                  <Area type="monotone" dataKey="Deductions" stroke="#ef4444" strokeWidth={2} fillOpacity={1} fill="url(#colorDed)" name="Deductions Taken" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {/* Table Container */}
      <div style={{ ...styles.tableContainer, marginTop: (!isAdmin && chartData.length > 0) ? "40px" : "0px" }}>
        <div style={styles.tableHeader}>
          <h3 style={styles.tableTitle}>{isAdmin ? "All Staff Payroll Records" : "My Itemized Slip History"}</h3>
          <span style={styles.recordCount}>{totalEmployees} Document{totalEmployees !== 1 ? "s" : ""}</span>
        </div>

        {loading ? (
          <div style={styles.emptyState}>
            <p style={styles.emptyText}>Syncing records securely...</p>
          </div>
        ) : payrolls.length === 0 ? (
          <div style={styles.emptyState}>
            <p style={styles.emptyIcon}>🗂️</p>
            <p style={styles.emptyText}>No payroll records found</p>
            <p style={styles.emptyHint}>
              {isAdmin
                ? "Generate payroll for this month in the Admin Panel to begin."
                : "Your payroll has not been deposited by HR yet."}
            </p>
          </div>
        ) : (
          <div style={styles.tableWrap}>
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>Month</th>
                  {isAdmin && <th style={styles.th}>Employee / Email</th>}
                  <th style={styles.th}>Base Salary</th>
                  <th style={styles.th}>Attendance</th>
                  <th style={styles.th}>OT Hrs</th>
                  <th style={styles.th}>Bonus</th>
                  <th style={styles.th}>Deductions</th>
                  <th style={styles.th}>Deduction Reason</th>
                  <th style={{ ...styles.th, textAlign: "right" }}>Net Deposit Amount</th>
                  {isAdmin && <th style={styles.th}>Audit Actions</th>}
                </tr>
              </thead>
              <tbody>
                {payrolls.map((p, idx) => {
                  const isEditing = editingId === p._id;

                  return (
                    <tr
                      key={p._id}
                      style={{
                        ...styles.tr,
                        backgroundColor: isEditing ? "#eff6ff" : (idx % 2 === 0 ? "#f8fafc" : "#ffffff"),
                      }}
                      onMouseEnter={(e) => { if (!isEditing) e.currentTarget.style.backgroundColor = "#f1f5f9"; }}
                      onMouseLeave={(e) => { if (!isEditing) e.currentTarget.style.backgroundColor = idx % 2 === 0 ? "#f8fafc" : "#ffffff"; }}
                    >
                      <td style={styles.td}>
                        <div style={styles.monthTag}>
                          <span style={styles.monthBadge}>{p.month}</span>
                          <span style={styles.yearText}>{p.year}</span>
                        </div>
                      </td>

                      {isAdmin && (
                        <td style={styles.td}>
                          <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                            <strong style={{ color: "#1e293b" }}>{p.employeeName || "User"}</strong>
                            <span style={{ fontSize: "11px", color: "#64748b" }}>{p.employeeEmail || p.email}</span>
                          </div>
                        </td>
                      )}

                      {/* EDIT MODE TOGGLES */}
                      {isEditing ? (
                        <>
                          <td style={styles.td}><input type="number" name="baseSalary" value={editForm.baseSalary} onChange={handleInputChange} onBlur={calculateEditedNetSalary} style={styles.editInput} /></td>
                          <td style={styles.td}>
                            <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
                              P: <input type="number" name="presentDays" value={editForm.presentDays} onChange={handleInputChange} onBlur={calculateEditedNetSalary} style={styles.editInputSmall} />
                              A: <input type="number" name="absentDays" value={editForm.absentDays} onChange={handleInputChange} onBlur={calculateEditedNetSalary} style={styles.editInputSmall} />
                            </div>
                          </td>
                          <td style={styles.td}><input type="number" name="overtimeHours" value={editForm.overtimeHours} onChange={handleInputChange} onBlur={calculateEditedNetSalary} style={styles.editInputSmall} /></td>
                          <td style={styles.td}><input type="number" name="bonus" value={editForm.bonus} onChange={handleInputChange} onBlur={calculateEditedNetSalary} style={{ ...styles.editInput, color: "#4f46e5" }} /></td>
                          <td style={styles.td}><input type="number" name="deductions" value={editForm.deductions} onChange={handleInputChange} onBlur={calculateEditedNetSalary} style={{ ...styles.editInput, color: "#ef4444" }} /></td>
                          <td style={styles.td}><input type="text" name="deductionReason" value={editForm.deductionReason} onChange={handleInputChange} placeholder="Reason..." style={{ ...styles.editInput, width: "120px", fontSize: "12px" }} /></td>
                          <td style={styles.tdNetEdit}>
                            ₹<input type="number" name="netSalary" value={editForm.netSalary} onChange={handleInputChange} style={{ ...styles.editInput, fontWeight: "900", color: "#059669", background: "transparent", border: "none", width: "100px", fontSize: "16px" }} />
                          </td>
                        </>
                      ) : (
                        <>
                          <td style={styles.tdMoney}>₹{(p.baseSalary || 0).toLocaleString()}</td>
                          <td style={styles.td}>
                            <div style={{ display: "flex", gap: "6px" }}>
                              <span style={styles.presentBadge}>{p.presentDays} P</span>
                              <span style={styles.absentBadge}>{p.absentDays} A</span>
                            </div>
                          </td>
                          <td style={styles.td}>
                            {p.overtimeHours > 0 ? <span style={styles.otBadge}>{p.overtimeHours}h</span> : <span style={{ color: "#94a3b8" }}>-</span>}
                          </td>
                          <td style={{ ...styles.tdMoney, color: "#4f46e5" }}>₹{(p.bonus || 0).toLocaleString()}</td>
                          <td style={{ ...styles.tdMoney, color: "#ef4444" }}>₹{(p.deductions || 0).toLocaleString()}</td>
                          <td style={styles.td}>
                            <span style={{ fontSize: "12px", color: "#64748b", fontStyle: "italic" }}>
                              {p.deductionReason || <span style={{ color: "#cbd5e1" }}>None</span>}
                            </span>
                          </td>
                          <td style={styles.tdNet}>₹{(p.netSalary || 0).toLocaleString()}</td>
                        </>
                      )}

                      {/* ACTIONS */}
                      {isAdmin && (
                        <td style={styles.td}>
                          {isEditing ? (
                            <div style={styles.actionGroup}>
                              <button onClick={() => handleUpdate(p._id)} style={styles.saveBtn}>Save</button>
                              <button onClick={() => setEditingId(null)} style={styles.cancelBtn}>✕</button>
                            </div>
                          ) : (
                            <button onClick={() => handleEditClick(p)} style={styles.editBtn}>Modify</button>
                          )}
                        </td>
                      )}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

const styles = {
  page: {
    padding: "40px",
    width: "100%",
    maxWidth: "1400px",
    margin: "0 auto",
    color: "#1e293b",
    minHeight: "100vh",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "40px",
  },
  title: {
    fontSize: "36px",
    fontWeight: "900",
    margin: "0 0 6px",
    letterSpacing: "-0.5px",
    color: "#0f172a",
  },
  subtitle: {
    color: "#64748b",
    margin: 0,
    fontSize: "15px",
    fontWeight: "500",
  },
  badge: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    background: "#ffffff",
    padding: "10px 22px",
    borderRadius: "12px",
    border: "1px solid #e2e8f0",
    boxShadow: "0 2px 4px rgba(0,0,0,0.02)"
  },
  badgeDot: { color: "#10b981", fontSize: "10px" },
  badgeText: {
    fontSize: "12px",
    fontWeight: "800",
    textTransform: "uppercase",
    letterSpacing: "1px",
    color: "#475569",
  },
  kpiGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
    gap: "24px",
    marginBottom: "40px",
  },
  kpiCard: {
    background: "#ffffff",
    border: "1px solid #e2e8f0",
    padding: "26px",
    borderRadius: "20px",
    boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.02)",
  },
  kpiLabel: {
    fontSize: "13px",
    color: "#64748b",
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: "1px",
  },
  kpiValue: {
    fontSize: "36px",
    fontWeight: "900",
    marginTop: "12px",
    letterSpacing: "-1px",
  },

  // Chart Grid
  chartsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(450px, 1fr))",
    gap: "30px",
  },
  chartCard: {
    background: "#ffffff",
    border: "1px solid #e2e8f0",
    borderRadius: "24px",
    padding: "30px",
    boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.02), 0 4px 6px -2px rgba(0, 0, 0, 0.01)",
  },
  chartHeader: {
    marginBottom: "30px",
  },
  chartTitle: {
    fontSize: "20px",
    fontWeight: "800",
    color: "#0f172a",
    margin: "0 0 6px",
  },
  chartSubtitle: {
    fontSize: "14px",
    color: "#64748b",
  },
  chartTooltip: {
    background: "#ffffff",
    border: "1px solid #e2e8f0",
    borderRadius: "12px",
    padding: "16px",
    boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)",
    fontSize: "13px"
  },

  // Table Structure
  tableContainer: {
    background: "#ffffff",
    border: "1px solid #e2e8f0",
    borderRadius: "24px",
    overflow: "hidden",
    boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.02)",
  },
  tableHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "28px 35px",
    borderBottom: "1px solid #e2e8f0",
    background: "#f8fafc",
  },
  tableTitle: {
    margin: 0,
    fontSize: "19px",
    fontWeight: "800",
    color: "#0f172a",
  },
  recordCount: {
    fontSize: "13px",
    color: "#475569",
    background: "#e2e8f0",
    padding: "6px 16px",
    borderRadius: "20px",
    fontWeight: "700",
  },
  tableWrap: {
    overflowX: "auto",
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
  },
  th: {
    padding: "18px 24px",
    textAlign: "left",
    fontSize: "12px",
    fontWeight: "800",
    textTransform: "uppercase",
    letterSpacing: "1px",
    color: "#64748b",
    borderBottom: "2px solid #e2e8f0",
    whiteSpace: "nowrap",
    background: "#ffffff",
  },
  tr: {
    transition: "background-color 0.2s ease",
  },
  td: {
    padding: "20px 24px",
    fontSize: "14px",
    color: "#334155",
    borderBottom: "1px solid #f1f5f9",
    whiteSpace: "nowrap",
    verticalAlign: "middle",
  },
  tdMoney: {
    padding: "20px 24px",
    fontSize: "15px",
    fontWeight: "600",
    color: "#1e293b",
    borderBottom: "1px solid #f1f5f9",
    whiteSpace: "nowrap",
    fontFamily: "'SF Mono', ui-monospace, 'Courier New', monospace",
  },
  tdNet: {
    padding: "20px 24px",
    fontSize: "16px",
    fontWeight: "900",
    color: "#059669",
    borderBottom: "1px solid #f1f5f9",
    whiteSpace: "nowrap",
    textAlign: "right",
    fontFamily: "'SF Mono', ui-monospace, 'Courier New', monospace",
  },
  tdNetEdit: {
    padding: "20px 24px",
    borderBottom: "1px solid #f1f5f9",
    whiteSpace: "nowrap",
    textAlign: "right",
    background: "#ecfdf5",
    borderLeft: "2px solid #10b981",
  },

  // Custom Cell Elements
  monthTag: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
  },
  yearText: {
    fontSize: "13px",
    fontWeight: "600",
    color: "#94a3b8",
  },
  monthBadge: {
    background: "#e0f2fe",
    color: "#0369a1",
    padding: "6px 14px",
    borderRadius: "8px",
    fontSize: "13px",
    fontWeight: "700",
  },
  presentBadge: {
    background: "#dcfce7",
    color: "#166534",
    padding: "4px 10px",
    borderRadius: "6px",
    fontSize: "12px",
    fontWeight: "800",
  },
  absentBadge: {
    background: "#fee2e2",
    color: "#991b1b",
    padding: "4px 10px",
    borderRadius: "6px",
    fontSize: "12px",
    fontWeight: "800",
  },
  otBadge: {
    background: "#fef3c7",
    color: "#92400e",
    padding: "4px 10px",
    borderRadius: "6px",
    fontSize: "12px",
    fontWeight: "800",
  },

  // Edit State & Actions
  editInput: {
    width: "90px",
    padding: "8px 10px",
    borderRadius: "8px",
    border: "2px solid #bae6fd",
    background: "#ffffff",
    color: "#0f172a",
    outline: "none",
    fontWeight: "600",
    fontFamily: "monospace",
    transition: "border-color 0.2s"
  },
  editInputSmall: {
    width: "50px",
    padding: "8px 6px",
    borderRadius: "8px",
    border: "2px solid #cbd5e1",
    background: "#ffffff",
    color: "#0f172a",
    outline: "none",
    textAlign: "center",
    fontWeight: "700",
  },
  editBtn: {
    background: "#f8fafc",
    color: "#4f46e5",
    border: "1px solid #e2e8f0",
    padding: "8px 16px",
    borderRadius: "10px",
    fontWeight: "700",
    cursor: "pointer",
    fontSize: "13px",
    boxShadow: "0 1px 2px rgba(0,0,0,0.02)",
    transition: "all 0.2s"
  },
  actionGroup: {
    display: "flex",
    gap: "8px"
  },
  saveBtn: {
    background: "#10b981",
    color: "white",
    border: "none",
    padding: "8px 16px",
    borderRadius: "10px",
    fontWeight: "800",
    cursor: "pointer",
    fontSize: "13px",
    boxShadow: "0 4px 6px -1px rgba(16,185,129,0.3)",
  },
  cancelBtn: {
    background: "#f1f5f9",
    color: "#64748b",
    border: "1px solid #cbd5e1",
    padding: "8px 12px",
    borderRadius: "10px",
    fontWeight: "800",
    cursor: "pointer",
    fontSize: "13px",
  },
  emptyState: {
    padding: "100px 40px",
    textAlign: "center",
  },
  emptyIcon: {
    fontSize: "56px",
    marginBottom: "16px",
  },
  emptyText: {
    fontSize: "20px",
    fontWeight: "800",
    color: "#0f172a",
    margin: "0 0 10px",
  },
  emptyHint: {
    fontSize: "15px",
    color: "#64748b",
    margin: 0,
    fontWeight: "500",
  },
};

export default Payroll;