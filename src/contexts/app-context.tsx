import React, { createContext, useContext, useMemo, useState } from 'react';

interface AppContextValue {
    isLoading: boolean;
    setIsLoading: (value: boolean) => void;
    errorMessage: string | null;
    setErrorMessage: (value: string | null) => void;
    theme: 'light' | 'dark';
    setTheme: (value: 'light' | 'dark') => Promise<void>;
}

const AppContext = createContext<AppContextValue | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
    const [isLoading, setIsLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const theme: 'light' | 'dark' = 'dark';

    const setTheme = async (value: 'light' | 'dark') => {
        // Desativado por solicitação do usuário: app permanente no modo Dark
    };

    const value = useMemo(
        () => ({ isLoading, setIsLoading, errorMessage, setErrorMessage, theme, setTheme }),
        [isLoading, errorMessage, theme],
    );

    return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useAppContext() {
    const context = useContext(AppContext);

    if (!context) {
        throw new Error('useAppContext must be used within an AppProvider');
    }

    return context;
}
