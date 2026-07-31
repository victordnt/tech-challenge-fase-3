import React, { createContext, useContext, useMemo, useState } from 'react';

interface AppContextValue {
    isLoading: boolean;
    setIsLoading: (value: boolean) => void;
    errorMessage: string | null;
    setErrorMessage: (value: string | null) => void;
}

const AppContext = createContext<AppContextValue | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
    const [isLoading, setIsLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    const value = useMemo(
        () => ({ isLoading, setIsLoading, errorMessage, setErrorMessage }),
        [isLoading, errorMessage],
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
