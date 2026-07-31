import { auth } from "@/services/firebase/config";
import { DarkTheme, DefaultTheme, Slot, ThemeProvider } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from "react";
import { useColorScheme } from 'react-native';

import { AnimatedSplashOverlay } from '@/components/animated-icon';
import { AppProvider } from '@/contexts/app-context';
import { AuthProvider } from '@/contexts/auth-context';
import { TransactionsProvider } from '@/contexts/transactions-context';

SplashScreen.preventAutoHideAsync();

export default function TabLayout() {
  const colorScheme = useColorScheme();

  useEffect(() => {
    console.log("LAYOUT MONTADO");
    console.log("projectId:", auth.app.options.projectId);
  }, []);

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <AuthProvider>
        <AppProvider>
          <TransactionsProvider>
            <Slot />
            <AnimatedSplashOverlay />
          </TransactionsProvider>
        </AppProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
