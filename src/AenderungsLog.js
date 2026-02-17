import React from "react";

export default function AenderungsLog({ logs }) {
  // Hilfsfunktion zur sicheren Formatierung des Datums
  const formatDatum = (timestamp) => {
    if (!timestamp) return "Wird gespeichert...";
    const date = timestamp.seconds
      ? new Date(timestamp.seconds * 1000)
      : new Date(timestamp);
    return date.toLocaleString("de-DE", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
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
      <h2
        style={{
          marginBottom: "20px",
          display: "flex",
          alignItems: "center",
          gap: "10px",
        }}
      >
        📜 Änderungsverlauf
      </h2>

      {logs.length === 0 ? (
        <p style={{ color: "#64748b", textAlign: "center", padding: "20px" }}>
          Noch keine Einträge vorhanden.
        </p>
      ) : (
        <div style={{ maxHeight: "600px", overflowY: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr
                style={{
                  textAlign: "left",
                  borderBottom: "2px solid #f1f5f9",
                  color: "#64748b",
                  fontSize: "0.85rem",
                }}
              >
                <th style={{ padding: "12px" }}>Zeitpunkt</th>
                <th style={{ padding: "12px" }}>Benutzer</th> {/* NEU */}
                <th style={{ padding: "12px" }}>Aktion</th>
                <th style={{ padding: "12px" }}>Details</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((log) => (
                <tr
                  key={log.id}
                  style={{
                    borderBottom: "1px solid #f8fafc",
                    fontSize: "14px",
                    transition: "background 0.2s",
                  }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.backgroundColor = "#f8fafc")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.backgroundColor = "transparent")
                  }
                >
                  <td
                    style={{
                      padding: "12px",
                      color: "#475569",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {formatDatum(log.timestamp)}
                  </td>

                  {/* BENUTZER-SPALTE ANZEIGEN */}
                  <td
                    style={{
                      padding: "12px",
                      color: "#6366f1",
                      fontWeight: "600",
                    }}
                  >
                    {log.user || "System"}
                  </td>

                  <td style={{ padding: "12px" }}>
                    <span
                      style={{
                        padding: "4px 8px",
                        borderRadius: "6px",
                        fontSize: "11px",
                        fontWeight: "700",
                        textTransform: "uppercase",
                        background:
                          log.type === "delete"
                            ? "#fee2e2"
                            : log.type === "create"
                            ? "#dcfce7"
                            : "#fef9c3",
                        color:
                          log.type === "delete"
                            ? "#991b1b"
                            : log.type === "create"
                            ? "#166534"
                            : "#854d0e",
                      }}
                    >
                      {log.type === "delete"
                        ? "Löschen"
                        : log.type === "create"
                        ? "Erstellen"
                        : "Update"}
                    </span>
                  </td>
                  <td
                    style={{
                      padding: "12px",
                      color: "#1e293b",
                      fontWeight: "500",
                    }}
                  >
                    {log.message}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
