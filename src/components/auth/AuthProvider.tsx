"use client";

import { initializeFirebaseClient } from '@/lib/firebase/client';
import type { UserProfile } from '@/lib/types';
import type { User, Auth } from 'firebase/auth';
import type { Firestore } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, onSnapshot } from 'firebase/firestore';
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
        const services = await initializeFirebaseClient();
        if (services) {
          setFirebaseServices(services);
          const { auth, db } = services;
          const unsubscribe = onAuthStateChanged(auth, (user) => {
            setLoading(true);
            if (user) {
              setUser(user);
              const userRef = doc(db, 'users', user.uid);
              const unsubProfile = onSnapshot(userRef, (docSnap) => {
                if (docSnap.exists()) {
                  setUserProfile(docSnap.data() as UserProfile);
                } else {
                  // Profile is created in AuthForm now, so we just set loading to false.
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
        } else {
          throw new Error('Firebase services could not be initialized.');
        }
      } catch (error: any) {
        console.error("Firebase initialization failed:", error);
        toast({
          variant: 'destructive',
          title: 'Erro Crítico de Inicialização',
          description: error.message || 'Não foi possível conectar aos serviços. Tente recarregar a página.',
        });
        setLoading(false);
      }
    };
    
    initAuth();
  }, [toast]);
  
  const value = useMemo(() => (firebaseServices ? { 
      user, 
      userProfile, 
      loading, 
      auth: firebaseServices.auth,
      db: firebaseServices.db,
    } : undefined), [user, userProfile, loading, firebaseServices]);

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
