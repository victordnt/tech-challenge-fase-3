import { Href, useRouter } from "expo-router";
import type { User } from "firebase/auth";
import React, { createContext, useEffect, useState } from "react";
import * as authService from "@/features/UserProfile/services/auth-service";
import { clearAccountNotifications } from "@/services/notifications";

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signUp: (email: string, password: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  refreshProfile: () => void;
  sign: (
    action: "in" | "up",
  ) => (
    redirectPath: Href,
  ) => (email: string, password: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [, setProfileRevision] = useState(0);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = authService.observeAuthState((currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const signUp = async (email: string, password: string) => {
    const result = await authService.signUp(email, password);
    setUser(result.user);
  };

  const signIn = async (email: string, password: string) => {
    const result = await authService.signIn(email, password);
    setUser(result.user);
  };

  const signOut = async () => {
    if (user) await clearAccountNotifications(user.uid).catch(() => undefined);
    await authService.signOutUser();
    setUser(null);
  };

  // Método curried: sign("in")("/(app)")(email, password)
  const sign = (action: "in" | "up") => {
    return (redirectPath: Href) => {
      return async (email: string, password: string) => {
        if (action === "in") {
          await signIn(email, password);
        } else {
          await signUp(email, password);
        }
        router.replace(redirectPath);
      };
    };
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        signUp,
        signIn,
        signOut,
        sign,
        refreshProfile: () => setProfileRevision((v) => v + 1),
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = React.useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth deve ser usado dentro de um AuthProvider");
  }
  return context;
}
