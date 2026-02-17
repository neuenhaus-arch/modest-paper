import React, { useState } from "react";
import { auth } from "./firebaseConfig";
import { signInWithEmailAndPassword, signInAnonymously } from "firebase/auth";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (err) {
      setError("Login fehlgeschlagen. Bitte Daten prüfen.");
    }
  };

  const handleGastLogin = async () => {
    try {
      await signInAnonymously(auth);
    } catch (err) {
      setError("Gast-Zugang aktuell nicht verfügbar.");
    }
  };

  return (
    <div style={loginContainerStyle}>
      <form onSubmit={handleLogin} style={loginFormStyle}>
        <h2 style={{ marginBottom: "10px" }}>Dienstplan Login</h2>
        <p style={{ color: "#64748b", fontSize: "14px", marginBottom: "20px" }}>
          Bitte anmelden oder als Gast fortfahren.
        </p>

        {error && <p style={{ color: "#ef4444", fontSize: "14px" }}>{error}</p>}

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={inputStyle}
          required
        />
        <input
          type="password"
          placeholder="Passwort"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={inputStyle}
          required
        />

        <button type="submit" style={buttonStyle}>
          Anmelden
        </button>

        <div style={dividerStyle}>
          <span style={dividerTextStyle}>ODER</span>
        </div>

        <button
          type="button"
          onClick={handleGastLogin}
          style={guestButtonStyle}
        >
          👀 Nur Dienstplan ansehen
        </button>
      </form>
    </div>
  );
}

// Styles
const loginContainerStyle = {
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  height: "100vh",
  background: "#f1f5f9",
};
const loginFormStyle = {
  background: "white",
  padding: "40px",
  borderRadius: "12px",
  boxShadow: "0 10px 15px -3px rgba(0,0,0,0.1)",
  textAlign: "center",
  width: "90%",
  maxWidth: "500px",
  display: "flex",
  flexDirection: "column",
  gap: "10px",
};
const inputStyle = {
  display: "block",
  width: "100%",
  padding: "12px",
  marginBottom: "15px",
  borderRadius: "8px",
  border: "1px solid #cbd5e1",
  boxSizing: "border-box",
};
const buttonStyle = {
  width: "100%",
  padding: "12px",
  background: "#6366f1",
  color: "white",
  border: "none",
  borderRadius: "8px",
  cursor: "pointer",
  fontWeight: "bold",
  fontSize: "16px",
};
const dividerStyle = {
  margin: "20px 0",
  borderTop: "1px solid #e2e8f0",
  position: "relative",
};
const dividerTextStyle = {
  position: "absolute",
  top: "-10px",
  left: "50%",
  transform: "translateX(-50%)",
  background: "white",
  padding: "0 10px",
  color: "#94a3b8",
  fontSize: "12px",
};
const guestButtonStyle = {
  width: "100%",
  padding: "12px",
  marginTop: "10px", // Abstand nach oben zum ODER-Trenner
  background: "#f1f5f9", // Etwas dunkleres Grau für bessere Sichtbarkeit
  color: "#334155",
  border: "1px solid #cbd5e1",
  borderRadius: "8px",
  cursor: "pointer",
  fontWeight: "600",
  fontSize: "14px",
  transition: "background 0.2s", // Kleiner Effekt beim Drüberfahren
};
