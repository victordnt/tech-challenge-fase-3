import { useSafeAreaInsets } from 'react-native-safe-area-context';
import React from 'react';
import { Redirect, Tabs } from 'expo-router';
import { AppHeader } from '@/components/header';
import { useTheme } from '@/hooks/use-theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { SymbolView } from 'expo-symbols';
import { ActivityIndicator, View } from 'react-native';
import { useAuth } from '@/features/UserProfile/contexts/auth-context';

export default function AppLayout() {
    const theme = useTheme();
    const insets = useSafeAreaInsets();
    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';
    const { user, loading } = useAuth();

    if (loading) return <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: theme.background }}><ActivityIndicator /></View>;
    if (!user) return <Redirect href="/login" />;

    return (
        <Tabs
            screenOptions={{
                headerShown: true,
                header: () => <AppHeader />,
                tabBarStyle: {
                    backgroundColor: isDark ? '#1E1E20' : '#FFFFFF',
                    borderTopColor: isDark ? '#2E2E33' : '#E5E5E5',
                    height: 80 + insets.bottom,
                    paddingBottom: insets.bottom + 12,
                    paddingTop: 8,
                },
                tabBarActiveTintColor: theme.primary || '#8A56FF',
                tabBarInactiveTintColor: isDark ? '#94A3B8' : '#64748B',
                tabBarShowLabel: true,
                tabBarLabelStyle: { fontSize: 11, lineHeight: 16 },
            }}
        >
            <Tabs.Screen
                name="index"
                options={{
                    title: 'Início',
                    tabBarIcon: ({ color }) => (
                        <SymbolView name={{ ios: 'house.fill', android: 'home', web: 'home' }} size={24} tintColor={color} />
                    ),
                }}
            />
            <Tabs.Screen
                name="wallet"
                options={{
                    title: 'Carteira',
                    tabBarIcon: ({ color }) => (
                        <SymbolView name={{ ios: 'creditcard.fill', android: 'account_balance_wallet', web: 'account_balance_wallet' }} size={24} tintColor={color} />
                    ),
                }}
            />
            <Tabs.Screen
                name="stats"
                options={{
                    title: 'Análises',
                    tabBarIcon: ({ color }) => (
                        <SymbolView name={{ ios: 'chart.bar.fill', android: 'bar_chart', web: 'bar_chart' }} size={24} tintColor={color} />
                    ),
                }}
            />
            <Tabs.Screen
                name="profile"
                options={{
                    title: 'Perfil',
                    tabBarIcon: ({ color }) => (
                        <SymbolView name={{ ios: 'person.fill', android: 'person', web: 'person' }} size={24} tintColor={color} />
                    ),
                }}
            />
        </Tabs>
    );
}
