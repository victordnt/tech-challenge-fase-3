import { auth } from "@/services/firebase/config";
import { DarkTheme, DefaultTheme, Slot, ThemeProvider } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from "react";
import { GluestackUIProvider } from '@gluestack-ui/themed';
import { config } from '@gluestack-ui/config';

import { AnimatedSplashOverlay } from '@/components/animated-icon';
import { AppProvider, useAppContext } from '@/contexts/app-context';
import { AuthProvider } from '@/features/UserProfile/contexts/auth-context';
import { TransactionsProvider } from '@/features/TransactionsList/contexts/transactions-context';

SplashScreen.preventAutoHideAsync();

const CustomDarkTheme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    background: '#101415',
  },
};

const CustomDefaultTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: '#101415',
  },
};

export default function TabLayout() {
  return (
    <GluestackUIProvider config={config}>
      <AuthProvider>
        <AppProvider>
          <AppLayout />
        </AppProvider>
      </AuthProvider>
    </GluestackUIProvider>
  );
}

function AppLayout() {
  const { theme } = useAppContext();

  useEffect(() => {
    console.log("LAYOUT MONTADO");
    console.log("projectId:", auth.app.options.projectId);
  }, []);

  return (
    <ThemeProvider value={theme === 'dark' ? CustomDarkTheme : CustomDefaultTheme}>
      <TransactionsProvider>
        <Slot />
        <AnimatedSplashOverlay />
      </TransactionsProvider>
    </ThemeProvider>
  );
}
