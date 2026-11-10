import { useSafeAreaInsets } from "react-native-safe-area-context";
import React from "react";
import { Redirect, Tabs } from "expo-router";
import { AppHeader } from "@/components/header";
import { useTheme } from "@/hooks/use-theme";
import { SymbolView } from "expo-symbols";
import { ActivityIndicator, View } from "react-native";
import { useAuth } from "@/features/UserProfile/contexts/auth-context";

export default function AppLayout() {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const { user, loading } = useAuth();

  if (loading)
    return (
      <View
        style={{
          flex: 1,
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: theme.background,
        }}
      >
        <ActivityIndicator />
      </View>
    );
  if (!user) return <Redirect href="/login" />;

  return (
    <Tabs
      screenOptions={{
        headerShown: true,
        header: () => <AppHeader />,
        tabBarStyle: {
          backgroundColor: theme.backgroundElement,
          borderTopColor: theme.border,
          height: 80 + insets.bottom,
          paddingBottom: insets.bottom + 12,
          paddingTop: 8,
        },
        tabBarActiveTintColor: theme.primary,
        tabBarInactiveTintColor: theme.textSecondary,
        tabBarShowLabel: true,
        tabBarLabelStyle: { fontSize: 11, lineHeight: 16 },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Início",
          tabBarIcon: ({ color }) => (
            <SymbolView
              name={{ ios: "house.fill", android: "home", web: "home" }}
              size={24}
              tintColor={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="wallet"
        options={{
          title: "Carteira",
          tabBarIcon: ({ color }) => (
            <SymbolView
              name={{
                ios: "creditcard.fill",
                android: "account_balance_wallet",
                web: "account_balance_wallet",
              }}
              size={24}
              tintColor={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="stats"
        options={{
          title: "Análises",
          lazy: true,
          tabBarIcon: ({ color }) => (
            <SymbolView
              name={{
                ios: "chart.bar.fill",
                android: "bar_chart",
                web: "bar_chart",
              }}
              size={24}
              tintColor={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Perfil",
          tabBarIcon: ({ color }) => (
            <SymbolView
              name={{ ios: "person.fill", android: "person", web: "person" }}
              size={24}
              tintColor={color}
            />
          ),
        }}
      />
    </Tabs>
  );
}
