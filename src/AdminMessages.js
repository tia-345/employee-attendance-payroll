import React, { useState, useEffect } from "react";
import { FiSend, FiUsers } from "react-icons/fi";
import API_URL from "./apiConfig";


function AdminMessages() {
    const [employees, setEmployees] = useState([]);
    const [message, setMessage] = useState("");
    const [sendType, setSendType] = useState("ALL"); // ALL, SINGLE, MULTIPLE
    const [selectedEmployees, setSelectedEmployees] = useState([]);
    const [chatHistory, setChatHistory] = useState([]);
    const [activeChat, setActiveChat] = useState("GLOBAL"); // GLOBAL for broadcast log, or specific email

    useEffect(() => {
        fetch(`${API_URL}/api/employees`)
            .then(res => res.json())
            .then(data => setEmployees(data.filter(e => e.role !== "admin")))
            .catch(err => console.error(err));
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Poll LocalStorage for real-time updates
    useEffect(() => {
        const fetchMsgs = () => {
            const msgs = JSON.parse(localStorage.getItem("chat_messages")) || [];
            setChatHistory(msgs);

            // Auto-mark as read when on this page
            localStorage.setItem("last_read_admin", Date.now().toString());
        };
        fetchMsgs();
        const interval = setInterval(fetchMsgs, 2000);
        return () => clearInterval(interval);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Helper to check if an employee has unread messages
    const hasUnread = (email) => {
        const lastRead = localStorage.getItem("last_read_admin") || 0;
        // This is a bit tricky since we just marked everything as read on mount,
        // but for the dashboard it will work. For the sidebar, we can check 
        // if there are messages from this sender that are newer than 
        // what we've displayed/viewed before. 
        // For simplicity in this local-storage setup, we'll check msgs from sender to admin.
        return chatHistory.some(msg => msg.sender === email && msg.receiver === "admin" && msg.id > Number(lastRead));
    };

    const handleCheckbox = (email) => {
        if (selectedEmployees.includes(email)) {
            setSelectedEmployees(selectedEmployees.filter(e => e !== email));
        } else {
            setSelectedEmployees([...selectedEmployees, email]);
        }
    };

    const handleSend = () => {
        if (!message.trim()) return;

        let receivers = [];
        if (sendType === "ALL") {
            receivers = ["ALL"];
        } else if (sendType === "SINGLE" && activeChat !== "GLOBAL") {
            receivers = [activeChat];
        } else if (sendType === "MULTIPLE") {
            if (selectedEmployees.length === 0) return alert("Select at least one employee");
            receivers = selectedEmployees;
        } else {
            return alert("Please select a valid recipient mode.");
        }

        const newMsgs = receivers.map(req => ({
            id: Date.now() + Math.random(),
            sender: "admin",
            receiver: req,
            message: message.trim(),
            time: new Date().toLocaleString()
        }));

        const existingMsgs = JSON.parse(localStorage.getItem("chat_messages")) || [];
        const updatedMsgs = [...existingMsgs, ...newMsgs];
        localStorage.setItem("chat_messages", JSON.stringify(updatedMsgs));

        setChatHistory(updatedMsgs);
        setMessage("");
    };

    // Filter messages for the current view
    // If GLOBAL: show all messages where receiver is ALL or sender is admin.
    // Actually, keeping it as an inbox style:
    // Admin sees messages sent to "admin" from employees.
    // Admin sees messages they sent to that specific employee.
    const displayMessages = chatHistory.filter(msg => {
        if (activeChat === "GLOBAL") {
            return msg.receiver === "ALL" || (msg.sender === "admin" && msg.receiver === "ALL");
        } else {
            return (msg.sender === activeChat && msg.receiver === "admin") ||
                (msg.sender === "admin" && msg.receiver === activeChat);
        }
    });

    return (
        <div style={styles.page}>
            <div style={styles.header}>
                <h1 style={styles.title}>Message Center</h1>
                <p style={styles.subtitle}>Broadcast announcements or chat with individual employees</p>
            </div>

            <div style={styles.layout}>
                {/* Sidebar */}
                <div style={styles.sidebar}>
                    <h3 style={styles.sidebarTitle}>Direct Messages</h3>

                    <div
                        style={{ ...styles.contactItem, ...(activeChat === "GLOBAL" && styles.activeContact) }}
                        onClick={() => { setActiveChat("GLOBAL"); setSendType("ALL"); }}
                    >
                        <div style={styles.contactIcon}><FiUsers /></div>
                        <div>
                            <div style={styles.contactName}>Company Broadcast</div>
                            <div style={styles.contactEmail}>All Employees</div>
                        </div>
                    </div>

                    <div style={styles.divider}></div>
                    <h4 style={styles.sidebarSection}>EMPLOYEES</h4>

                    <div style={styles.contactList}>
                        {employees.map(emp => (
                            <div
                                key={emp.email}
                                style={{ ...styles.contactItem, ...(activeChat === emp.email && styles.activeContact) }}
                                onClick={() => { setActiveChat(emp.email); setSendType("SINGLE"); }}
                            >
                                <div style={styles.contactIconUser}>{emp.name.charAt(0)}</div>
                                <div style={{ flex: 1 }}>
                                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                        <div style={styles.contactName}>{emp.name}</div>
                                        {hasUnread(emp.email) && (
                                            <span style={styles.bulbPulse}></span>
                                        )}
                                    </div>
                                    <div style={styles.contactEmail}>{emp.email}</div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Main Chat Area */}
                <div style={styles.chatArea}>
                    {/* Chat Header */}
                    <div style={styles.chatHeader}>
                        <h3 style={{ margin: 0, color: "#0f172a" }}>
                            {activeChat === "GLOBAL" ? "Broadcasting to: All Employees" : `Chat with: ${employees.find(e => e.email === activeChat)?.name || activeChat}`}
                        </h3>

                        {activeChat === "GLOBAL" && (
                            <div style={styles.broadcastControls}>
                                <label style={styles.radioLabel}>
                                    <input type="radio" checked={sendType === "ALL"} onChange={() => setSendType("ALL")} /> All Employees
                                </label>
                                <label style={styles.radioLabel}>
                                    <input type="radio" checked={sendType === "MULTIPLE"} onChange={() => setSendType("MULTIPLE")} /> Multiple Specific
                                </label>
                            </div>
                        )}
                    </div>

                    {/* Conditional Multiple Select Panel */}
                    {activeChat === "GLOBAL" && sendType === "MULTIPLE" && (
                        <div style={styles.multiselectPanel}>
                            <div style={{ fontWeight: 600, marginBottom: "10px", color: "#334155" }}>Select Recipients:</div>
                            <div style={styles.checkboxGrid}>
                                {employees.map(emp => (
                                    <label key={emp.email} style={styles.checkboxLabel}>
                                        <input
                                            type="checkbox"
                                            checked={selectedEmployees.includes(emp.email)}
                                            onChange={() => handleCheckbox(emp.email)}
                                        /> {emp.name}
                                    </label>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Chat Messages */}
                    <div style={styles.messagesContainer}>
                        {displayMessages.length === 0 ? (
                            <div style={styles.emptyState}>No messages here yet.</div>
                        ) : (
                            displayMessages.map(msg => {
                                const isAdmin = msg.sender === "admin";
                                return (
                                    <div key={msg.id} style={{
                                        ...styles.messageWrapper,
                                        justifyContent: isAdmin ? "flex-start" : "flex-end"
                                    }}>
                                        <div style={{
                                            ...styles.messageBubble,
                                            ...(isAdmin ? styles.adminBubble : styles.empBubble)
                                        }}>
                                            <div style={styles.msgSender}>{isAdmin ? "Admin" : msg.sender}</div>
                                            <div style={styles.msgText}>{msg.message}</div>
                                            <div style={styles.msgTime}>{msg.time}</div>
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>

                    {/* Input Area */}
                    <div style={styles.inputArea}>
                        <input
                            style={styles.chatInput}
                            type="text"
                            placeholder={sendType === "ALL" ? "Type a broadcast announcement..." : "Type a message..."}
                            value={message}
                            onChange={e => setMessage(e.target.value)}
                            onKeyDown={e => e.key === 'Enter' && handleSend()}
                        />
                        <button style={styles.sendBtn} onClick={handleSend}>
                            <FiSend /> Send
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

const styles = {
    page: { padding: "40px", maxWidth: "1300px", margin: "0 auto", color: "#1e293b", minHeight: "100vh" },
    header: { marginBottom: "30px" },
    title: { fontSize: "32px", fontWeight: "900", margin: "0 0 8px", color: "#0f172a" },
    subtitle: { color: "#64748b", margin: 0, fontSize: "16px" },

    layout: {
        display: "flex",
        height: "calc(100vh - 200px)",
        background: "#ffffff",
        border: "1px solid #cbd5e1",
        borderRadius: "16px",
        overflow: "hidden",
        boxShadow: "0 10px 15px -3px rgba(0,0,0,0.05)"
    },

    // Sidebar
    sidebar: { width: "320px", borderRight: "1px solid #cbd5e1", background: "#f8fafc", display: "flex", flexDirection: "column" },
    sidebarTitle: { margin: "20px", fontSize: "18px", fontWeight: "800", color: "#0f172a" },
    divider: { height: "1px", background: "#cbd5e1", margin: "10px 0" },
    sidebarSection: { margin: "10px 20px", fontSize: "12px", fontWeight: "800", color: "#94a3b8", letterSpacing: "1px" },
    contactList: { overflowY: "auto", flex: 1 },
    contactItem: {
        display: "flex", alignItems: "center", gap: "12px", padding: "16px 20px", cursor: "pointer",
        borderBottom: "1px solid #e2e8f0", transition: "all 0.2s"
    },
    activeContact: { background: "#e0f2fe", borderLeft: "4px solid #0284c7" },
    contactIcon: { width: "40px", height: "40px", borderRadius: "8px", background: "#0284c7", color: "white", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "20px" },
    contactIconUser: { width: "40px", height: "40px", borderRadius: "50%", background: "#cbd5e1", color: "#334155", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "800", fontSize: "18px" },
    contactName: { fontWeight: "700", color: "#0f172a", fontSize: "15px" },
    contactEmail: { fontSize: "13px", color: "#64748b" },

    // Chat Area
    chatArea: { flex: 1, display: "flex", flexDirection: "column", background: "#ffffff" },
    chatHeader: { padding: "20px 30px", borderBottom: "1px solid #cbd5e1", background: "#f8fafc", display: "flex", justifyContent: "space-between", alignItems: "center" },
    broadcastControls: { display: "flex", gap: "16px" },
    radioLabel: { fontSize: "14px", fontWeight: "600", color: "#475569", display: "flex", alignItems: "center", gap: "6px", cursor: "pointer" },
    multiselectPanel: { padding: "16px 30px", background: "#f1f5f9", borderBottom: "1px solid #cbd5e1" },
    checkboxGrid: { display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "10px" },
    checkboxLabel: { fontSize: "13px", color: "#1e293b", display: "flex", alignItems: "center", gap: "6px" },

    // Messages
    messagesContainer: { flex: 1, padding: "30px", overflowY: "auto", display: "flex", flexDirection: "column", gap: "16px", background: "#fcfcfc" },
    emptyState: { textAlign: "center", color: "#94a3b8", marginTop: "100px", fontSize: "16px" },
    messageWrapper: { display: "flex", width: "100%" },
    messageBubble: { maxWidth: "60%", padding: "16px 20px", borderRadius: "16px", position: "relative" },
    adminBubble: { background: "#0ea5e9", color: "white", borderBottomLeftRadius: "0px" },
    empBubble: { background: "#e2e8f0", color: "#0f172a", borderBottomRightRadius: "0px" },
    msgSender: { fontSize: "12px", fontWeight: "800", marginBottom: "6px", opacity: 0.8 },
    msgText: { fontSize: "15px", lineHeight: "1.5", wordBreak: "break-word" },
    msgTime: { fontSize: "11px", marginTop: "10px", textAlign: "right", opacity: 0.7 },

    // Input Box
    inputArea: { padding: "20px 30px", borderTop: "1px solid #cbd5e1", background: "#ffffff", display: "flex", gap: "16px" },
    chatInput: { flex: 1, padding: "16px 20px", borderRadius: "12px", border: "1px solid #cbd5e1", outline: "none", fontSize: "15px", background: "#f8fafc" },
    sendBtn: { padding: "0 24px", borderRadius: "12px", border: "none", background: "#0284c7", color: "white", fontWeight: "800", fontSize: "16px", cursor: "pointer", display: "flex", alignItems: "center", gap: "8px", transition: "0.2s" },
    bulbPulse: {
        width: "8px",
        height: "8px",
        background: "#0ea5e9",
        borderRadius: "50%",
        boxShadow: "0 0 8px #0ea5e9, 0 0 16px #0ea5e9",
        display: "inline-block",
        animation: "bulbGlow 1.5s infinite ease-in-out"
    },
};

export default AdminMessages;
