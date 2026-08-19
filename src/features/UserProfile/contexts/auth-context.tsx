import { Href, useRouter } from "expo-router";
import type { User } from "firebase/auth";
import React, { createContext } from "react";

interface AuthContextType {
    user: User | null;
    loading: boolean;
    signUp: (email: string, password: string) => Promise<void>;
    signIn: (email: string, password: string) => Promise<void>;
    signOut: () => Promise<void>;
    sign: (action: "in" | "up") => (redirectPath: Href) => (email: string, password: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = React.useState<User | null>(null);
    const loading = false;
    const router = useRouter();

    const signUp = async (email: string, password: string) => {
        // const result = await authService.signUp(email, password);
        // setUser(result.user);
        setUser({ email: email || 'dev@example.com', uid: 'dev-user' } as any);
    };

    const signIn = async (email: string, password: string) => {
        // const result = await authService.signIn(email, password);
        // setUser(result.user);
        setUser({ email: email || 'dev@example.com', uid: 'dev-user' } as any);
    };

    const signOut = async () => {
        // await authService.signOutUser();
        setUser(null);
    };

    // Método curried: sign("in")("/(app)")(email, password)
    const sign = (action: "in" | "up") => {
        return (redirectPath: Href) => {
            return async (email: string, password: string) => {
                try {
                    if (action === "in") {
                        await signIn(email, password);
                    } else {
                        await signUp(email, password);
                    }
                    router.replace(redirectPath);
                } catch (error) {
                    throw error;
                }
            };
        };
    };

    return (
        <AuthContext.Provider value={{ user, loading, signUp, signIn, signOut, sign }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = React.useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth deve ser usado dentro de um AuthProvider');
    }
    return context;
}