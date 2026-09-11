import { useColorScheme } from "@/hooks/use-color-scheme";
import { useTheme } from "@/hooks/use-theme";
import { StyleSheet, TouchableOpacity, View } from "react-native";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";

interface PaginationFooterProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export function PaginationFooter({
  currentPage,
  totalPages,
  onPageChange,
}: PaginationFooterProps) {
  const theme = useTheme();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";

  const neonColor = isDark ? theme.neon || "#A855F7" : theme.lilac || "#C084FC";

  if (totalPages <= 1) return null;

  const pageNumbers = Array.from({ length: totalPages }, (_, i) => i + 1);

  return (
    <ThemedView
      style={[
        styles.container,
        {
          backgroundColor: theme.backgroundElement,
          borderTopColor: theme.border,
        },
      ]}
    >
      <TouchableOpacity
        onPress={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        style={[
          styles.button,
          {
            backgroundColor:
              currentPage === 1 ? theme.backgroundSelected : neonColor,
            opacity: currentPage === 1 ? 0.5 : 1,
          },
        ]}
      >
        <ThemedText
          style={[styles.buttonText, currentPage !== 1 && { color: "#FFF" }]}
        >
          ← Anterior
        </ThemedText>
      </TouchableOpacity>

      <View style={styles.pageNumbers}>
        {pageNumbers.map((page) => (
          <TouchableOpacity
            key={page}
            onPress={() => onPageChange(page)}
            style={[
              styles.pageButton,
              {
                backgroundColor:
                  page === currentPage ? neonColor : theme.backgroundSelected,
              },
            ]}
          >
            <ThemedText
              style={[
                styles.pageText,
                page === currentPage && { color: "#FFF", fontWeight: "700" },
              ]}
            >
              {page}
            </ThemedText>
          </TouchableOpacity>
        ))}
      </View>

      <TouchableOpacity
        onPress={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        style={[
          styles.button,
          {
            backgroundColor:
              currentPage === totalPages ? theme.backgroundSelected : neonColor,
            opacity: currentPage === totalPages ? 0.5 : 1,
          },
        ]}
      >
        <ThemedText
          style={[
            styles.buttonText,
            currentPage !== totalPages && { color: "#FFF" },
          ]}
        >
          Próximo →
        </ThemedText>
      </TouchableOpacity>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 16,
    gap: 12,
    borderTopWidth: 1,
  },
  button: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
    minWidth: 100,
    alignItems: "center",
  },
  buttonText: {
    fontWeight: "600",
    fontSize: 12,
  },
  pageNumbers: {
    flexDirection: "row",
    gap: 6,
    justifyContent: "center",
    flex: 1,
  },
  pageButton: {
    width: 32,
    height: 32,
    borderRadius: 6,
    justifyContent: "center",
    alignItems: "center",
  },
  pageText: {
    fontSize: 12,
    fontWeight: "600",
  },
});
