import React from 'react';
import { Tabs } from 'expo-router';
import { AppHeader } from '@/components/header';
import { useTheme } from '@/hooks/use-theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { SymbolView } from 'expo-symbols';

export default function AppLayout() {
    const theme = useTheme();
    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';

    return (
        <Tabs
            screenOptions={{
                headerShown: true,
                header: () => <AppHeader />,
                tabBarStyle: {
                    backgroundColor: isDark ? '#1E1E20' : '#FFFFFF',
                    borderTopColor: isDark ? '#2E2E33' : '#E5E5E5',
                    height: 60,
                    paddingBottom: 8,
                    paddingTop: 8,
                },
                tabBarActiveTintColor: theme.primary || '#8A56FF',
                tabBarInactiveTintColor: isDark ? '#94A3B8' : '#64748B',
                tabBarShowLabel: true,
            }}
        >
            <Tabs.Screen
                name="index"
                options={{
                    title: 'Home',
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
                    title: 'Status',
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
