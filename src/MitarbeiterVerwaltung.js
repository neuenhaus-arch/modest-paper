import React, { useState } from "react";

export default function MitarbeiterVerwaltung({
  mitarbeiter,
  onAdd,
  onDelete,
  userRole,
}) {
  const [neuerName, setNeuerName] = useState("");
  const [neuerBeruf, setNeuerBeruf] = useState(""); // NEU: State für Beruf
  const [neueReihenfolge, setNeueReihenfolge] = useState(1);
  const [istSL, setIstSL] = useState(false);

  const submit = () => {
    if (neuerName.trim() !== "" && neuerBeruf.trim() !== "") {
      // Wir übergeben den Beruf als vierten Parameter an App.js
      onAdd(neuerName, neueReihenfolge, istSL, neuerBeruf);
      setNeuerName("");
      setNeuerBeruf(""); // Feld leeren
      setNeueReihenfolge((prev) => Number(prev) + 1);
      setIstSL(false);
    } else {
      alert("Bitte Name und Beruf eingeben!");
    }
  };

  return (
    <div style={{ padding: "20px", background: "white", borderRadius: "10px" }}>
      <h2 className="no-print">Team-Verwaltung</h2>

      {userRole === "admin" && (
        <div
          className="no-print"
          style={{
            display: "flex",
            gap: "10px",
            marginBottom: "20px",
            alignItems: "center",
            flexWrap: "wrap",
          }}
        >
          <input
            placeholder="Name"
            value={neuerName}
            onChange={(e) => setNeuerName(e.target.value)}
            style={{ padding: "8px" }}
          />
          {/* NEU: Input für die Berufsbezeichnung */}
          <input
            placeholder="Beruf (z.B. PFK)"
            value={neuerBeruf}
            onChange={(e) => setNeuerBeruf(e.target.value)}
            style={{ padding: "8px" }}
          />
          <input
            type="number"
            placeholder="Pos."
            value={neueReihenfolge}
            onChange={(e) => setNeueReihenfolge(e.target.value)}
            style={{ width: "60px", padding: "8px" }}
          />
          <label style={{ display: "flex", alignItems: "center", gap: "5px" }}>
            <input
              type="checkbox"
              checked={istSL}
              onChange={(e) => setIstSL(e.target.checked)}
            />
            SL?
          </label>
          <button
            onClick={submit}
            style={{
              padding: "8px 15px",
              background: "#6366f1",
              color: "white",
              border: "none",
              borderRadius: "5px",
              cursor: "pointer",
            }}
          >
            Hinzufügen
          </button>
        </div>
      )}

      <ul style={{ listStyle: "none", padding: 0 }}>
        {mitarbeiter.map((m) => (
          <li
            key={m.id}
            style={{
              display: "flex",
              justifyContent: "space-between",
              padding: "12px",
              borderBottom: "1px solid #eee",
              background: m.isSchichtleiter ? "#f8fafc" : "white",
            }}
          >
            <div style={{ display: "flex", flexDirection: "column" }}>
              <span
                style={{ fontWeight: m.isSchichtleiter ? "bold" : "normal" }}
              >
                {m.reihenfolge}. {m.name} {m.isSchichtleiter && "⭐ (SL)"}
              </span>
              {/* Anzeige des Berufs unter dem Namen in der Liste */}
              <span style={{ fontSize: "12px", color: "#64748b" }}>
                {m.beruf || "Kein Beruf hinterlegt"}
              </span>
            </div>
            {userRole === "admin" && (
              <button
                onClick={() => onDelete(m.id)}
                style={{
                  border: "none",
                  background: "none",
                  cursor: "pointer",
                }}
              >
                ❌
              </button>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
