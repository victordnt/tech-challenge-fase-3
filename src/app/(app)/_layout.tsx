import React from 'react';
import { Tabs } from 'expo-router';
import { FloatingNavbar } from '@/components/floating-navbar';
import { AppHeader } from '@/components/header';

export default function AppLayout() {
    return (
        <Tabs
            tabBar={(props) => <FloatingNavbar {...props} />}
            screenOptions={{
                headerShown: true,
                header: () => <AppHeader />,
            }}
        >
            <Tabs.Screen
                name="index"
                options={{
                    title: 'Home',
                }}
            />
            <Tabs.Screen
                name="wallet"
                options={{
                    title: 'Carteira',
                }}
            />
            <Tabs.Screen
                name="stats"
                options={{
                    title: 'Estatísticas',
                }}
            />
            <Tabs.Screen
                name="profile"
                options={{
                    title: 'Perfil',
                }}
            />
        </Tabs>
    );
}
