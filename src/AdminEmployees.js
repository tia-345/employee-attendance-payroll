import React, { useState, useEffect } from "react";
import { FiUserPlus, FiUsers, FiMail, FiPhone, FiBriefcase, FiMapPin, FiShield } from "react-icons/fi";
import API_URL from "./apiConfig";


function AdminEmployees() {
  const [employees, setEmployees] = useState([]);
  const [activeTab, setActiveTab] = useState("directory"); // 'directory' or 'add'
  const [loading, setLoading] = useState(false);
  const [submitStatus, setSubmitStatus] = useState(null);
  const [chatHistory, setChatHistory] = useState([]);

  const initialForm = {
    name: "",
    email: "",
    password: "",
    department: "",
    designation: "",
    salary: "",
    role: "employee",
    phone: "",
    bloodGroup: "",
    manager: "",
    shift: "",
    location: "",
    dateOfJoining: "",
    emergencyContactName: "",
    emergencyContactPhone: "",
    emergencyContactRelation: ""
  };

  const [form, setForm] = useState(initialForm);
  const [editingId, setEditingId] = useState(null);

  // Fetch employees
  const fetchEmployees = () => {
    fetch(`${API_URL}/api/employees`)
      .then(res => res.json())
      .then(data => setEmployees(data))
      .catch(err => console.error(err));
  };

  useEffect(() => {
    fetchEmployees();
    
    // Poll for messages to show notification bulbs
    const checkMsgs = () => {
        const msgs = JSON.parse(localStorage.getItem("chat_messages")) || [];
        setChatHistory(msgs);
    };
    checkMsgs();
    const interval = setInterval(checkMsgs, 2000);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const hasUnread = (email) => {
    const lastRead = localStorage.getItem("last_read_admin") || 0;
    return chatHistory.some(msg => msg.sender === email && msg.receiver === "admin" && msg.id > Number(lastRead));
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleEdit = (employee) => {
    setEditingId(employee._id);
    setActiveTab("add");
    // Pre-fill form without password (unless they want to change it)
    setForm({
      ...employee,
      password: "", // Don't show hashed password or force change
      dateOfJoining: employee.dateOfJoining ? employee.dateOfJoining.split("T")[0] : ""
    });
  };

  const resetForm = () => {
    setForm(initialForm);
    setEditingId(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setSubmitStatus(null);

    const url = editingId 
        ? `${API_URL}/api/employees/${editingId}`
        : `${API_URL}/api/employees`;
    
    const method = editingId ? "PUT" : "POST";
    
    // For editing, if password is empty, don't send it to backend to avoid hashing empty string
    const submitData = { 
        ...form,
        salary: Number(form.salary),
        dateOfJoining: form.dateOfJoining || null
    };
    if (editingId && !submitData.password) {
        delete submitData.password;
    }

    try {
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(submitData)
      });
      const data = await res.json();
      setLoading(false);

      if (!res.ok) {
        throw new Error(data.message || "Something went wrong");
      }

      setSubmitStatus({ type: "success", message: editingId ? "Employee updated successfully!" : "Employee profile created automatically!" });
      
      // Refresh list
      fetchEmployees();

      // Reset form and return to directory after 2s
      setTimeout(() => {
        resetForm();
        setActiveTab("directory");
        setSubmitStatus(null);
      }, 2000);

    } catch (err) {
      setSubmitStatus({ type: "error", message: err.message });
      setLoading(false);
    }
  };

  return (
    <div style={styles.page}>

      {/* Header & Tabs */}
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>Personnel Management</h1>
          <p style={styles.subtitle}>Manage your organization's workforce and onboard new hires.</p>
        </div>

        <div style={styles.tabContainer}>
          <button
            style={{ ...styles.tabBtn, ...(activeTab === "directory" ? styles.activeTab : {}) }}
            onClick={() => { setActiveTab("directory"); resetForm(); }}
          >
            <FiUsers /> Employee Directory
          </button>
          <button
            style={{ ...styles.tabBtn, ...(activeTab === "add" ? styles.activeTab : {}) }}
            onClick={() => setActiveTab("add")}
          >
            <FiUserPlus /> {editingId ? "Edit Identity" : "Onboard New Hire"}
          </button>
        </div>
      </div>

      {/* DIR TAB */}
      {activeTab === "directory" && (
        <div style={styles.card}>
          <div style={styles.cardHeader}>
            <h3 style={styles.cardTitle}>Active Staff Roster</h3>
            <span style={styles.badge}>{employees.length} Total Employees</span>
          </div>

          <div style={styles.tableWrap}>
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>Employee Name</th>
                  <th style={styles.th}>Contact Info</th>
                  <th style={styles.th}>Department & Role</th>
                  <th style={styles.th}>Office Location</th>
                  <th style={styles.th}>System Access</th>
                  <th style={styles.th}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {employees.map((emp, i) => (
                  <tr key={emp._id} style={{ ...styles.tr, backgroundColor: i % 2 === 0 ? "#f8fafc" : "#ffffff" }}>
                    <td style={styles.td}>
                      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                        <div style={styles.empName}>{emp.name}</div>
                        {hasUnread(emp.email) && (
                          <span title="New Unread Message" style={styles.bulbPulse}></span>
                        )}
                      </div>
                      <div style={styles.empSub}>{emp.designation}</div>
                    </td>
                    <td style={styles.td}>
                      <div style={styles.contactRow}><FiMail style={styles.iconSmall} /> {emp.email}</div>
                      <div style={styles.contactRow}><FiPhone style={styles.iconSmall} /> {emp.phone || "N/A"}</div>
                    </td>
                    <td style={styles.td}>
                      <span style={styles.deptBadge}>{emp.department || "General"}</span>
                    </td>
                    <td style={styles.td}>{emp.location || "Headquarters"}</td>
                    <td style={styles.td}>
                      <span style={emp.role === 'admin' ? styles.adminBadge : styles.empBadge}>
                        {emp.role.toUpperCase()}
                      </span>
                    </td>
                    <td style={styles.td}>
                      <button style={styles.editActionBtn} onClick={() => handleEdit(emp)}>Edit Info</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ADD/EDIT TAB */}
      {activeTab === "add" && (
        <div style={styles.card}>
          <div style={styles.cardHeader}>
            <h3 style={styles.cardTitle}>{editingId ? "Update Employee Data" : "Onboard New Employee"}</h3>
          </div>
          <form onSubmit={handleSubmit} style={styles.formWrapper}>
            {submitStatus && (
              <div style={{
                ...styles.statusBanner,
                backgroundColor: submitStatus.type === 'success' ? '#dcfce7' : '#fee2e2',
                color: submitStatus.type === 'success' ? '#166534' : '#991b1b',
                borderLeftColor: submitStatus.type === 'success' ? '#10b981' : '#ef4444'
              }}>
                {submitStatus.message || submitStatus.msg}
              </div>
            )}

          <div style={styles.formGrid}>

            {/* Box 1: Account Setup */}
            <div style={styles.formSection}>
              <div style={styles.sectionHeader}>
                <FiShield style={styles.sectionIcon} />
                <h3 style={styles.sectionTitle}>System Credentials</h3>
              </div>

              <div style={styles.inputRow}>
                <div style={styles.inputGroup}>
                  <label style={styles.label}>Full Name *</label>
                  <input style={styles.input} name="name" value={form.name} onChange={handleChange} placeholder="e.g. Sarah Connor" required />
                </div>
                <div style={styles.inputGroup}>
                  <label style={styles.label}>Email Address *</label>
                  <input style={styles.input} name="email" value={form.email} onChange={handleChange} placeholder="work@company.com" type="email" required />
                </div>
              </div>

              <div style={styles.inputRow}>
                <div style={styles.inputGroup}>
                  <label style={styles.label}>Temporary Password *</label>
                  <input style={styles.input} name="password" value={form.password} onChange={handleChange} placeholder="Min 8 characters" type="password" required />
                </div>
                <div style={styles.inputGroup}>
                  <label style={styles.label}>System Access Level *</label>
                  <select style={styles.select} name="role" value={form.role} onChange={handleChange} required>
                    <option value="employee">Standard Employee</option>
                    <option value="admin">Administrator</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Box 2: Job Assignment */}
            <div style={styles.formSection}>
              <div style={styles.sectionHeader}>
                <FiBriefcase style={styles.sectionIcon} />
                <h3 style={styles.sectionTitle}>Role & Placement</h3>
              </div>

              <div style={styles.inputRow}>
                <div style={styles.inputGroup}>
                  <label style={styles.label}>Department *</label>
                  <select style={styles.select} name="department" value={form.department} onChange={handleChange} required>
                    <option value="">-- Assign Department --</option>
                    <option value="Engineering">Engineering / IT</option>
                    <option value="Human Resources">Human Resources</option>
                    <option value="Finance">Finance & Accounting</option>
                    <option value="Marketing">Sales & Marketing</option>
                    <option value="Operations">Operations</option>
                    <option value="Executive">Executive</option>
                  </select>
                </div>
                <div style={styles.inputGroup}>
                  <label style={styles.label}>Designation *</label>
                  <input style={styles.input} name="designation" value={form.designation} onChange={handleChange} placeholder="e.g. Senior Software Engineer" required />
                </div>
              </div>

              <div style={styles.inputRow}>
                <div style={styles.inputGroup}>
                  <label style={styles.label}>Reporting Manager</label>
                  <input style={styles.input} name="manager" value={form.manager} onChange={handleChange} placeholder="Manager's Name" />
                </div>
                <div style={styles.inputGroup}>
                  <label style={styles.label}>Base Salary (₹) *</label>
                  <input style={styles.input} name="salary" value={form.salary} onChange={handleChange} placeholder="Amount per month" type="number" required />
                </div>
              </div>
            </div>

            {/* Box 3: Logistics */}
            <div style={styles.formSection}>
              <div style={styles.sectionHeader}>
                <FiMapPin style={styles.sectionIcon} />
                <h3 style={styles.sectionTitle}>Logistics & Deployment</h3>
              </div>

              <div style={styles.inputRow}>
                <div style={styles.inputGroup}>
                  <label style={styles.label}>Office Location</label>
                  <select style={styles.select} name="location" value={form.location} onChange={handleChange}>
                    <option value="">-- Select Hub --</option>
                    <option value="HQ - New York">Headquarters</option>
                    <option value="Branch - San Francisco">Branch A</option>
                    <option value="Branch - London">Branch B</option>
                    <option value="Remote Workforce">Remote / WFH</option>
                  </select>
                </div>
                <div style={styles.inputGroup}>
                  <label style={styles.label}>Shift Assignment *</label>
                  <select style={styles.select} name="shift" value={form.shift} onChange={handleChange} required>
                    <option value="">-- Select Schedule --</option>
                    <option value="Standard Day Shift (09:00 - 18:00)">Standard Day Shift (09:00 - 18:00)</option>
                    <option value="Evening Shift (14:00 - 23:00)">Evening Shift (14:00 - 23:00)</option>
                    <option value="Night Shift (22:00 - 07:00)">Night Shift (22:00 - 07:00)</option>
                  </select>
                </div>
              </div>

              <div style={styles.inputRow}>
                <div style={styles.inputGroup}>
                  <label style={styles.label}>Official Joining Date *</label>
                  <input style={styles.input} name="dateOfJoining" value={form.dateOfJoining} onChange={handleChange} type="date" required />
                </div>
                <div style={styles.inputGroup}>
                  <label style={styles.label}>Personal Phone</label>
                  <input style={styles.input} name="phone" value={form.phone} onChange={handleChange} placeholder="+1 234 567 8900" type="tel" />
                </div>
              </div>
            </div>

            {/* Box 4: Emergency Contacts */}
            <div style={styles.formSection}>
              <div style={styles.sectionHeader}>
                <FiUserPlus style={styles.sectionIcon} />
                <h3 style={styles.sectionTitle}>Health & Emergency Info</h3>
              </div>

              <div style={styles.inputRow}>
                <div style={styles.inputGroup}>
                  <label style={styles.label}>Blood Group</label>
                  <select style={styles.select} name="bloodGroup" value={form.bloodGroup} onChange={handleChange}>
                    <option value="">-- Select Type --</option>
                    {["A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"].map(bg => (
                      <option key={bg} value={bg}>{bg}</option>
                    ))}
                  </select>
                </div>
                <div style={styles.inputGroup}>
                  <label style={styles.label}>Emergency Contact Name</label>
                  <input style={styles.input} name="emergencyContactName" value={form.emergencyContactName} onChange={handleChange} placeholder="Next of Kin Name" />
                </div>
              </div>

              <div style={styles.inputRow}>
                <div style={styles.inputGroup}>
                  <label style={styles.label}>Emergency Contact Phone</label>
                  <input style={styles.input} name="emergencyContactPhone" value={form.emergencyContactPhone} onChange={handleChange} placeholder="Phone Number" />
                </div>
                <div style={styles.inputGroup}>
                  <label style={styles.label}>Relationship</label>
                  <input style={styles.input} name="emergencyContactRelation" value={form.emergencyContactRelation} onChange={handleChange} placeholder="e.g. Spouse / Parent" />
                </div>
              </div>
            </div>

          </div> {/* End grid */}

          {/* Submit Actions */}
          <div style={styles.submitArea}>
            <button type="button" style={styles.cancelBtn} onClick={() => setActiveTab("directory")}>Cancel Registration</button>
            <button type="submit" style={styles.submitBtn} disabled={loading}>
              {loading ? "Processing Database Entry..." : (editingId ? "✔ Update Profile" : "✔ Create & Onboard Employee")}
            </button>
          </div>
        </form>
      </div>
    )}

    </div>
  );
}

const styles = {
  page: {
    padding: "30px 50px",
    color: "#1e293b",
    maxWidth: "1400px",
    margin: "0 auto",
    minHeight: "100vh"
  },

  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-end",
    marginBottom: "40px",
  },
  title: { fontSize: "32px", fontWeight: "900", margin: "0 0 8px", color: "#0f172a", letterSpacing: "-0.5px" },
  subtitle: { color: "#64748b", margin: 0, fontSize: "16px" },

  tabContainer: {
    display: "flex",
    background: "#e2e8f0",
    padding: "6px",
    borderRadius: "14px",
    gap: "8px",
  },
  tabBtn: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    padding: "12px 24px",
    borderRadius: "10px",
    border: "none",
    background: "transparent",
    color: "#475569",
    fontWeight: "700",
    fontSize: "15px",
    cursor: "pointer",
    transition: "all 0.2s"
  },
  activeTab: {
    background: "#ffffff",
    color: "#0284c7",
    boxShadow: "0 4px 6px -1px rgba(0,0,0,0.05)"
  },
  editTab: {
    background: "#fef3c7",
    color: "#d97706",
    boxShadow: "0 4px 6px -1px rgba(217,119,6,0.2)"
  },

  // Directory Styles
  card: {
    background: "#ffffff",
    border: "1px solid #cbd5e1",
    borderRadius: "20px",
    overflow: "hidden",
    boxShadow: "0 10px 15px -3px rgba(0,0,0,0.02)"
  },
  cardHeader: {
    padding: "24px 30px",
    borderBottom: "1px solid #e2e8f0",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    background: "#f8fafc"
  },
  cardTitle: { margin: 0, fontSize: "18px", fontWeight: "800", color: "#0f172a" },
  badge: { background: "#e0f2fe", color: "#0369a1", padding: "6px 16px", borderRadius: "20px", fontSize: "13px", fontWeight: "700" },

  tableWrap: { overflowX: "auto" },
  table: { width: "100%", borderCollapse: "collapse" },
  th: { padding: "18px 30px", textAlign: "left", fontSize: "12px", fontWeight: "800", textTransform: "uppercase", letterSpacing: "1px", color: "#64748b", borderBottom: "2px solid #e2e8f0" },
  tr: { transition: "background-color 0.2s" },
  td: { padding: "20px 30px", borderBottom: "1px solid #f1f5f9", verticalAlign: "middle" },

  empName: { fontSize: "16px", fontWeight: "700", color: "#0f172a", marginBottom: "4px" },
  empSub: { fontSize: "13px", color: "#64748b", fontWeight: "500" },
  contactRow: { display: "flex", alignItems: "center", gap: "8px", fontSize: "14px", color: "#334155", margin: "4px 0" },
  iconSmall: { color: "#94a3b8" },

  deptBadge: { background: "#f1f5f9", color: "#334155", padding: "6px 12px", borderRadius: "8px", fontSize: "13px", fontWeight: "600", border: "1px solid #e2e8f0" },
  adminBadge: { background: "#fef2f2", color: "#dc2626", padding: "6px 12px", borderRadius: "8px", fontSize: "12px", fontWeight: "800", border: "1px solid #fecaca" },
  empBadge: { background: "#f0fdf4", color: "#16a34a", padding: "6px 12px", borderRadius: "8px", fontSize: "12px", fontWeight: "800", border: "1px solid #bbf7d0" },
  editActionBtn: {
    padding: "8px 16px",
    background: "#f0f9ff",
    color: "#0284c7",
    border: "1px solid #bae6fd",
    borderRadius: "8px",
    fontWeight: "800",
    fontSize: "13px",
    cursor: "pointer",
    transition: "all 0.2s"
  },

  // Add Form Styles
  formWrapper: {
    display: "flex",
    flexDirection: "column",
    gap: "30px",
  },
  statusBanner: {
    padding: "16px 20px",
    borderRadius: "12px",
    fontWeight: "700",
    fontSize: "15px",
    borderLeft: "6px solid",
    boxShadow: "0 4px 6px -1px rgba(0,0,0,0.05)"
  },
  bulbPulse: {
    width: "10px",
    height: "10px",
    background: "#2563eb",
    borderRadius: "50%",
    boxShadow: "0 0 10px #2563eb, 0 0 20px #2563eb",
    display: "inline-block",
    animation: "bulbGlow 1.5s infinite ease-in-out"
  },
  formGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "30px",
  },
  formSection: {
    background: "#ffffff",
    border: "1px solid #cbd5e1",
    borderRadius: "20px",
    padding: "30px",
    boxShadow: "0 10px 15px -3px rgba(0,0,0,0.02)"
  },
  sectionHeader: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    marginBottom: "24px",
    paddingBottom: "16px",
    borderBottom: "1px dashed #e2e8f0"
  },
  sectionIcon: {
    fontSize: "24px",
    color: "#0284c7"
  },
  sectionTitle: {
    fontSize: "18px",
    fontWeight: "800",
    color: "#0f172a",
    margin: 0
  },
  inputRow: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "20px",
    marginBottom: "20px"
  },
  inputGroup: {
    display: "flex",
    flexDirection: "column",
    gap: "8px"
  },
  label: {
    fontSize: "13px",
    fontWeight: "700",
    color: "#475569",
    marginLeft: "2px"
  },
  input: {
    padding: "14px 16px",
    borderRadius: "12px",
    border: "1px solid #cbd5e1",
    background: "#f8fafc",
    color: "#1e293b",
    fontSize: "15px",
    fontWeight: "500",
    outline: "none",
    transition: "border-color 0.2s"
  },
  select: {
    padding: "14px 16px",
    borderRadius: "12px",
    border: "1px solid #cbd5e1",
    background: "#f8fafc",
    color: "#1e293b",
    fontSize: "15px",
    fontWeight: "600",
    outline: "none",
    cursor: "pointer",
  },

  submitArea: {
    display: "flex",
    justifyContent: "flex-end",
    gap: "16px",
    background: "#ffffff",
    padding: "24px 30px",
    borderRadius: "20px",
    border: "1px solid #cbd5e1",
    boxShadow: "0 10px 15px -3px rgba(0,0,0,0.02)"
  },
  cancelBtn: {
    padding: "14px 28px",
    borderRadius: "12px",
    border: "1px solid #cbd5e1",
    background: "#f1f5f9",
    color: "#475569",
    fontWeight: "700",
    fontSize: "15px",
    cursor: "pointer"
  },
  submitBtn: {
    padding: "14px 34px",
    borderRadius: "12px",
    border: "none",
    background: "linear-gradient(135deg, #0ea5e9, #2563eb)",
    color: "#ffffff",
    fontWeight: "800",
    fontSize: "15px",
    cursor: "pointer",
    boxShadow: "0 4px 6px -1px rgba(37,99,235,0.3)"
  }
};

export default AdminEmployees;