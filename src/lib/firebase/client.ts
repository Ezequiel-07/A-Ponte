import { initializeApp, getApps, getApp, type FirebaseOptions } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

let app, auth, db;

async function initializeFirebaseClient() {
    if (getApps().length) {
        app = getApp();
    } else {
        const response = await fetch('/api/firebase-config');
        const firebaseConfig: FirebaseOptions = await response.json();
        
        if (firebaseConfig.apiKey) {
            app = initializeApp(firebaseConfig);
        } else {
            console.error("Firebase config is not loaded yet.");
            // You might want to have a fallback or retry mechanism here
            return;
        }
    }
    auth = getAuth(app);
    db = getFirestore(app);
}

// Immediately call the async function.
// The rest of the app will need to handle the async nature of this.
// For now, we assume components will wait or re-render once `auth` and `db` are available.
initializeFirebaseClient();

export { app, db, auth };
