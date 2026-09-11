import React, { createContext, useContext, useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

interface AppContextValue {
  isLoading: boolean;
  setIsLoading: (value: boolean) => void;
  errorMessage: string | null;
  setErrorMessage: (value: string | null) => void;
  theme: "light" | "dark";
  setTheme: (value: "light" | "dark") => Promise<void>;
}

const AppContext = createContext<AppContextValue | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [theme, updateTheme] = useState<"light" | "dark">("dark");

  useEffect(() => {
    let active = true;
    AsyncStorage.getItem("mavi.theme")
      .then((saved) => {
        if (active && (saved === "dark" || saved === "light"))
          updateTheme(saved);
      })
      .catch(() => undefined);
    return () => {
      active = false;
    };
  }, []);

  const setTheme = async (value: "light" | "dark") => {
    await AsyncStorage.setItem("mavi.theme", value);
    updateTheme(value);
  };

  const value = {
    isLoading,
    setIsLoading,
    errorMessage,
    setErrorMessage,
    theme,
    setTheme,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useAppContext() {
  const context = useContext(AppContext);

  if (!context) {
    throw new Error("useAppContext must be used within an AppProvider");
  }

  return context;
}
