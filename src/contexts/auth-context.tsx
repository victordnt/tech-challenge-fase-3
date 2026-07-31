import React, { createContext } from "react";
import type { User } from "firebase/auth";

interface AuthContextType {
    user: User | null;
    signUp: (email: string, password: string) => Promise<void>;
    signIn: (email: string, password: string) => Promise<void>;
    signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = React.useState<User | null>(null);

    const signUp = async (email: string, password: string) => {
        // Implement sign-up logic here
    };

    const signIn = async (email: string, password: string) => {
        // Implement sign-in logic here
    };

    const signOut = async () => {
        // Implement sign-out logic here
    };

    return (
        <AuthContext.Provider value={{ user, signUp, signIn, signOut }}>
            {children}
        </AuthContext.Provider>
    );
}