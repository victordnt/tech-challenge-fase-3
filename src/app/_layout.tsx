import { DarkTheme, DefaultTheme, Slot, ThemeProvider } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
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
    background: '#F6F5FA',
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

  return (
    <ThemeProvider value={theme === 'dark' ? CustomDarkTheme : CustomDefaultTheme}>
      <TransactionsProvider>
        <Slot />
        <AnimatedSplashOverlay />
      </TransactionsProvider>
    </ThemeProvider>
  );
}
