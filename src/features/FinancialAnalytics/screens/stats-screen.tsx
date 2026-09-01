import {
  StyleSheet,
  ScrollView,
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useMemo, useState } from "react";
import { Badge, BadgeText } from "@gluestack-ui/themed";
import { SymbolView } from "expo-symbols";

import { ThemedText } from "@/components/themed-text";
import { useTheme } from "@/hooks/use-theme";
import { useTransactions } from "@/features/TransactionsList/contexts/transactions-context";
import CashFlowGraph from "../components/CashFlowGraph";
import CategoriesGraph from "../components/CategoriesGraph";

export default function StatsScreen() {
  const theme = useTheme();
  const { transactions, loading } = useTransactions();
  const [selectedFilter, setSelectedFilter] = useState("Mês");
  const filterOptions = ["Semana", "Mês", "Ano"];

  // Filtrar transações pelo período selecionado
  const filteredTransactions = useMemo(() => {
    const now = new Date();
    return transactions.filter((t) => {
      const txDate = new Date(t.date);
      if (isNaN(txDate.getTime())) return true;
      const diffDays = (now.getTime() - txDate.getTime()) / (1000 * 3600 * 24);

      if (selectedFilter === "Semana") return diffDays <= 7;
      if (selectedFilter === "Mês") return diffDays <= 30;
      if (selectedFilter === "Ano") return diffDays <= 365;
      return true;
    });
  }, [transactions, selectedFilter]);

  // Cálculos dos 4 Cards reutilizando tokens do tema
  const statsCards = useMemo(() => {
    let totalSpent = 0;
    let totalIncome = 0;
    let expenseCount = 0;
    let incomeCount = 0;

    const categoryTotals: { [cat: string]: number } = {};

    filteredTransactions.forEach((t) => {
      const amt = Number(t.amount) || 0;
      if (t.type === "expense") {
        totalSpent += amt;
        expenseCount++;
        categoryTotals[t.category] = (categoryTotals[t.category] || 0) + amt;
      } else if (t.type === "income") {
        totalIncome += amt;
        incomeCount++;
      }
    });

    const netBalance = totalIncome - totalSpent;
    const savingsRate =
      totalIncome > 0 ? Math.max(0, (netBalance / totalIncome) * 100) : 0;

    // Achar maior categoria de gastos
    let topCategory = "Nenhum";
    let topCategoryAmount = 0;
    Object.entries(categoryTotals).forEach(([cat, sum]) => {
      if (sum > topCategoryAmount) {
        topCategoryAmount = sum;
        topCategory = cat;
      }
    });

    const topCategoryPercent =
      totalSpent > 0 ? ((topCategoryAmount / totalSpent) * 100).toFixed(0) : "0";

    return [
      {
        title: "Total de saídas",
        value: `R$ ${totalSpent.toFixed(2)}`,
        subtext: `${expenseCount} saídas no período`,
        subtextColor: theme.expense,
        iconName: { ios: "arrow.down.right", android: "trending_down", web: "trending_down" },
        iconColor: theme.expense,
      },
      {
        title: "Total de entradas",
        value: `R$ ${totalIncome.toFixed(2)}`,
        subtext: `${incomeCount} entradas no período`,
        subtextColor: theme.income,
        iconName: { ios: "arrow.up.right", android: "trending_up", web: "trending_up" },
        iconColor: theme.income,
      },
      {
        title: "Taxa de poupança",
        value: `${savingsRate.toFixed(1)}%`,
        subtext: totalIncome > 0 ? "do total recebido" : "sem entradas no período",
        subtextColor: theme.textSecondary,
        iconName: { ios: "piggybank", android: "savings", web: "savings" },
        iconColor: theme.chartPalette[2] || "#B9C5F2",
      },
      {
        title: "Maior gasto",
        value: topCategory,
        subtext: topCategoryAmount > 0 ? `${topCategoryPercent}% dos gastos (R$ ${topCategoryAmount.toFixed(2)})` : "Sem saídas no período",
        subtextColor: theme.textSecondary,
        iconName: { ios: "chart.pie", android: "pie_chart", web: "pie_chart" },
        iconColor: theme.chartPalette[3] || "#FFB4A3",
      },
    ];
  }, [filteredTransactions, theme]);

  return (
    <SafeAreaView
      style={[styles.safeArea, { backgroundColor: theme.background }]}
      edges={["left", "right"]}
    >
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Header */}
        <View>
          <ThemedText type="title" style={styles.title}>
           Analytics
          </ThemedText>
          <ThemedText type="small" style={{ color: theme.textSecondary }}>
            Seu panorama financeiro
          </ThemedText>
        </View>

        {/* Filters */}
        <View>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.filterContainer}
          >
            {filterOptions.map((option) => (
              <TouchableOpacity
                key={option}
                onPress={() => setSelectedFilter(option)}
                activeOpacity={0.8}
              >
                <Badge
                  style={[
                    styles.badge,
                    selectedFilter === option
                      ? {
                          backgroundColor: theme.badgeActiveBg,
                          borderColor: "transparent",
                        }
                      : {
                          backgroundColor: theme.badgeInactiveBg,
                          borderColor: theme.badgeInactiveBorder,
                          borderWidth: 1,
                        },
                  ]}
                >
                  <BadgeText
                    style={[
                      styles.badgeText,
                      selectedFilter === option
                        ? { color: theme.badgeActiveText }
                        : { color: theme.badgeInactiveText },
                    ]}
                  >
                    {option}
                  </BadgeText>
                </Badge>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={theme.primary} />
            <ThemedText type="small" style={{ color: theme.textMuted, marginTop: 12 }}>
              Carregando análises do Firebase...
            </ThemedText>
          </View>
        ) : (
          <>
            {/* Stats Cards Grid */}
            <View style={styles.gridContainer}>
              <View style={styles.row}>
                {/* Card 1 */}
                <View style={[styles.card, { backgroundColor: theme.cardBg, borderColor: theme.cardBorder }]}>
                  <View style={styles.cardHeader}>
                    <SymbolView
                      name={statsCards[0].iconName as any}
                      size={14}
                      tintColor={statsCards[0].iconColor}
                      weight="bold"
                    />
                    <Text style={[styles.cardLabel, { color: theme.textSecondary }]}>{statsCards[0].title}</Text>
                  </View>
                  <View style={styles.cardContent}>
                    <Text style={[styles.cardValue, { color: theme.text }]}>{statsCards[0].value}</Text>
                    <Text
                      style={[
                        styles.cardSubtext,
                        { color: statsCards[0].subtextColor },
                      ]}
                    >
                      {statsCards[0].subtext}
                    </Text>
                  </View>
                </View>

                {/* Card 2 */}
                <View style={[styles.card, { backgroundColor: theme.cardBg, borderColor: theme.cardBorder }]}>
                  <View style={styles.cardHeader}>
                    <SymbolView
                      name={statsCards[1].iconName as any}
                      size={14}
                      tintColor={statsCards[1].iconColor}
                      weight="bold"
                    />
                    <Text style={[styles.cardLabel, { color: theme.textSecondary }]}>{statsCards[1].title}</Text>
                  </View>
                  <View style={styles.cardContent}>
                    <Text style={[styles.cardValue, { color: theme.text }]}>{statsCards[1].value}</Text>
                    <Text
                      style={[
                        styles.cardSubtext,
                        { color: statsCards[1].subtextColor },
                      ]}
                    >
                      {statsCards[1].subtext}
                    </Text>
                  </View>
                </View>
              </View>

              <View style={styles.row}>
                {/* Card 3 */}
                <View style={[styles.card, { backgroundColor: theme.cardBg, borderColor: theme.cardBorder }]}>
                  <View style={styles.cardHeader}>
                    <SymbolView
                      name={statsCards[2].iconName as any}
                      size={14}
                      tintColor={statsCards[2].iconColor}
                      weight="bold"
                    />
                    <Text style={[styles.cardLabel, { color: theme.textSecondary }]}>{statsCards[2].title}</Text>
                  </View>
                  <View style={styles.cardContent}>
                    <Text style={[styles.cardValue, { color: theme.text }]}>{statsCards[2].value}</Text>
                    <Text
                      style={[
                        styles.cardSubtext,
                        { color: statsCards[2].subtextColor, opacity: 0.8 },
                      ]}
                    >
                      {statsCards[2].subtext}
                    </Text>
                  </View>
                </View>

                {/* Card 4 */}
                <View style={[styles.card, { backgroundColor: theme.cardBg, borderColor: theme.cardBorder }]}>
                  <View style={styles.cardHeader}>
                    <SymbolView
                      name={statsCards[3].iconName as any}
                      size={14}
                      tintColor={statsCards[3].iconColor}
                      weight="bold"
                    />
                    <Text style={[styles.cardLabel, { color: theme.textSecondary }]}>{statsCards[3].title}</Text>
                  </View>
                  <View style={styles.cardContent}>
                    <Text style={[styles.cardValue, { color: theme.text }]}>{statsCards[3].value}</Text>
                    <Text
                      style={[
                        styles.cardSubtext,
                        { color: statsCards[3].subtextColor, opacity: 0.8 },
                      ]}
                    >
                      {statsCards[3].subtext}
                    </Text>
                  </View>
                </View>
              </View>
            </View>

            {/* Fluxo de caixa */}
            <CashFlowGraph transactions={filteredTransactions} />

            {/* Distribuição por categorias */}
            <CategoriesGraph transactions={filteredTransactions} />
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 120,
    gap: 20,
  },
  title: {
    fontSize: 28,
  },
  filterContainer: {
    flexDirection: "row",
    gap: 8,
  },
  badge: {
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
    height: 38,
    justifyContent: "center",
    alignItems: "center",
  },
  badgeText: {
    fontSize: 14,
    fontWeight: "500",
    textTransform: "none",
  },
  loadingContainer: {
    alignItems: "center",
    paddingVertical: 60,
  },
  gridContainer: {
    marginTop: 8,
    gap: 16,
  },
  row: {
    flexDirection: "row",
    gap: 16,
  },
  card: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 24,
    padding: 20,
    justifyContent: "space-between",
    minHeight: 146,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  cardContent: {
    marginTop: 16,
    gap: 4,
  },
  cardLabel: {
    fontSize: 14,
    fontWeight: "500",
  },
  cardValue: {
    fontSize: 22,
    fontWeight: "700",
  },
  cardSubtext: {
    fontSize: 12,
    fontWeight: "500",
  },
});
