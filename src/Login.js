import { useState } from "react";
import { FiMail, FiLock, FiLogIn, FiUser, FiBriefcase } from "react-icons/fi";
import API_URL from "./apiConfig";


function Login({ onLogin }) {
  const [role, setRole] = useState("employee");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch(`${API_URL}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Login failed");

      // Strict role check
      if (data.user.role !== role) {
        throw new Error(`Access denied. You are trying to log in as ${role}, but your account is registered as ${data.user.role}.`);
      }

      // Store in local storage
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));

      // Trigger parent handler
      onLogin(data.user.role, data.user);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.wrapper}>
      {/* Background Decorative Blur */}
      <div style={styles.blurCircle1}></div>
      <div style={styles.blurCircle2}></div>

      <div style={styles.card}>
        {/* Header content */}
        <div style={styles.headerSection}>
          <div style={styles.logoContainer}>
            <span style={styles.logoIcon}>⚡</span>
          </div>
          <h1 style={styles.logoText}>CLOCKIN</h1>
          <p style={styles.tagline}>Intelligent Workforce Management</p>
        </div>

        {error && (
          <div style={styles.errorBox}>
            <span style={styles.errorIcon}>⚠️</span>
            <p style={styles.errorText}>{error}</p>
          </div>
        )}

        <form onSubmit={handleLogin} style={styles.form}>
          {/* Role selection tab style */}
          <div style={styles.roleTabs}>
            <div
              style={{ ...styles.roleTab, ...(role === "employee" ? styles.roleTabActive : {}) }}
              onClick={() => setRole("employee")}
            >
              <FiUser style={styles.tabIcon} />
              <span>Employee</span>
            </div>
            <div
              style={{ ...styles.roleTab, ...(role === "admin" ? styles.roleTabActiveAdmin : {}) }}
              onClick={() => setRole("admin")}
            >
              <FiBriefcase style={styles.tabIcon} />
              <span>Admin</span>
            </div>
          </div>

          <div style={styles.inputContainer}>
            <label style={styles.label}>Email Address</label>
            <div style={styles.inputWrapper}>
              <FiMail style={styles.inputIcon} />
              <input
                style={styles.input}
                type="email"
                placeholder="name@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>

          <div style={styles.inputContainer}>
            <label style={styles.label}>Password</label>
            <div style={styles.inputWrapper}>
              <FiLock style={styles.inputIcon} />
              <input
                style={styles.input}
                type="password"
                placeholder="••••••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </div>

          <button
            type="submit"
            style={{ ...styles.submitBtn, ...(loading ? styles.submitBtnDisabled : {}) }}
            disabled={loading}
          >
            {loading ? "Authenticating..." : (
              <>
                <span>Sign In Securely</span>
                <FiLogIn style={{ fontSize: "20px" }} />
              </>
            )}
          </button>
        </form>

        <div style={styles.footerInfo}>
          <span style={styles.lockIcon}>🔒</span> Secure SSL Encrypted Connection
        </div>
      </div>
    </div>
  );
}

const styles = {
  wrapper: {
    minHeight: "100vh",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#eff6ff", // Very light blue wrapper
    fontFamily: "'Inter', system-ui, sans-serif",
    position: "relative",
    overflow: "hidden",
  },
  blurCircle1: {
    position: "absolute",
    top: "-10%",
    left: "-10%",
    width: "50%",
    height: "50%",
    background: "radial-gradient(circle, rgba(56,189,248,0.2) 0%, rgba(239,246,255,0) 70%)",
    zIndex: 1,
  },
  blurCircle2: {
    position: "absolute",
    bottom: "-20%",
    right: "-10%",
    width: "60%",
    height: "60%",
    background: "radial-gradient(circle, rgba(99,102,241,0.15) 0%, rgba(239,246,255,0) 70%)",
    zIndex: 1,
  },
  card: {
    position: "relative",
    zIndex: 10,
    background: "#e0f2fe", // Light sky blue card
    padding: "60px 50px",
    borderRadius: "28px",
    width: "100%",
    maxWidth: "520px",
    boxShadow: "0 25px 50px -12px rgba(2, 132, 199, 0.15), 0 0 0 1px rgba(186, 230, 253, 0.5)",
  },
  headerSection: {
    textAlign: "center",
    marginBottom: "40px",
  },
  logoContainer: {
    width: "70px",
    height: "70px",
    margin: "0 auto 20px",
    background: "linear-gradient(135deg, #0284c7, #4f46e5)", // Darker blue logo bg for contrast
    borderRadius: "20px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    boxShadow: "0 10px 25px -5px rgba(2, 132, 199, 0.4)",
  },
  logoIcon: {
    fontSize: "36px",
    color: "#ffffff",
  },
  logoText: {
    color: "#ffffff", // Darker slate for high visibility
    letterSpacing: "4px",
    margin: "0 0 10px 0",
    fontSize: "38px",
    fontWeight: "900",
  },
  tagline: {
    color: "#334155", // High contrast dark slate
    fontSize: "16px",
    fontWeight: "500",
    margin: 0,
  },
  errorBox: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    background: "rgba(220, 38, 38, 0.1)",
    borderLeft: "4px solid #dc2626",
    padding: "16px 20px",
    marginBottom: "25px",
    borderRadius: "8px",
  },
  errorIcon: {
    fontSize: "20px",
  },
  errorText: {
    color: "#991b1b",
    fontSize: "15px",
    fontWeight: "600",
    margin: 0,
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: "28px",
  },
  roleTabs: {
    display: "flex",
    background: "#bae6fd", // Slightly darker light blue for tabs container
    padding: "6px",
    borderRadius: "16px",
    gap: "4px",
    marginBottom: "10px",
  },
  roleTab: {
    flex: 1,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "8px",
    padding: "14px 0",
    borderRadius: "12px",
    color: "#0369a1", // Dark blue text for unselected tabs
    fontSize: "16px",
    fontWeight: "600",
    cursor: "pointer",
    transition: "all 0.3s ease",
  },
  roleTabActive: {
    background: "#ffffff",
    color: "#0284c7",
    boxShadow: "0 4px 6px -1px rgba(2, 132, 199, 0.1)",
  },
  roleTabActiveAdmin: {
    background: "#ffffff",
    color: "#4f46e5",
    boxShadow: "0 4px 6px -1px rgba(79, 70, 229, 0.1)",
  },
  tabIcon: {
    fontSize: "18px",
  },
  inputContainer: {
    display: "flex",
    flexDirection: "column",
    gap: "10px",
  },
  label: {
    color: "#0f172a", // Dark slate label
    fontSize: "16px", // Larger
    fontWeight: "700", // Thicker for visibility
    marginLeft: "4px",
  },
  inputWrapper: {
    position: "relative",
    display: "flex",
    alignItems: "center",
  },
  inputIcon: {
    position: "absolute",
    left: "18px",
    color: "#0ea5e9", // Sky blue icon
    fontSize: "22px",
  },
  input: {
    width: "100%",
    padding: "20px 20px 20px 50px",
    borderRadius: "16px",
    background: "#ffffff",
    color: "#0f172a", // Dark text
    border: "2px solid #7dd3fc", // Brighter blue border
    outline: "none",
    fontSize: "18px", // Larger font size for better visibility
    fontWeight: "500",
    transition: "all 0.3s ease",
    boxSizing: "border-box", // Ensure padding doesn't affect width
  },
  submitBtn: {
    marginTop: "10px",
    padding: "20px",
    borderRadius: "16px",
    background: "linear-gradient(135deg, #0284c7 0%, #4f46e5 100%)", // Strong blues
    color: "#ffffff",
    fontWeight: "800",
    border: "none",
    cursor: "pointer",
    fontSize: "18px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "12px",
    boxShadow: "0 10px 20px -10px rgba(2, 132, 199, 0.5)",
    transition: "all 0.3s ease",
  },
  submitBtnDisabled: {
    opacity: 0.7,
    cursor: "not-allowed",
    transform: "none",
  },
  footerInfo: {
    textAlign: "center",
    marginTop: "40px",
    fontSize: "14px",
    color: "#475569", // Darker slate
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "6px",
    fontWeight: "600",
  },
  lockIcon: {
    fontSize: "12px",
    color: "#475569",
  }
};

export default Login;