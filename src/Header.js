import logo from "./logo.png";

function Header() {
  return (
    <div style={styles.container}>
      <img
        src={logo}
        alt="ClockIn Logo"
        style={styles.logo}
      />

      <p style={styles.tagline}>
        Track Time. Pay Right.
      </p>
    </div>
  );
}

const styles = {
  container: {
    textAlign: "center",
    marginBottom: "40px",
  },
  logo: {
    width: "220px",        // big hero logo
    marginBottom: "14px",
  },
  tagline: {
    fontSize: "18px",
    color: "#475569",
    letterSpacing: "0.5px",
  },
};

export default Header;
