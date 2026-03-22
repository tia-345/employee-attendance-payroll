import { useState, useEffect } from "react";

function Profile() {
  const [isEditing, setIsEditing] = useState(false);
  const [profile, setProfile] = useState(null);
  const token = localStorage.getItem("token");

  // ================= FETCH PROFILE =================
  useEffect(() => {
    if (!token) return;

    fetch("http://localhost:5000/api/employees/me", {
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
      .then(res => res.json())
      .then(data => setProfile(data))
      .catch(err => console.error(err));
  }, [token]);

  if (!profile)
    return <div style={{ padding: "40px", color: "#1e293b" }}>Loading profile...</div>;

  // ================= HANDLE CHANGE =================
  const handleChange = (field, value) => {
    setProfile({ ...profile, [field]: value });
  };

  // ================= SAVE PROFILE =================
  const handleSave = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/employees/me", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(profile)
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Update failed");
      }

      setProfile(data.user);
      setIsEditing(false);
      alert("Profile updated successfully!");

    } catch (err) {
      alert(err.message);
    }
  };

  // ================= UPLOAD IMAGE =================
  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("profilePicture", file);

    try {
      const res = await fetch("http://localhost:5000/api/employees/me/profile-picture", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`
        },
        body: formData
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Upload failed");

      setProfile({ ...profile, profilePicture: data.user.profilePicture });
      alert("Profile picture updated!");

    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div style={styles.page}>

      {/* HERO */}
      <div style={styles.heroBanner}>
        <div style={styles.heroContent}>
          <div style={styles.avatarLarge}>
            <label htmlFor="pfp-upload" style={{ cursor: "pointer" }}>
              <img
                src={profile.profilePicture || "https://cdn-icons-png.flaticon.com/512/3135/3135715.png"}
                alt="User"
                style={{ ...styles.avatarImg, borderRadius: "50%", objectFit: "cover" }}
              />
              <input 
                id="pfp-upload" 
                type="file" 
                hidden 
                accept="image/*" 
                onChange={handleImageUpload} 
              />
            </label>
          </div>

          <div>
            <h1 style={styles.userName}>{profile.name}</h1>
            <p style={styles.userTitle}>
              {profile.designation} — {profile.department}
            </p>
          </div>
        </div>

        <button
          style={isEditing ? styles.saveBtn : styles.editBtn}
          onClick={isEditing ? handleSave : () => setIsEditing(true)}
        >
          {isEditing ? "Save Profile" : "Edit Profile"}
        </button>
      </div>

      {/* PERSONAL DETAILS */}
      <Section title="Personal Details">
        <EditableField
          label="Full Name"
          value={profile.name}
          editing={isEditing}
          onChange={(val) => handleChange("name", val)}
        />
        <EditableField
          label="Phone"
          value={profile.phone}
          editing={isEditing}
          onChange={(val) => handleChange("phone", val)}
        />
        <EditableField
          label="Blood Group"
          value={profile.bloodGroup}
          editing={isEditing}
          onChange={(val) => handleChange("bloodGroup", val)}
        />
      </Section>

      {/* EMPLOYMENT */}
      <Section title="Employment Information">
        <EditableField
          label="Designation"
          value={profile.designation}
          editing={isEditing}
          onChange={(val) => handleChange("designation", val)}
        />
        <EditableField
          label="Department"
          value={profile.department}
          editing={isEditing}
          onChange={(val) => handleChange("department", val)}
        />
        <EditableField
          label="Category/Role"
          value={profile.role}
          editing={isEditing}
          onChange={(val) => handleChange("role", val)}
        />
        <EditableField
          label="Current Salary (₹)"
          value={profile.salary}
          editing={isEditing}
          onChange={(val) => handleChange("salary", val)}
        />
        <EditableField
          label="Email Address"
          value={profile.email}
          editing={isEditing}
          onChange={(val) => handleChange("email", val)}
        />
        <EditableField
          label="Manager"
          value={profile.manager}
          editing={isEditing}
          onChange={(val) => handleChange("manager", val)}
        />
        <EditableField
          label="Shift Schedule"
          value={profile.shift}
          editing={isEditing}
          onChange={(val) => handleChange("shift", val)}
        />
        <EditableField
          label="Office Location"
          value={profile.location}
          editing={isEditing}
          onChange={(val) => handleChange("location", val)}
        />
        <EditableField
          label="Date of Joining"
          value={
            profile.dateOfJoining
              ? new Date(profile.dateOfJoining).toISOString().split("T")[0]
              : ""
          }
          editing={isEditing}
          onChange={(val) => handleChange("dateOfJoining", val)}
        />
      </Section>

      {/* EMERGENCY */}
      <Section title="Emergency Contact">
        <EditableField
          label="Contact Name"
          value={profile.emergencyContactName}
          editing={isEditing}
          onChange={(val) => handleChange("emergencyContactName", val)}
        />
        <EditableField
          label="Contact Phone"
          value={profile.emergencyContactPhone}
          editing={isEditing}
          onChange={(val) => handleChange("emergencyContactPhone", val)}
        />
        <EditableField
          label="Relation"
          value={profile.emergencyContactRelation}
          editing={isEditing}
          onChange={(val) => handleChange("emergencyContactRelation", val)}
        />
      </Section>
    </div>
  );
}

// ================= REUSABLE COMPONENTS =================

function Section({ title, children }) {
  return (
    <div style={styles.section}>
      <h3 style={styles.sectionTitle}>{title}</h3>
      {children}
    </div>
  );
}

function EditableField({ label, value, editing, onChange }) {
  return (
    <div style={styles.fieldRow}>
      <span style={styles.fieldLabel}>{label}</span>
      {editing && onChange ? (
        <input
          style={styles.input}
          value={value || ""}
          onChange={(e) => onChange(e.target.value)}
        />
      ) : (
        <span style={styles.fieldValue}>{value || "Not Available"}</span>
      )}
    </div>
  );
}

// ================= STYLES =================

const styles = {
  page: {
    padding: "40px",
    maxWidth: "1000px",
    margin: "0 auto",
    color: "#0f172a"
  },

  heroBanner: {
    background: "#ffffff",
    borderRadius: "20px",
    padding: "30px",
    marginBottom: "30px",
    border: "1px solid #cbd5e1",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center"
  },

  heroContent: {
    display: "flex",
    alignItems: "center",
    gap: "20px"
  },

  avatarLarge: {
    width: "80px",
    height: "80px"
  },

  avatarImg: {
    width: "100%",
    height: "100%"
  },

  userName: {
    fontSize: "24px",
    fontWeight: "700",
    margin: 0
  },

  userTitle: {
    color: "#475569"
  },

  editBtn: {
    background: "#0284c7",
    border: "none",
    padding: "8px 18px",
    borderRadius: "8px",
    cursor: "pointer"
  },

  saveBtn: {
    background: "#22c55e",
    border: "none",
    padding: "8px 18px",
    borderRadius: "8px",
    cursor: "pointer",
    color: "#1e293b"
  },

  section: {
    background: "#ffffff",
    borderRadius: "20px",
    padding: "25px",
    marginBottom: "25px",
    border: "1px solid #cbd5e1"
  },

  sectionTitle: {
    marginBottom: "20px",
    color: "#0284c7"
  },

  fieldRow: {
    display: "flex",
    justifyContent: "space-between",
    marginBottom: "12px",
    alignItems: "center"
  },

  fieldLabel: {
    color: "#475569"
  },

  fieldValue: {
    fontWeight: "600"
  },

  input: {
    padding: "6px 10px",
    borderRadius: "6px",
    border: "1px solid #94a3b8",
    background: "#f1f5f9",
    color: "#1e293b"
  }
};

export default Profile;