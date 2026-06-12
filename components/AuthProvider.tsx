"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
  type User,
} from "firebase/auth";
import { getFirebaseAuth, isFirebaseConfigured } from "@/lib/firebase/client";
import { getUserProfile, upsertUserProfile } from "@/lib/firebase/db";
import type { UserProfile } from "@/lib/types";

interface AuthContextValue {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  configured: boolean;
  register: (email: string, password: string, nickname: string, avatar: string) => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isFirebaseConfigured) {
      setLoading(false);
      return;
    }
    const auth = getFirebaseAuth();
    const unsub = onAuthStateChanged(auth, async (u) => {
      setUser(u);
      if (u) {
        const p = await getUserProfile(u.uid);
        setProfile(
          p ?? {
            uid: u.uid,
            nickname: u.displayName ?? u.email?.split("@")[0] ?? "Jugador",
            email: u.email ?? "",
            avatar: "⚽",
            createdAt: Date.now(),
          }
        );
      } else {
        setProfile(null);
      }
      setLoading(false);
    });
    return () => unsub();
  }, []);

  async function register(email: string, password: string, nickname: string, avatar: string) {
    const auth = getFirebaseAuth();
    const cred = await createUserWithEmailAndPassword(auth, email, password);
    await updateProfile(cred.user, { displayName: nickname });
    const newProfile: UserProfile = {
      uid: cred.user.uid,
      nickname: nickname.trim(),
      email,
      avatar,
      createdAt: Date.now(),
    };
    await upsertUserProfile(newProfile);
    setProfile(newProfile);
  }

  async function login(email: string, password: string) {
    const auth = getFirebaseAuth();
    await signInWithEmailAndPassword(auth, email, password);
  }

  async function logout() {
    const auth = getFirebaseAuth();
    await signOut(auth);
  }

  async function resetPassword(email: string) {
    const auth = getFirebaseAuth();
    await sendPasswordResetEmail(auth, email);
  }

  const value = useMemo<AuthContextValue>(
    () => ({ user, profile, loading, configured: isFirebaseConfigured, register, login, logout, resetPassword }),
    [user, profile, loading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth debe usarse dentro de <AuthProvider>");
  return ctx;
}
