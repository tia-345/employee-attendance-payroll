import React, { useState } from "react";

import Navbar from "./Navbar";
import Login from "./Login";
import Register from "./Register";

import Attendance from "./Attendance";
import Payroll from "./Payroll";
import Profile from "./Profile";
import Leave from "./Leave";

import AdminLeave from "./AdminLeave";
import AdminEmployees from "./AdminEmployees";
import AdminMessages from "./AdminMessages";
import AdminDashboard from "./AdminDashboard";
import AdminShifts from "./AdminShifts";

import EmployeeChat from "./EmployeeChat";

import EmployeeDashboard from "./EmployeeDashboard";
import ShiftsHolidays from "./ShiftsHolidays";

function App() {

  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [role, setRole] = useState(null);
  const [page, setPage] = useState("login");
  const [user, setUser] = useState(null);
  const [leaves, setLeaves] = useState([]);

  // ================= LOGIN / REGISTER =================

  if (!isLoggedIn) {

    if (page === "register") {
      return <Register onBack={() => setPage("login")} />;
    }

    return (
      <Login
        onLogin={(userRole, userData) => {
          setRole(userRole);
          setUser(userData);
          setIsLoggedIn(true);
          setPage("dashboard");
        }}
        onRegister={() => setPage("register")}
      />
    );
  }

  // ================= MAIN APPLICATION =================

  return (
    <div style={styles.appWrapper}>

      <Navbar
        role={role}
        onNavigate={setPage}
        pendingCount={leaves.filter((l) => l.status === "Pending").length}

        onLogout={() => {
          setIsLoggedIn(false);
          setRole(null);
          setUser(null);
          setPage("login");
          localStorage.removeItem("token");
        }}
      />

      <main style={styles.mainContent}>

        {/* DASHBOARD */}

        {page === "dashboard" && (
          role === "admin"
            ? <AdminDashboard />
            : <EmployeeDashboard user={user} onNavigate={setPage} />
        )}


        {/* EMPLOYEE ROUTES */}

        {role === "employee" && page === "attendance" && <Attendance />}

        {/* PAYROLL (both roles) */}
        {page === "payroll" && <Payroll />}

        {role === "employee" && page === "leave" &&
          <Leave leaves={leaves} setLeaves={setLeaves} />
        }


        {/* CHAT */}
        {role === "employee" && page === "chat" && <EmployeeChat />}

        {/* PROFILE (both roles) */}

        {page === "profile" &&
          <Profile user={user} setUser={setUser} />
        }


        {/* SHIFTS */}

        {page === "shifts" && (
          role === "admin"
            ? <AdminShifts />
            : <ShiftsHolidays />
        )}


        {/* ADMIN ROUTES */}

        {role === "admin" && page === "employees" &&
          <AdminEmployees />
        }

        {role === "admin" && page === "leave" &&
          <AdminLeave leaves={leaves} setLeaves={setLeaves} />
        }

        {role === "admin" && page === "messages" &&
          <AdminMessages />
        }

      </main>

    </div>
  );
}


// ================= STYLES =================

const styles = {

  appWrapper: {
    minHeight: "100vh",
    display: "flex",
    flexDirection: "column"
  },

  mainContent: {
    flex: 1,
    width: "100%",
    padding: "40px 60px"
  }

};

export default App;