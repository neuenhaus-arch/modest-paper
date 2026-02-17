import React, { useState } from "react";
import { db } from "./firebaseConfig";
import { collection, addDoc, deleteDoc, doc } from "firebase/firestore";

export default function DienstplanTabelle({
  shifts,
  mitarbeiter,
  monat,
  jahr,
  userRole,
  legende,
  addLog,
}) {
  // Berechnet die Tage des gewählten Monats
  const anzahlTage = new Date(jahr, monat + 1, 0).getDate();
  const tage = Array.from({ length: anzahlTage }, (_, i) => i + 1);
  const [modalDaten, setModalDaten] = useState(null);

  // Hilfsfunktion zur Berechnung der Netto-Stunden
  const berechneNettoStunden = (zeitString) => {
    if (!zeitString || !zeitString.includes("-")) return 0;

    const [start, ende] = zeitString.split("-");
    const [startH, startM] = start.split(":").map(Number);
    const [endeH, endeM] = ende.split(":").map(Number);

    const startDezimal = startH + startM / 60;
    const endeDezimal = endeH + endeM / 60;

    let dauer = endeDezimal - startDezimal;
    if (dauer < 0) dauer += 24;

    if (dauer >= 9) return dauer - 0.75; // 45 Min Pause
    if (dauer >= 6) return dauer - 0.5; // 30 Min Pause
    return dauer;
  };

  const onCellClick = async (name, datum, existingShift) => {
    if (userRole !== "admin") return;
    setModalDaten({ name, datum, shift: existingShift });
  };

  return (
    <div
      style={{
        overflowX: "auto",
        border: "1px solid #ccc",
        borderRadius: "8px",
      }}
    >
      <table
        style={{
          width: "100%",
          borderCollapse: "separate",
          borderSpacing: 0,
          minWidth: "800px",
        }}
      >
        <thead>
          <tr style={{ background: "#f3f4f6" }}>
            <th style={stickyHeaderStyle}>Tag</th>
            {mitarbeiter.map((m) => (
              <th
                key={m.id || (typeof m.name === "object" ? m.name.id : m.name)}
                style={{ ...cellStyle, minWidth: "100px", padding: "8px" }}
              >
                <div style={{ fontWeight: "bold", fontSize: "14px" }}>
                  {/* Falls m.name ein Objekt ist, nimm m.name.name, sonst m.name */}
                  {typeof m.name === "object" ? m.name.name : m.name}
                </div>
                <div
                  style={{
                    fontSize: "10px",
                    fontWeight: "normal",
                    color: "#64748b",
                    marginTop: "2px",
                  }}
                >
                  {/* Falls m.beruf ein Objekt ist, nimm m.beruf.name oder ähnlich */}
                  {typeof m.beruf === "object" ? m.beruf.name : m.beruf || "-"}
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {tage.map((tag) => {
            const datumString = `${jahr}-${(monat + 1)
              .toString()
              .padStart(2, "0")}-${tag.toString().padStart(2, "0")}`;
            const istWE = [0, 6].includes(new Date(jahr, monat, tag).getDay());

            return (
              <tr key={tag} style={{ background: istWE ? "#fff7ed" : "#fff" }}>
                <td style={stickyColumnStyle}>{tag}.</td>
                {mitarbeiter.map((m) => {
                  const shift = shifts.find(
                    (s) => s.date === datumString && s.employee === m.name
                  );
                  return (
                    <td
                      key={m.id || m.name}
                      style={{
                        ...cellStyle,
                        cursor: userRole === "admin" ? "pointer" : "default",
                      }}
                      onClick={() => onCellClick(m.name, datumString, shift)}
                    >
                      {shift ? (
                        <div
                          style={{
                            ...shiftBoxStyle,
                            backgroundColor:
                              legende.find((l) => l.zeit === shift.time)
                                ?.color || "#6366f1",
                            color:
                              legende.find((l) => l.zeit === shift.time)
                                ?.textColor || "white",
                          }}
                        >
                          {shift.time}
                        </div>
                      ) : (
                        <span style={{ color: "#ccc" }}>+</span>
                      )}
                    </td>
                  );
                })}
              </tr>
            );
          })}
        </tbody>
      </table>

      {/* Stunden-Zusammenfassung */}
      <div
        style={{
          marginTop: "30px",
          padding: "15px",
          background: "#f8fafc",
          borderRadius: "8px",
          border: "1px solid #e2e8f0",
        }}
      >
        <h3 style={{ fontSize: "1rem", marginBottom: "10px" }}>
          Stunden-Zusammenfassung (Netto)
        </h3>
        <table style={{ width: "100%", fontSize: "0.9rem" }}>
          <thead>
            <tr style={{ textAlign: "left", color: "#64748b" }}>
              <th>Mitarbeiter</th>
              <th style={{ textAlign: "right" }}>Stunden gesamt</th>
            </tr>
          </thead>
          <tbody>
            {mitarbeiter.map((m) => {
              const mName = typeof m.name === "string" ? m.name : "";
              const gesamtStunden = shifts
                .filter((s) => s.employee === m.name)
                .reduce((sum, s) => sum + berechneNettoStunden(s.time), 0);

              return (
                <tr
                  key={m.id || m.name}
                  style={{ borderBottom: "1px solid #f1f5f9" }}
                >
                  <td style={{ padding: "8px 0" }}>
                    <div style={{ fontWeight: "500" }}>
                      {typeof m.name === `string` ? m.name : "Unbekannt"}
                    </div>
                    <div style={{ fontSize: "10px", color: "#64748b" }}>
                      {typeof m.beruf === `string`
                        ? m.beruf.name
                        : m.beruf || "-"}
                    </div>
                  </td>
                  <td
                    style={{
                      padding: "8px 0",
                      textAlign: "right",
                      fontWeight: "bold",
                    }}
                  >
                    {gesamtStunden.toFixed(2)} Std.
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      {/* --- MODAL POP-UP START --- */}
      {modalDaten && (
        <div style={modalOverlayStyle}>
          <div style={modalContentStyle}>
            <h3 style={{ marginTop: 0, color: "#1e293b" }}>Schicht zuteilen</h3>
            <p
              style={{
                fontSize: "14px",
                color: "#64748b",
                marginBottom: "20px",
              }}
            >
              {modalDaten.name} am {modalDaten.datum}
            </p>

            <label
              style={{
                display: "block",
                fontSize: "12px",
                fontWeight: "bold",
                marginBottom: "5px",
              }}
            >
              Schicht auswählen:
            </label>
            <select
              style={selectStyle}
              onChange={async (e) => {
                const wahl = e.target.value;
                if (!wahl) return;

                const passendeLegende = legende.find((l) => l.name === wahl);

                // Falls schon eine Schicht existiert, löschen wir sie vor dem Neu-Eintrag
                if (modalDaten.shift) {
                  await deleteDoc(doc(db, "shifts", modalDaten.shift.id));
                }

                await addDoc(collection(db, "shifts"), {
                  employee: modalDaten.name,
                  date: modalDaten.datum,
                  time: passendeLegende.zeit,
                  type: passendeLegende.name,
                });

                await addLog(
                  "create",
                  `${passendeLegende.name} für ${modalDaten.name} eingetragen.`
                );
                setModalDaten(null);
              }}
            >
              <option value="">-- Bitte wählen --</option>
              {legende.map((l) => (
                <option key={l.id} value={l.name}>
                  {l.name} ({l.zeit})
                </option>
              ))}
            </select>

            <div style={{ marginTop: "25px", display: "flex", gap: "10px" }}>
              {modalDaten.shift && (
                <button
                  onClick={async () => {
                    await deleteDoc(doc(db, "shifts", modalDaten.shift.id));
                    await addLog("delete", `Schicht gelöscht`);
                    setModalDaten(null);
                  }}
                  style={{ ...btnStyle, background: "#ef4444" }}
                >
                  Löschen
                </button>
              )}
              <button
                onClick={() => setModalDaten(null)}
                style={{
                  ...btnStyle,
                  background: "#f1f5f9",
                  color: "#475569",
                  border: "1px solid #cbd5e1",
                }}
              >
                Abbrechen
              </button>
            </div>
          </div>
        </div>
      )}
      {/* --- MODAL POP-UP ENDE --- */}
    </div>
  );
}

// Styling (Korrekturen bei fontSize)
const cellStyle = {
  border: "1px solid #eee",
  padding: "4px 2px",
  textAlign: "center",
  minWidth: "60px",
  fontSize: "12px",
};
const stickyHeaderStyle = {
  ...cellStyle,
  position: "sticky",
  top: 0,
  left: 0,
  background: "#f3f4f6",
  zIndex: 3,
};
const stickyColumnStyle = {
  ...cellStyle,
  position: "sticky",
  left: 0,
  background: "#fafafa",
  zIndex: 1,
  fontWeight: "bold",
};
const shiftBoxStyle = {
  padding: "2px",
  borderRadius: "4px",
  fontWeight: "bold",
  fontSize: "10px",
};
const modalOverlayStyle = {
  position: "fixed",
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  background: "rgba(15, 23, 42, 0.7)", // Dunkler, moderner Hintergrund
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  zIndex: 2000,
  backdropFilter: "blur(2px)", // Leichter Unschärfe-Effekt
};

const modalContentStyle = {
  background: "white",
  padding: "30px",
  borderRadius: "16px",
  minWidth: "350px",
  boxShadow:
    "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
};

const selectStyle = {
  width: "100%",
  padding: "12px",
  borderRadius: "8px",
  border: "1px solid #cbd5e1",
  fontSize: "16px",
  backgroundColor: "#f8fafc",
  cursor: "pointer",
};

const btnStyle = {
  flex: 1,
  padding: "12px",
  border: "none",
  borderRadius: "8px",
  fontWeight: "bold",
  cursor: "pointer",
  color: "white",
  transition: "opacity 0.2s",
};
