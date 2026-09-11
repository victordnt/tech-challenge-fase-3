import { StyleSheet, View } from "react-native";
import { useTheme } from "@/hooks/use-theme";
import { ThemedText } from "@/components/themed-text";

interface SummaryCardsProps {
  totalIncome: number;
  totalExpense: number;
  balance: number;
}
const currency = (value: number) =>
  value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

export function SummaryCards({
  totalIncome,
  totalExpense,
  balance,
}: SummaryCardsProps) {
  const theme = useTheme();
  return (
    <View style={{ gap: 12 }}>
      <View
        style={[
          styles.balance,
          {
            backgroundColor: theme.primary + "18",
            borderColor: theme.primary + "60",
          },
        ]}
      >
        <ThemedText type="small" themeColor="textSecondary">
          Saldo do período carregado
        </ThemedText>
        <ThemedText
          style={{ fontSize: 30, lineHeight: 38, fontWeight: "700" }}
          adjustsFontSizeToFit
          numberOfLines={1}
        >
          {currency(balance)}
        </ThemedText>
        <ThemedText
          type="small"
          style={{ color: balance >= 0 ? theme.success : theme.danger }}
        >
          {balance >= 0 ? "Saldo positivo" : "Saldo negativo"}
        </ThemedText>
      </View>
      <View style={styles.row}>
        {[
          { label: "↙ Entradas", amount: totalIncome, color: theme.success },
          { label: "↗ Saídas", amount: totalExpense, color: theme.danger },
        ].map((item) => (
          <View
            key={item.label}
            style={[
              styles.card,
              {
                backgroundColor: theme.backgroundElement,
                borderColor: theme.border,
              },
            ]}
          >
            <ThemedText type="small" themeColor="textSecondary">
              {item.label}
            </ThemedText>
            <ThemedText
              numberOfLines={1}
              adjustsFontSizeToFit
              style={{
                fontSize: 18,
                lineHeight: 26,
                fontWeight: "700",
                color: item.color,
              }}
            >
              {currency(item.amount)}
            </ThemedText>
          </View>
        ))}
      </View>
    </View>
  );
}
const styles = StyleSheet.create({
  balance: { borderWidth: 1, borderRadius: 20, padding: 20, gap: 6 },
  row: { flexDirection: "row", gap: 12 },
  card: {
    flex: 1,
    minWidth: 0,
    borderWidth: 1,
    borderRadius: 16,
    padding: 16,
    gap: 8,
  },
});
