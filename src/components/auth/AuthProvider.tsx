"use client";

import { auth, db, initializeFirebaseClient } from '@/lib/firebase/client';
import type { UserProfile } from '@/lib/types';
import type { User } from 'firebase/auth';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, onSnapshot, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { createContext, useContext, useEffect, useState, useMemo } from 'react';
import { useToast } from '@/components/ui/toaster';
import { Loader2 } from 'lucide-react';

type AuthContextType = {
  user: User | null;
  userProfile: UserProfile | null;
  loading: boolean;
};

const AuthContext = createContext<AuthContextType>({ user: null, userProfile: null, loading: true });

export default function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [firebaseInitialized, setFirebaseInitialized] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    initializeFirebaseClient().then(() => {
      setFirebaseInitialized(true);
      const unsubscribe = onAuthStateChanged(auth, async (user) => {
        setLoading(true);
        if (user) {
          setUser(user);
          const userRef = doc(db, 'users', user.uid);

          const unsubProfile = onSnapshot(userRef, (docSnap) => {
            if (docSnap.exists()) {
              setUserProfile(docSnap.data() as UserProfile);
              setLoading(false);
            } else {
              const newUserProfile: UserProfile = {
                uid: user.uid,
                email: user.email,
                displayName: user.displayName,
                photoURL: user.photoURL,
                subscriptionTier: 'free',
              };
              setDoc(userRef, newUserProfile)
                .then(() => {
                  setUserProfile(newUserProfile);
                  setLoading(false);
                })
                .catch((error) => {
                  console.error("Error creating user profile:", error);
                  toast({
                    variant: 'destructive',
                    title: 'Erro ao criar perfil',
                    description: `Ocorreu um erro: ${error.message}`
                  });
                  setLoading(false);
                });
            }
          }, (error) => {
            console.error("Error listening to user profile:", error);
            toast({
              variant: 'destructive',
              title: 'Erro de Sincronização',
              description: `Não foi possível sincronizar seu perfil: ${error.message}`
            });
            setLoading(false);
          });

          return () => {
            unsubProfile();
          };
        } else {
          setUser(null);
          setUserProfile(null);
          setLoading(false);
        }
      });

      return () => unsubscribe();
    });
  }, [toast]);
  
  const value = useMemo(() => ({ user, userProfile, loading }), [user, userProfile, loading]);

  if (!firebaseInitialized) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
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
