import { useColorScheme } from "@/hooks/use-color-scheme";
import { useTheme } from "@/hooks/use-theme";
import { Platform, StyleSheet, TouchableOpacity } from "react-native";
import { ThemedText } from "@/components/themed-text";

interface TransactionButtonProps {
  onPress: () => void;
}

export function TransactionButton({ onPress }: TransactionButtonProps) {
  const theme = useTheme();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";

  return (
    <TouchableOpacity
      onPress={onPress}
      style={[
        styles.fab,
        {
          backgroundColor: theme.primary,
          shadowColor: theme.primary,
          shadowOpacity: isDark ? 0.8 : 0.35,
          shadowRadius: isDark ? 20 : 10,
          elevation: isDark ? 15 : 6,
          ...Platform.select({
            web: {
              boxShadow: isDark
                ? "0 6px 24px rgba(168, 85, 247, 0.45)"
                : "0 6px 20px rgba(124, 58, 237, 0.35)",
            } as any,
          }),
        },
      ]}
      activeOpacity={0.8}
    >
      <ThemedText style={styles.plusIcon}>+ Nova Transação</ThemedText>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  fab: {
    position: "absolute",
    bottom: 30,
    right: 20,
    height: 48,
    paddingHorizontal: 20,
    borderRadius: 24,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 10,
  },
  plusIcon: {
    fontSize: 14,
    fontWeight: "600",
    color: "#FFFFFF",
    textAlign: "center",
  },
});
