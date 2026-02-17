import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyCMtn9RDiACBmC1abwTeYZDB82iXGdAEpQ",
  authDomain: "dienstplan-3fb9b.firebaseapp.com",
  projectId: "dienstplan-3fb9b",
  storageBucket: "dienstplan-3fb9b.firebasestorage.app",
  messagingSenderId: "960943017287",
  appId: "1:960943017287:web:2207ce9632c21a0a945062",
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);
