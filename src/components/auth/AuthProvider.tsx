"use client";

import { auth, db } from '@/lib/firebase/client';
import type { UserProfile } from '@/lib/types';
import type { User } from 'firebase/auth';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, onSnapshot, setDoc, serverTimestamp } from 'firebase/firestore';
import { createContext, useContext, useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';

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
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setLoading(true);
      if (user) {
        setUser(user);
        const userRef = doc(db, 'users', user.uid);
        
        const unsubProfile = onSnapshot(userRef, async (docSnap) => {
            if (docSnap.exists()) {
                const profileData = docSnap.data() as UserProfile;
                setUserProfile(profileData);
                 if (window.location.pathname === '/auth' || window.location.pathname === '/onboarding' ) {
                    if (profileData.companyId) {
                      router.replace('/dashboard');
                    } else {
                      router.replace('/onboarding');
                    }
                }
            } else {
                // Create user profile if it doesn't exist
                const newUserProfile: UserProfile = {
                    uid: user.uid,
                    email: user.email,
                    displayName: user.displayName,
                    photoURL: user.photoURL,
                    subscriptionTier: 'free', // Default to free tier
                    createdAt: serverTimestamp(),
                    updatedAt: serverTimestamp(),
                };
                await setDoc(userRef, newUserProfile);
                setUserProfile(newUserProfile);
                router.replace('/onboarding');
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
        // No user, redirect to auth page if not already there and not on the landing page
        if (window.location.pathname.startsWith('/dashboard') || window.location.pathname.startsWith('/onboarding')) {
          router.replace('/auth');
        }
      }
    });

    return () => unsubscribe();
  }, [router]);
  
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