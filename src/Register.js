import React, { useState } from "react";
import { FiMail, FiLock, FiUser, FiArrowLeft, FiAlertCircle } from "react-icons/fi";
import API_URL from "./apiConfig";

function Register({ onBack }) {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleRegister = async (e) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
            const res = await fetch(`${API_URL}/api/employees`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name, email, password, role: "employee" }),
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.message || "Registration failed");

            alert("Registration successful! Please login.");
            onBack();
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={styles.container}>
            <div style={styles.card}>
                <button onClick={onBack} style={styles.backBtn}>
                    <FiArrowLeft /> Back to Login
                </button>
                <h2 style={styles.title}>Create Account</h2>
                <p style={styles.subtitle}>Join our workforce management system</p>

                {error && (
                    <div style={styles.errorBox}>
                        <FiAlertCircle /> {error}
                    </div>
                )}

                <form onSubmit={handleRegister} style={styles.form}>
                    <div style={styles.inputGroup}>
                        <FiUser style={styles.icon} />
                        <input
                            style={styles.input}
                            type="text"
                            placeholder="Full Name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                        />
                    </div>
                    <div style={styles.inputGroup}>
                        <FiMail style={styles.icon} />
                        <input
                            style={styles.input}
                            type="email"
                            placeholder="Email Address"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>
                    <div style={styles.inputGroup}>
                        <FiLock style={styles.icon} />
                        <input
                            style={styles.input}
                            type="password"
                            placeholder="Password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>
                    <button type="submit" disabled={loading} style={styles.btn}>
                        {loading ? "Creating Account..." : "Register Now"}
                    </button>
                </form>
            </div>
        </div>
    );
}

const styles = {
    container: { minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#f1f5f9" },
    card: { background: "#fff", padding: "40px", borderRadius: "16px", boxShadow: "0 10px 25px rgba(0,0,0,0.05)", width: "100%", maxWidth: "400px" },
    backBtn: { background: "none", border: "none", color: "#64748b", cursor: "pointer", display: "flex", alignItems: "center", gap: "8px", marginBottom: "20px", fontSize: "14px", fontWeight: "600" },
    title: { margin: "0 0 8px 0", color: "#0f172a", fontSize: "24px", fontWeight: "800" },
    subtitle: { margin: "0 0 24px 0", color: "#64748b", fontSize: "14px" },
    errorBox: { background: "#fee2e2", color: "#ef4444", padding: "12px", borderRadius: "8px", marginBottom: "20px", display: "flex", alignItems: "center", gap: "8px", fontSize: "14px" },
    form: { display: "flex", flexDirection: "column", gap: "16px" },
    inputGroup: { position: "relative" },
    icon: { position: "absolute", left: "16px", top: "50%", transform: "translateY(-50%)", color: "#94a3b8" },
    input: { width: "100%", padding: "12px 16px 12px 48px", borderRadius: "8px", border: "1px solid #cbd5e1", outline: "none", boxSizing: "border-box" },
    btn: { background: "#0284c7", color: "#fff", border: "none", padding: "14px", borderRadius: "8px", fontWeight: "700", cursor: "pointer", marginTop: "10px" }
};

export default Register;
