
"use client";

import { initializeFirebaseClient } from '@/lib/firebase/client';
import type { UserProfile } from '@/lib/types';
import type { User, Auth } from 'firebase/auth';
import type { Firestore } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, onSnapshot, setDoc, getDoc } from 'firebase/firestore';
import { createContext, useContext, useEffect, useState, useMemo } from 'react';
import { useToast } from '@/components/ui/toaster';
import { Loader2 } from 'lucide-react';

type AuthContextType = {
  user: User | null;
  userProfile: UserProfile | null;
  loading: boolean;
  auth: Auth | null;
  db: Firestore | null;
};

const AuthContext = createContext<AuthContextType>({ user: null, userProfile: null, loading: true, auth: null, db: null });

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
