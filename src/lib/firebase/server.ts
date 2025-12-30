
import { getApp, getApps, initializeApp, type FirebaseApp } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { getAuth } from "firebase-admin/auth";

let app: FirebaseApp;

// Em ambientes hospedados pelo Google (como App Hosting, Cloud Functions, etc.),
// o SDK Admin pode detectar automaticamente as credenciais do ambiente.
// Chamar initializeApp() sem argumentos funciona nesses casos.
if (getApps().length === 0) {
    app = initializeApp();
} else {
    app = getApp();
}

export const db = getFirestore(app);
export const auth = getAuth(app);
