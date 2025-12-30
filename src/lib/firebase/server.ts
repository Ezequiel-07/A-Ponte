import { initializeApp, getApps, getApp, type FirebaseOptions } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Use as mesmas variáveis de ambiente do cliente para garantir consistência.
// O Next.js disponibiliza as variáveis com prefixo NEXT_PUBLIC_ tanto para o cliente quanto para o servidor.
const firebaseConfig: FirebaseOptions = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

const serverApp = getApps().find(app => app.name === 'server') || initializeApp(firebaseConfig, 'server');
const serverAuth = getAuth(serverApp);
const serverDb = getFirestore(serverApp);

export { serverApp, serverAuth, serverDb };
