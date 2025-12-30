"use client";

import { auth, db } from '@/lib/firebase/client';
import type { UserProfile } from '@/lib/types';
import type { User } from 'firebase/auth';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, onSnapshot, setDoc, getDoc } from 'firebase/firestore';
import { createContext, useContext, useEffect, useState, useMemo } from 'react';

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

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setLoading(true);
      if (user) {
        setUser(user);
        const userRef = doc(db, 'users', user.uid);
        
        const unsubProfile = onSnapshot(userRef, async (docSnap) => {
            if (docSnap.exists()) {
                setUserProfile(docSnap.data() as UserProfile);
            } else {
                // To prevent race conditions, check one more time if the doc exists
                const userDoc = await getDoc(userRef);
                if (!userDoc.exists()) {
                    const newUserProfile: UserProfile = {
                        uid: user.uid,
                        email: user.email,
                        displayName: user.displayName,
                        photoURL: user.photoURL,
                        subscriptionTier: 'free',
                    };
                    await setDoc(userRef, newUserProfile);
                    setUserProfile(newUserProfile);
                } else {
                    setUserProfile(userDoc.data() as UserProfile);
                }
            }
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
  }, []);
  
  const value = useMemo(() => ({ user, userProfile, loading }), [user, userProfile, loading]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
