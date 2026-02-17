import React, { useState } from "react";

export default function LegendenVerwaltung({
  legende,
  onAdd,
  onDelete,
  userRole,
}) {
  // States für die erweiterten Felder
  const [kuerzel, setKuerzel] = useState("");
  const [bezeichnung, setBezeichnung] = useState("");
  const [arbeitszeit, setArbeitszeit] = useState("");
  const [bgColor, setBgColor] = useState("#6366f1");
  const [textColor, setTextColor] = useState("#ffffff");

  const handleSpeichern = () => {
    if (!kuerzel || !bezeichnung) {
      alert("Bitte mindestens Kürzel und Bezeichnung angeben!");
      return;
    }
    onAdd({
      name: kuerzel, // Wir nutzen das Kürzel als Primär-Identifikator (Name)
      bezeichnung,
      zeit: arbeitszeit,
      color: bgColor,
      textColor: textColor,
    });
    // Felder leeren
    setKuerzel("");
    setBezeichnung("");
    setArbeitszeit("");
  };

  return (
    <div
      style={{
        padding: "20px",
        background: "white",
        borderRadius: "10px",
        boxShadow: "0 2px 10px rgba(0,0,0,0.05)",
      }}
    >
      <h2>🎨 Schicht-Legende Verwaltung</h2>

      {userRole === "admin" && (
        <div
          style={{
            background: "#f8fafc",
            padding: "15px",
            borderRadius: "8px",
            marginBottom: "20px",
            display: "grid",
            gridTemplateColumns: "1fr 1fr 1fr",
            gap: "10px",
          }}
        >
          <input
            placeholder="Kürzel (z.B. F)"
            value={kuerzel}
            onChange={(e) => setKuerzel(e.target.value)}
          />
          <input
            placeholder="Bezeichnung (z.B. Frühschicht)"
            value={bezeichnung}
            onChange={(e) => setBezeichnung(e.target.value)}
          />
          <input
            placeholder="Zeit (z.B. 06:00-14:00)"
            value={arbeitszeit}
            onChange={(e) => setArbeitszeit(e.target.value)}
          />

          <div style={{ display: "flex", alignItems: "center", gap: "5px" }}>
            <label style={{ fontSize: "12px" }}>Hintergrund:</label>
            <input
              type="color"
              value={bgColor}
              onChange={(e) => setBgColor(e.target.value)}
              style={{ width: "40px", height: "30px", border: "none" }}
            />
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "5px" }}>
            <label style={{ fontSize: "12px" }}>Schrift:</label>
            <input
              type="color"
              value={textColor}
              onChange={(e) => setTextColor(e.target.value)}
              style={{ width: "40px", height: "30px", border: "none" }}
            />
          </div>

          <button
            onClick={handleSpeichern}
            style={{
              background: "#22c55e",
              color: "white",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
              fontWeight: "bold",
            }}
          >
            ➕ Hinzufügen
          </button>
        </div>
      )}

      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr
            style={{
              textAlign: "left",
              borderBottom: "2px solid #eee",
              color: "#64748b",
            }}
          >
            <th style={{ padding: "10px" }}>Vorschau</th>
            <th style={{ padding: "10px" }}>Kürzel</th>
            <th style={{ padding: "10px" }}>Bezeichnung</th>
            <th style={{ padding: "10px" }}>Arbeitszeit</th>
            {userRole === "admin" && (
              <th style={{ padding: "10px" }}>Aktion</th>
            )}
          </tr>
        </thead>
        <tbody>
          {legende.map((item) => (
            <tr key={item.id} style={{ borderBottom: "1px solid #f1f5f9" }}>
              <td style={{ padding: "10px" }}>
                <div
                  style={{
                    background: item.color,
                    color: item.textColor || "white",
                    padding: "4px 8px",
                    borderRadius: "4px",
                    textAlign: "center",
                    fontWeight: "bold",
                    width: "fit-content",
                    minWidth: "40px",
                  }}
                >
                  {item.name}
                </div>
              </td>
              <td style={{ padding: "10px" }}>{item.name}</td>
              <td style={{ padding: "10px" }}>{item.bezeichnung || "-"}</td>
              <td style={{ padding: "10px" }}>{item.zeit || "-"}</td>
              {userRole === "admin" && (
                <td style={{ padding: "10px" }}>
                  <button
                    onClick={() => onDelete(item.id)}
                    style={{
                      border: "none",
                      background: "none",
                      cursor: "pointer",
                    }}
                  >
                    🗑️
                  </button>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
