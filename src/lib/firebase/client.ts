import { initializeApp, getApps, getApp, type FirebaseApp, type FirebaseOptions } from "firebase/app";
import { getAuth, type Auth } from "firebase/auth";
import { getFirestore, type Firestore } from "firebase/firestore";

let app: FirebaseApp | undefined;
let auth: Auth | undefined;
let db: Firestore | undefined;

let firebaseInitialized = false;

export async function initializeFirebaseClient(): Promise<{auth: Auth, db: Firestore} | null> {
    if (firebaseInitialized && app && auth && db) {
        return { auth, db };
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
                return null;
            }
        } catch(error) {
            console.error("Error initializing Firebase from config:", error);
            return null;
        }
    }
    
    auth = getAuth(app);
    db = getFirestore(app);
    firebaseInitialized = true;
    
    return { auth, db };
}

// Export a getter function for db and auth to ensure they are initialized.
// Note: These direct exports might still be problematic if imported at the top level
// of modules that execute before initializeFirebaseClient is complete.
// Prefer using the context-provided instances.
export { db, auth };
