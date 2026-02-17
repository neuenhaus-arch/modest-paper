import React, { useState } from "react";
import { db } from "./firebaseConfig";
import { doc, updateDoc } from "firebase/firestore";

export default function BenutzerVerwaltung({ mitarbeiter, addLog }) {
  const [editId, setEditId] = useState(null);
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("user");

  const handleSave = async (id) => {
    const userRef = doc(db, "mitarbeiter", id);
    await updateDoc(userRef, {
      email: email,
      role: role,
    });
    await addLog("update", `Benutzerrechte für Mitarbeiter aktualisiert.`);
    setEditId(null);
  };

  return (
    <div style={{ padding: "20px", background: "white", borderRadius: "10px" }}>
      <h2>🔐 Benutzerkonten & Rechte</h2>
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr style={{ textAlign: "left", borderBottom: "2px solid #eee" }}>
            <th style={{ padding: "10px" }}>Name</th>
            <th>Email / Login</th>
            <th>Rolle</th>
            <th>Aktion</th>
          </tr>
        </thead>
        <tbody>
          {mitarbeiter.map((m) => (
            <tr key={m.id} style={{ borderBottom: "1px solid #eee" }}>
              <td style={{ padding: "10px" }}>{m.name}</td>
              <td>
                {editId === m.id ? (
                  <input
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="email@beispiel.de"
                  />
                ) : (
                  m.email || <span style={{ color: "#ccc" }}>Kein Konto</span>
                )}
              </td>
              <td>
                {editId === m.id ? (
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                  >
                    <option value="user">User (Nur Lesen)</option>
                    <option value="admin">Admin (Vollzugriff)</option>
                  </select>
                ) : (
                  <span
                    style={{
                      padding: "4px 8px",
                      borderRadius: "4px",
                      background: m.role === "admin" ? "#fee2e2" : "#f1f5f9",
                      color: m.role === "admin" ? "#991b1b" : "#475569",
                    }}
                  >
                    {m.role === "admin" ? "Administrator" : "Mitarbeiter"}
                  </span>
                )}
              </td>
              <td>
                {editId === m.id ? (
                  <button onClick={() => handleSave(m.id)}>Speichern</button>
                ) : (
                  <button
                    onClick={() => {
                      setEditId(m.id);
                      setEmail(m.email || "");
                      setRole(m.role || "user");
                    }}
                  >
                    Bearbeiten
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
