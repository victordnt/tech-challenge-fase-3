import { useColorScheme } from "@/hooks/use-color-scheme";
import { LoginModal } from "@/features/UserProfile/components/login-modal";
import { Colors } from "@/constants/theme";
import { useAuth } from "@/features/UserProfile/contexts/auth-context";
import { View } from "react-native";
import { Redirect } from "expo-router";

export default function LoginScreen() {
  const colorScheme = (useColorScheme() || "light") as "light" | "dark";
  const theme = Colors[colorScheme];
  const { sign, user } = useAuth();

  if (user) return <Redirect href="/(app)" />;

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: theme.background,
      }}
    >
      <LoginModal
        onSignIn={sign("in")("/(app)")}
        onSignUp={sign("up")("/(app)")}
      />
    </View>
  );
}
