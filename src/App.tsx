import React, { useState, useEffect } from "react";
import { db, auth } from "./firebaseConfig"; // 'auth' muss in firebaseConfig exportiert sein
import {
  collection,
  onSnapshot,
  addDoc,
  deleteDoc,
  doc,
  query,
  orderBy,
  serverTimestamp,
  limit,
  where, // Neu für die Rollenprüfung
} from "firebase/firestore";
import { onAuthStateChanged, signOut } from "firebase/auth"; // Firebase Auth Funktionen

import DienstplanTabelle from "./DienstplanTabelle";
import MitarbeiterVerwaltung from "./MitarbeiterVerwaltung";
import LegendenVerwaltung from "./LegendenVerwaltung";
import AenderungsLog from "./AenderungsLog";
import BenutzerVerwaltung from "./BenutzerVerwaltung";
import Login from "./Login"; // Deine neue Login-Komponente
import "./styles.css";

export default function App() {
  // --- States ---
  const [user, setUser] = useState(null); // Speichert den angemeldeten User
  const [loading, setLoading] = useState(true); // Wartet auf Auth-Check
  const [aktiverTab, setAktiverTab] = useState("dienstplan");
  const [userRole, setUserRole] = useState("user");
  const [mitarbeiterListe, setMitarbeiterListe] = useState([]);
  const [shifts, setShifts] = useState([]);
  const [legende, setLegende] = useState([]);
  const [logs, setLogs] = useState([]);

  // Datum-States
  const heute = new Date();
  const [ausgewaehlterMonat, setAusgewaehlterMonat] = useState(
    heute.getMonth()
  );
  const [ausgewaehltesJahr, setAusgewaehltesJahr] = useState(
    heute.getFullYear()
  );

  const monate = [
    "Januar",
    "Februar",
    "März",
    "April",
    "Mai",
    "Juni",
    "Juli",
    "August",
    "September",
    "Oktober",
    "November",
    "Dezember",
  ];

  // --- Authentifizierung & Rollen-Check ---
  useEffect(() => {
    const unsubAuth = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);

        if (currentUser.isAnonymous) {
          // GastModus
          setUserRole("gast");
          setLoading(false);
        } else {
          // Prüfen, welche Rolle dieser User in der Datenbank hat
          const q = query(
            collection(db, "mitarbeiter"),
            where("email", "==", currentUser.email.toLowerCase()) // Sicherer mit toLowerCase()
          );

          // Hier war der Fehler: Die Klammer-Struktur
          onSnapshot(q, (snapshot) => {
            if (!snapshot.empty) {
              const userData = snapshot.docs[0].data();
              setUserRole(userData.role || "user");
            } else {
              setUserRole("user");
            }
            setLoading(false);
          });
        } // Schließt das else für registrierte User
      } else {
        setUser(null);
        setUserRole("user");
        setLoading(false);
      }
    });

    return () => unsubAuth();
  }, []);

  // --- Firebase Daten-Listener ---
  useEffect(() => {
    if (!user) return; // Nur laden, wenn eingeloggt

    const unsubLegende = onSnapshot(collection(db, "legende"), (snapshot) => {
      setLegende(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
    });

    const qMitarbeiter = query(
      collection(db, "mitarbeiter"),
      orderBy("reihenfolge", "asc")
    );
    const unsubMitarbeiter = onSnapshot(qMitarbeiter, (snapshot) => {
      setMitarbeiterListe(
        snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
      );
    });

    const unsubShifts = onSnapshot(collection(db, "shifts"), (snapshot) => {
      setShifts(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
    });

    const qLogs = query(
      collection(db, "logs"),
      orderBy("timestamp", "desc"),
      limit(50)
    );
    const unsubLogs = onSnapshot(qLogs, (snapshot) => {
      setLogs(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
    });

    return () => {
      unsubLegende();
      unsubMitarbeiter();
      unsubShifts();
      unsubLogs();
    };
  }, [user]); // Lädt Daten neu, wenn sich der User ändert

  // --- Hilfsfunktionen ---
  const addLog = async (type, message) => {
    try {
      const mitarbeiterEintrag = mitarbeiterListe.find(
        (m) => m.email === user?.email
      );
      const benutzerName = mitarbeiterEintrag
        ? mitarbeiterEintrag.name
        : user?.email;

      await addDoc(collection(db, "logs"), {
        type,
        message,
        user: benutzerName,
        timestamp: serverTimestamp(),
      });
    } catch (e) {
      console.error("Log-Fehler:", e);
    }
  };

  // --- Logout Funktion (Ersetzt adminLogin) ---
  const handleLogout = () => {
    signOut(auth);
    alert("Erfolgreich abgemeldet.");
  };

  // --- Render-Logik ---
  if (loading) return <div className="loading">Lade Dienstplan...</div>;
  if (!user) return <Login />; // Zeige Login-Maske, wenn nicht angemeldet

  return (
    <div className="container">
      {/* Benutzer-Info Header */}
      <div className="user-bar no-print">
        <span>
          Eingeloggt als:{" "}
          <b>{user.isAnonymous ? "Gast-Nutzer" : user?.email}</b> ({userRole})
        </span>
        <button onClick={handleLogout} className="logout-btn">
          Abmelden
        </button>
      </div>

      {/* Navigation */}
      <nav
        className="no-print"
        style={{ display: "flex", gap: "10px", marginBottom: "20px" }}
      >
        <button onClick={() => setAktiverTab("dienstplan")}>
          📅 Dienstplan
        </button>

        {/* Nur anzeigen, wenn NICHT Gast */}
        {userRole !== "gast" && (
          <>
            <button onClick={() => setAktiverTab("mitarbeiter")}>
              👥 Team
            </button>
            <button onClick={() => setAktiverTab("legende")}>🎨 Legende</button>
            <button onClick={() => setAktiverTab("logs")}>📜 Verlauf</button>
          </>
        )}
        {userRole === "admin" && (
          <button onClick={() => setAktiverTab("benutzer")}>🔐 Konten</button>
        )}
      </nav>

      <div className="no-print" style={{ marginBottom: "20px" }}>
        <button onClick={() => window.print()}>🖨️ PDF / Drucken</button>
      </div>

      {/* Content-Bereiche (Tabs) */}
      {aktiverTab === "dienstplan" && (
        <>
          <div className="druck-titel">
            <h1>
              Dienstplan {monate[ausgewaehlterMonat]} {ausgewaehltesJahr}
            </h1>
          </div>
          <div className="no-print" style={{ marginBottom: "15px" }}>
            <select
              value={ausgewaehlterMonat}
              onChange={(e) => setAusgewaehlterMonat(Number(e.target.value))}
            >
              {monate.map((name, i) => (
                <option key={i} value={i}>
                  {name}
                </option>
              ))}
            </select>
            <select
              value={ausgewaehltesJahr}
              onChange={(e) => setAusgewaehltesJahr(Number(e.target.value))}
            >
              {[2025, 2026, 2027].map((j) => (
                <option key={j} value={j}>
                  {j}
                </option>
              ))}
            </select>
          </div>
          <DienstplanTabelle
            shifts={shifts}
            mitarbeiter={mitarbeiterListe}
            monat={ausgewaehlterMonat}
            jahr={ausgewaehltesJahr}
            userRole={userRole}
            legende={legende}
            addLog={addLog}
          />
        </>
      )}

      {aktiverTab === "mitarbeiter" && (
        <MitarbeiterVerwaltung
          mitarbeiter={mitarbeiterListe}
          onAdd={async (name, reihenfolge, isSchichtleiter, beruf) => {
            if (userRole !== "admin") return;
            await addDoc(collection(db, "mitarbeiter"), {
              name,
              reihenfolge: Number(reihenfolge),
              isSchichtleiter,
              beruf: beruf || "Mitarbeiter",
            });
            await addLog("create", `Mitarbeiter ${name} hinzugefügt.`);
          }}
          onDelete={async (id) => {
            if (userRole !== "admin") return;
            if (window.confirm("Mitarbeiter wirklich löschen?")) {
              await deleteDoc(doc(db, "mitarbeiter", id));
              await addLog("delete", "Mitarbeiter gelöscht.");
            }
          }}
          userRole={userRole}
        />
      )}

      {aktiverTab === "legende" && (
        <LegendenVerwaltung
          legende={legende}
          onAdd={async (neuesItem) => {
            if (userRole !== "admin") return;
            await addDoc(collection(db, "legende"), neuesItem);
            await addLog("create", `Legende: ${neuesItem.name} hinzugefügt.`);
          }}
          onDelete={async (id) => {
            if (userRole !== "admin") return;
            if (window.confirm("Eintrag löschen?")) {
              await deleteDoc(doc(db, "legende", id));
              await addLog("delete", "Legenden-Eintrag gelöscht.");
            }
          }}
          userRole={userRole}
        />
      )}

      {aktiverTab === "logs" && <AenderungsLog logs={logs} />}

      {/* --- ENDE DER NEUEN BLÖCKE --- */}

      {aktiverTab === "benutzer" && userRole === "admin" && (
        <BenutzerVerwaltung mitarbeiter={mitarbeiterListe} addLog={addLog} />
      )}
    </div>
  );
}
