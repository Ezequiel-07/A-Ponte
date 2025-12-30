import { initializeApp, getApps, getApp, type FirebaseOptions } from "firebase/app";
import { getAuth, type Auth } from "firebase/auth";
import { getFirestore, type Firestore } from "firebase/firestore";

let app;
let auth: Auth;
let db: Firestore;

let firebaseInitialized = false;

async function initializeFirebaseClient() {
    if (firebaseInitialized) {
        return;
    }

    if (getApps().length) {
        app = getApp();
    } else {
        try {
            const response = await fetch('/api/firebase-config');
            if (!response.ok) {
                throw new Error(`Failed to fetch Firebase config: ${response.statusText}`);
            }
            const firebaseConfig: FirebaseOptions = await response.json();
            
            if (firebaseConfig && firebaseConfig.apiKey) {
                app = initializeApp(firebaseConfig);
            } else {
                console.error("Firebase config is missing or invalid.");
                return;
            }
        } catch(error) {
            console.error("Error initializing Firebase from config:", error);
            return;
        }
    }
    auth = getAuth(app);
    db = getFirestore(app);
    firebaseInitialized = true;
}


export { app, db, auth, initializeFirebaseClient };
