import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';

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
    const [theme, setThemeState] = useState<'light' | 'dark'>('light');

    // Carregar tema do AsyncStorage ao iniciar
    useEffect(() => {
        const loadTheme = async () => {
            try {
                const savedTheme = await AsyncStorage.getItem('app-theme');
                if (savedTheme === 'dark' || savedTheme === 'light') {
                    setThemeState(savedTheme);
                }
            } catch (error) {
                console.error('Erro ao carregar tema:', error);
            }
        };
        loadTheme();
    }, []);

    const setTheme = async (value: 'light' | 'dark') => {
        try {
            setThemeState(value);
            await AsyncStorage.setItem('app-theme', value);
        } catch (error) {
            console.error('Erro ao salvar tema:', error);
        }
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
