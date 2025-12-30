"use client";

import { initializeApp, getApps, getApp, type FirebaseApp, type FirebaseOptions } from "firebase/app";
import { getAuth, type Auth, onAuthStateChanged, type User, getRedirectResult } from "firebase/auth";
import { getFirestore, type Firestore, doc, onSnapshot, setDoc } from "firebase/firestore";
import type { UserProfile } from '@/lib/types';
import { createContext, useContext, useEffect, useState, useMemo } from 'react';
import { useToast } from '@/components/ui/toaster';
import { Loader2 } from 'lucide-react';

type AuthContextType = {
  user: User | null;
  userProfile: UserProfile | null;
  loading: boolean;
  auth: Auth;
  db: Firestore;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export default function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [firebaseServices, setFirebaseServices] = useState<{auth: Auth, db: Firestore} | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const initAuth = async () => {
      try {
        let app: FirebaseApp;
        if (getApps().length === 0) {
            const response = await fetch('/api/firebase-config');
            if (!response.ok) {
                throw new Error(`Failed to fetch Firebase config: ${response.statusText}`);
            }
            const firebaseConfig: FirebaseOptions = await response.json();
            
            if (firebaseConfig && firebaseConfig.apiKey) {
                app = initializeApp(firebaseConfig);
            } else {
                throw new Error("Firebase config is missing or invalid.");
            }
        } else {
            app = getApp();
        }
        const auth = getAuth(app);
        const db = getFirestore(app);
        setFirebaseServices({ auth, db });
      } catch (error: any) {
        console.error("Firebase initialization failed:", error);
        toast({
          variant: 'destructive',
          title: 'Erro Crítico de Inicialização',
          description: error.message || 'Não foi possível conectar aos serviços. Tente recarregar a página.',
        });
        setLoading(false); // Stop loading on critical error
      }
    };
    
    initAuth();
  }, [toast]);

  useEffect(() => {
    if (firebaseServices) {
        const { auth, db } = firebaseServices;

        // Handle redirect result from Google Sign-In
        getRedirectResult(auth)
            .then((result) => {
                if (result) {
                    const user = result.user;
                    const userRef = doc(db, 'users', user.uid);
                    
                    const newUserProfile: UserProfile = {
                        uid: user.uid,
                        email: user.email,
                        displayName: user.displayName,
                        photoURL: user.photoURL,
                        subscriptionTier: 'free',
                    };
                    
                    // Use setDoc with merge: true to create or update the profile
                    setDoc(userRef, newUserProfile, { merge: true }).then(() => {
                        toast({ title: "Login com Google bem-sucedido!" });
                    });
                }
            })
            .catch((error) => {
                console.error("Error getting redirect result:", error);
                toast({
                    variant: 'destructive',
                    title: 'Erro no Login com Google',
                    description: error.message,
                });
            });


        const unsubscribe = onAuthStateChanged(auth, (user) => {
            setLoading(true);
            if (user) {
              setUser(user);
              const userRef = doc(db, 'users', user.uid);
              const unsubProfile = onSnapshot(userRef, (docSnap) => {
                if (docSnap.exists()) {
                  setUserProfile(docSnap.data() as UserProfile);
                } else {
                  // Profile might be created in AuthForm during signup
                  setUserProfile(null);
                }
                setLoading(false);
              }, (error) => {
                console.error("Error listening to user profile:", error);
                toast({
                  variant: 'destructive',
                  title: 'Erro de Sincronização',
                  description: `Não foi possível sincronizar seu perfil: ${error.message}`
                });
                setLoading(false);
              });
              return () => unsubProfile();
            } else {
              setUser(null);
              setUserProfile(null);
              setLoading(false);
            }
        });
        return () => unsubscribe();
    }
  }, [firebaseServices, toast]);
  
  const value = useMemo(() => (firebaseServices ? { 
      user, 
      userProfile, 
      loading, 
      auth: firebaseServices.auth,
      db: firebaseServices.db,
    } : undefined), [user, userProfile, loading, firebaseServices]);

  // Show a loading screen until Firebase is initialized
  if (!value) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="ml-4">Inicializando serviços...</p>
      </div>
    );
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
