import { useState } from "react";
import Navbar from "./Navbar";
import Login from "./Login";
import Attendance from "./Attendance";
import Payroll from "./Payroll";
import Profile from "./Profile";
import AdminEmployees from "./AdminEmployees";
import AdminReports from "./AdminReports";
import Leave from "./Leave";
import AdminLeave from "./AdminLeave";
import AdminDashboard from "./AdminDashboard";
import EmployeeDashboard from "./EmployeeDashboard";

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [role, setRole] = useState(null);
  const [page, setPage] = useState("dashboard");
  const [leaves, setLeaves] = useState([]);

  if (!isLoggedIn) {
    return (
      <Login
        onLogin={(userRole) => {
          setRole(userRole);
          setIsLoggedIn(true);
        }}
      />
    );
  }

  return (
    <div>
      <Navbar
        role={role}
        pendingCount={leaves.filter((l) => l.status === "Pending").length}
        onLogout={() => {
          setIsLoggedIn(false);
          setRole(null);
        }}
        onNavigate={setPage}
      />

      {/* DASHBOARD */}
      {page === "dashboard" &&
        (role === "admin" ? (
          <AdminDashboard />
        ) : (
          <EmployeeDashboard />
        ))}

      {/* EMPLOYEE PAGES */}
      {role === "employee" && (
        <>
          {page === "attendance" && <Attendance />}
          {page === "payroll" && <Payroll />}
          {page === "leave" && (
            <Leave leaves={leaves} setLeaves={setLeaves} />
          )}
          {page === "profile" && <Profile />}
        </>
      )}

      {/* ADMIN PAGES */}
      {role === "admin" && (
        <>
          {page === "employees" && <AdminEmployees />}
          {page === "leave" && (
            <AdminLeave leaves={leaves} setLeaves={setLeaves} />
          )}
          {page === "reports" && <AdminReports />}
        </>
      )}
    </div>
  );
}

export default App;
