import React, { useState, useEffect } from "react";
import { FiSend, FiMessageCircle } from "react-icons/fi";

function EmployeeChat() {
    const [message, setMessage] = useState("");
    const [chatHistory, setChatHistory] = useState([]);

    const currentUser = JSON.parse(localStorage.getItem("user")) || {};
    const userEmail = currentUser.email;

    // Poll LocalStorage for real-time updates
    useEffect(() => {
        const fetchMsgs = () => {
            const msgs = JSON.parse(localStorage.getItem("chat_messages")) || [];
            setChatHistory(msgs);
        };
        fetchMsgs();
        const interval = setInterval(fetchMsgs, 2000); // Check every 2s

        // Clear the notification badge counter (set last_read_time)
        localStorage.setItem(`last_read_${userEmail}`, Date.now().toString());

        return () => clearInterval(interval);
    }, [userEmail]);

    // Update read time when user clicks or types
    const handleInteraction = () => {
        localStorage.setItem(`last_read_${userEmail}`, Date.now().toString());
    };

    const handleSend = () => {
        if (!message.trim()) return;

        const newMsg = {
            id: Date.now() + Math.random(),
            sender: userEmail,
            receiver: "admin",
            message: message.trim(),
            time: new Date().toLocaleString()
        };

        const existingMsgs = JSON.parse(localStorage.getItem("chat_messages")) || [];
        const updatedMsgs = [...existingMsgs, newMsg];
        localStorage.setItem("chat_messages", JSON.stringify(updatedMsgs));

        setChatHistory(updatedMsgs);
        setMessage("");
        handleInteraction();
    };

    // Only show messages sent to ALL, sent specifically to this user, or sent by this user
    const displayMessages = chatHistory.filter(msg => {
        return msg.receiver === "ALL" ||
            msg.receiver === userEmail ||
            msg.sender === userEmail;
    });

    return (
        <div style={styles.page} onClick={handleInteraction}>
            <div style={styles.header}>
                <div style={styles.headerTitleGroup}>
                    <div style={styles.iconBox}><FiMessageCircle /></div>
                    <div>
                        <h1 style={styles.title}>Company Chat</h1>
                        <p style={styles.subtitle}>Direct connection with HR and Admin</p>
                    </div>
                </div>
            </div>

            <div style={styles.chatArea}>
                {/* Messages */}
                <div style={styles.messagesContainer}>
                    {displayMessages.length === 0 ? (
                        <div style={styles.emptyState}>No messages yet. Send a message to start communicating.</div>
                    ) : (
                        displayMessages.map(msg => {
                            const isMe = msg.sender === userEmail;
                            return (
                                <div key={msg.id} style={{
                                    ...styles.messageWrapper,
                                    justifyContent: isMe ? "flex-end" : "flex-start"
                                }}>
                                    <div style={{
                                        ...styles.messageBubble,
                                        ...(isMe ? styles.myBubble : styles.adminBubble)
                                    }}>
                                        <div style={styles.msgSender}>{isMe ? "You" : (msg.sender === "admin" ? "Admin" : msg.sender)}</div>
                                        <div style={styles.msgText}>{msg.message}</div>
                                        <div style={styles.msgTime}>{msg.time}</div>
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>

                {/* Input */}
                <div style={styles.inputArea}>
                    <input
                        style={styles.chatInput}
                        type="text"
                        placeholder="Type a message to Admin..."
                        value={message}
                        onChange={e => { setMessage(e.target.value); handleInteraction(); }}
                        onKeyDown={e => e.key === 'Enter' && handleSend()}
                    />
                    <button style={styles.sendBtn} onClick={handleSend}>
                        <FiSend /> Send
                    </button>
                </div>
            </div>
        </div>
    );
}

const styles = {
    page: { padding: "40px", maxWidth: "900px", margin: "0 auto", color: "#1e293b", minHeight: "100vh" },
    header: { marginBottom: "30px" },
    headerTitleGroup: { display: "flex", alignItems: "center", gap: "16px" },
    iconBox: { width: "50px", height: "50px", borderRadius: "12px", background: "#0284c7", color: "white", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "24px" },
    title: { fontSize: "32px", fontWeight: "900", margin: "0 0 4px", color: "#0f172a" },
    subtitle: { color: "#64748b", margin: 0, fontSize: "15px", fontWeight: "600" },

    chatArea: {
        display: "flex",
        flexDirection: "column",
        height: "calc(100vh - 200px)",
        background: "#ffffff",
        border: "1px solid #cbd5e1",
        borderRadius: "20px",
        overflow: "hidden",
        boxShadow: "0 10px 25px -5px rgba(0,0,0,0.05)"
    },

    messagesContainer: { flex: 1, padding: "30px", overflowY: "auto", display: "flex", flexDirection: "column", gap: "16px", background: "#f8fafc" },
    emptyState: { textAlign: "center", color: "#94a3b8", marginTop: "100px", fontSize: "16px", fontWeight: "600" },
    messageWrapper: { display: "flex", width: "100%" },
    messageBubble: { maxWidth: "70%", padding: "16px 20px", borderRadius: "16px" },
    myBubble: { background: "#0ea5e9", color: "white", borderBottomRightRadius: "0px", boxShadow: "0 4px 6px -1px rgba(14, 165, 233, 0.2)" },
    adminBubble: { background: "#ffffff", color: "#0f172a", borderBottomLeftRadius: "0px", border: "1px solid #e2e8f0", boxShadow: "0 4px 6px -1px rgba(0,0,0,0.02)" },
    msgSender: { fontSize: "12px", fontWeight: "800", marginBottom: "6px", opacity: 0.8 },
    msgText: { fontSize: "15px", lineHeight: "1.5", wordBreak: "break-word" },
    msgTime: { fontSize: "11px", marginTop: "10px", textAlign: "right", opacity: 0.7 },

    inputArea: { padding: "20px 30px", borderTop: "1px solid #e2e8f0", background: "#ffffff", display: "flex", gap: "16px", alignItems: "center" },
    chatInput: { flex: 1, padding: "18px 24px", borderRadius: "16px", border: "2px solid #e2e8f0", outline: "none", fontSize: "15px", background: "#f8fafc", color: "#1e293b", transition: "0.2s" },
    sendBtn: { padding: "0 30px", height: "56px", borderRadius: "14px", border: "none", background: "linear-gradient(135deg, #0284c7, #2563eb)", color: "white", fontWeight: "800", fontSize: "16px", cursor: "pointer", display: "flex", alignItems: "center", gap: "10px", boxShadow: "0 4px 6px -1px rgba(2, 132, 199, 0.3)" }
};

export default EmployeeChat;
