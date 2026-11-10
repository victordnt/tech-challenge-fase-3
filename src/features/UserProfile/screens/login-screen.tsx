import { Colors } from "@/constants/theme";
import { LoginModal } from "@/features/UserProfile/components/login-modal";
import { useAuth } from "@/features/UserProfile/contexts/auth-context";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { Redirect } from "expo-router";
import React from "react";
import { StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function LoginScreen() {
  const colorScheme = (useColorScheme() || "light") as "light" | "dark";
  const theme = Colors[colorScheme];
  const { sign, user } = useAuth();

  if (user) return <Redirect href="/(app)" />;

  return (
    <SafeAreaView
      style={[
        styles.safeArea,
        { backgroundColor: theme.background },
      ]}
      edges={["top", "bottom", "left", "right"]}
    >
      <LoginModal
        onSignIn={sign("in")("/(app)")}
        onSignUp={sign("up")("/(app)")}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
});
