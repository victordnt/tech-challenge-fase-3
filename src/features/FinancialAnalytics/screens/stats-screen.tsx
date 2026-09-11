import { useColorScheme } from "@/hooks/use-color-scheme";
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
import { Colors } from "@/constants/theme";
import { useTransactions } from "@/features/TransactionsList/contexts/transactions-context";
import CashFlowGraph from "../components/CashFlowGraph";
import CategoriesGraph from "../components/CategoriesGraph";

export default function StatsScreen() {
  const colorScheme = useColorScheme();
  const validColorScheme = colorScheme === "dark" ? "dark" : "light";
  const colors = Colors[validColorScheme];
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

  // Cálculos dos 4 Cards
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
      totalSpent > 0
        ? ((topCategoryAmount / totalSpent) * 100).toFixed(0)
        : "0";

    return [
      {
        title: "Total de saídas",
        value: `R$ ${totalSpent.toFixed(2)}`,
        subtext: `${expenseCount} saídas no período`,
        subtextColor: "#FFB4AB",
        iconName: {
          ios: "arrow.down.right",
          android: "trending_down",
          web: "trending_down",
        },
        iconColor: "#FFB4AB",
      },
      {
        title: "Total de entradas",
        value: `R$ ${totalIncome.toFixed(2)}`,
        subtext: `${incomeCount} entradas no período`,
        subtextColor: "#D2BBFF",
        iconName: {
          ios: "arrow.up.right",
          android: "trending_up",
          web: "trending_up",
        },
        iconColor: "#D2BBFF",
      },
      {
        title: "Taxa de poupança",
        value: `${savingsRate.toFixed(1)}%`,
        subtext:
          totalIncome > 0 ? "do total recebido" : "sem entradas no período",
        subtextColor: "#CCC3D8",
        iconName: { ios: "piggybank", android: "savings", web: "savings" },
        iconColor: "#B9C5F2",
      },
      {
        title: "Maior gasto",
        value: topCategory,
        subtext:
          topCategoryAmount > 0
            ? `${topCategoryPercent}% dos gastos (R$ ${topCategoryAmount.toFixed(2)})`
            : "Sem saídas no período",
        subtextColor: "#CCC3D8",
        iconName: { ios: "chart.pie", android: "pie_chart", web: "pie_chart" },
        iconColor: "#FFB4A3",
      },
    ];
  }, [filteredTransactions]);

  return (
    <SafeAreaView
      style={[styles.safeArea, { backgroundColor: colors.background }]}
      edges={["left", "right"]}
    >
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Header */}
        <View style={styles.header}>
          <ThemedText type="title" style={styles.title}>
            Análises Financeiras
          </ThemedText>
          <ThemedText type="small" themeColor="textSecondary">
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
                          backgroundColor: "#7C3AED",
                          borderColor: "transparent",
                        }
                      : {
                          backgroundColor: "#272A2C",
                          borderColor: "#2E2E33",
                          borderWidth: 1,
                        },
                  ]}
                >
                  <BadgeText
                    style={[
                      styles.badgeText,
                      selectedFilter === option
                        ? { color: "#FFFFFF" }
                        : { color: "#94A3B8" },
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
            <ActivityIndicator size="large" color="#8A56FF" />
            <ThemedText
              type="small"
              style={{ color: "#94A3B8", marginTop: 12 }}
            >
              Carregando análises do Firebase...
            </ThemedText>
          </View>
        ) : (
          <>
            {/* Stats Cards Grid */}
            <View style={styles.gridContainer}>
              <View style={styles.row}>
                {/* Card 1 */}
                <View
                  style={[
                    styles.card,
                    {
                      backgroundColor: colors.backgroundElement,
                      borderColor: colors.border,
                    },
                  ]}
                >
                  <View style={styles.cardHeader}>
                    <SymbolView
                      name={statsCards[0].iconName as any}
                      size={14}
                      tintColor={statsCards[0].iconColor}
                      weight="bold"
                    />
                    <Text style={[styles.cardLabel, { color: colors.text }]}>
                      {statsCards[0].title}
                    </Text>
                  </View>
                  <View style={styles.cardContent}>
                    <Text style={[styles.cardValue, { color: colors.text }]}>
                      {statsCards[0].value}
                    </Text>
                    <Text
                      style={[
                        styles.cardSubtext,
                        { color: colors.textSecondary },
                      ]}
                    >
                      {statsCards[0].subtext}
                    </Text>
                  </View>
                </View>

                {/* Card 2 */}
                <View style={styles.card}>
                  <View style={styles.cardHeader}>
                    <SymbolView
                      name={statsCards[1].iconName as any}
                      size={14}
                      tintColor={statsCards[1].iconColor}
                      weight="bold"
                    />
                    <Text style={[styles.cardLabel, { color: colors.text }]}>
                      {statsCards[1].title}
                    </Text>
                  </View>
                  <View style={styles.cardContent}>
                    <Text style={[styles.cardValue, { color: colors.text }]}>
                      {statsCards[1].value}
                    </Text>
                    <Text
                      style={[
                        styles.cardSubtext,
                        { color: colors.textSecondary },
                      ]}
                    >
                      {statsCards[1].subtext}
                    </Text>
                  </View>
                </View>
              </View>

              <View style={styles.row}>
                {/* Card 3 */}
                <View style={styles.card}>
                  <View style={styles.cardHeader}>
                    <SymbolView
                      name={statsCards[2].iconName as any}
                      size={14}
                      tintColor={statsCards[2].iconColor}
                      weight="bold"
                    />
                    <Text style={[styles.cardLabel, { color: colors.text }]}>
                      {statsCards[2].title}
                    </Text>
                  </View>
                  <View style={styles.cardContent}>
                    <Text style={[styles.cardValue, { color: colors.text }]}>
                      {statsCards[2].value}
                    </Text>
                    <Text
                      style={[
                        styles.cardSubtext,
                        { color: colors.textSecondary, opacity: 0.7 },
                      ]}
                    >
                      {statsCards[2].subtext}
                    </Text>
                  </View>
                </View>

                {/* Card 4 */}
                <View style={styles.card}>
                  <View style={styles.cardHeader}>
                    <SymbolView
                      name={statsCards[3].iconName as any}
                      size={14}
                      tintColor={statsCards[3].iconColor}
                      weight="bold"
                    />
                    <Text style={[styles.cardLabel, { color: colors.text }]}>
                      {statsCards[3].title}
                    </Text>
                  </View>
                  <View style={styles.cardContent}>
                    <Text style={[styles.cardValue, { color: colors.text }]}>
                      {statsCards[3].value}
                    </Text>
                    <Text
                      style={[
                        styles.cardSubtext,
                        { color: colors.textSecondary, opacity: 0.7 },
                      ]}
                    >
                      {statsCards[3].subtext}
                    </Text>
                  </View>
                </View>
              </View>
            </View>

            {/* Fluxo de Caixa */}
            <CashFlowGraph transactions={filteredTransactions} />

            {/* Distribuição por Categorias */}
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
  header: {
    gap: 4,
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
    minWidth: 0,
    flex: 1,
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: 24,
    padding: 16,
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
    flexShrink: 1,
    fontSize: 14,
    fontWeight: "500",
    color: "#CCC3D8",
  },
  cardValue: {
    fontSize: 18,
    fontWeight: "700",
    color: "#E0E3E5",
  },
  cardSubtext: {
    fontSize: 12,
    fontWeight: "500",
  },
});
