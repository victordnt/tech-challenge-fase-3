import { useColorScheme } from "@/hooks/use-color-scheme";
import { Colors } from "@/constants/theme";
import { useAuth } from "@/features/UserProfile/contexts/auth-context";
import { Redirect } from "expo-router";
import { ActivityIndicator, View } from "react-native";

export default function HomeRedirect() {
  const { user, loading } = useAuth();
  const colorScheme = useColorScheme() || "light";
  const theme = Colors[colorScheme];

  if (loading) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: theme.background,
        }}
      >
        <ActivityIndicator size="large" color={theme.primary} />
      </View>
    );
  }

  if (!user) {
    return <Redirect href="/login" />;
  }

  return <Redirect href="/(app)" />;
}
