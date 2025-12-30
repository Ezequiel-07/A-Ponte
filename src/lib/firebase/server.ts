
import { getApp, getApps, initializeApp, type FirebaseApp } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { getAuth } from "firebase-admin/auth";

// Function to get the Firebase config from environment variables
const getFirebaseConfig = () => {
  // Note: In a server environment like Vercel or Firebase Functions,
  // you might use environment variables for service account keys.
  // The Firebase Admin SDK can automatically detect credentials in many environments.
  const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT_KEY
    ? JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY)
    : undefined;

  const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;

  if (!projectId) {
    throw new Error("Firebase project ID is missing. Check your .env.local file.");
  }

  return {
    credential: serviceAccount ? require('firebase-admin').credential.cert(serviceAccount) : undefined,
    projectId: projectId,
  };
};

let app: FirebaseApp;
if (getApps().length === 0) {
    app = initializeApp(getFirebaseConfig());
} else {
    app = getApp();
}

export const db = getFirestore(app);
export const auth = getAuth(app);
