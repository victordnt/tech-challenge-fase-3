import { useTheme } from "@/hooks/use-theme";
import type { Transaction } from "@/features/TransactionsList/types/finance";
import React, { useMemo } from "react";
import { StyleSheet, Text, View } from "react-native";
import Svg, { Circle, G } from "react-native-svg";

interface CategoriesGraphProps {
  transactions?: Transaction[];
}

const CATEGORY_COLORS = [
  "#D2BBFF",
  "#FFB4AB",
  "#B9C5F2",
  "#FFB4A3",
  "#A7F3D0",
  "#FDE68A",
  "#C4B5FD",
];

export default function CategoriesGraph({
  transactions = [],
}: CategoriesGraphProps) {
  const theme = useTheme();
  const { categoryList, totalExpense } = useMemo(() => {
    let total = 0;
    const totals: { [cat: string]: number } = {};

    transactions.forEach((t) => {
      if (t.type === "expense") {
        const amt = Number(t.amount) || 0;
        total += amt;
        totals[t.category] = (totals[t.category] || 0) + amt;
      }
    });

    const list = Object.entries(totals)
      .map(([name, amount], index) => {
        const percentage = total > 0 ? (amount / total) * 100 : 0;
        return {
          name,
          amount,
          percentage,
          color: CATEGORY_COLORS[index % CATEGORY_COLORS.length],
        };
      })
      .sort((a, b) => b.amount - a.amount);

    return { categoryList: list, totalExpense: total };
  }, [transactions]);

  const circumference = 314.16;

  const donutArcs = useMemo(() => {
    let currentOffset = 0;
    const arcs = [];
    for (const cat of categoryList) {
      const arcLength = (cat.percentage / 100) * circumference;
      const strokeDasharray = `${arcLength.toFixed(2)} ${circumference.toFixed(2)}`;
      const strokeDashoffset = `-${currentOffset.toFixed(2)}`;
      currentOffset += arcLength;

      arcs.push({
        ...cat,
        strokeDasharray,
        strokeDashoffset,
      });
    }
    return arcs;
  }, [categoryList, circumference]);

  return (
    <View
      style={[
        styles.card,
        styles.largeCard,
        { backgroundColor: theme.backgroundElement, borderColor: theme.border },
      ]}
    >
      <View style={styles.chartHeader}>
        <Text style={[styles.chartTitle, { color: theme.text }]}>
          Categorias de saída
        </Text>
      </View>

      <View style={styles.donutContainer}>
        <Svg width={160} height={160} viewBox="0 0 160 160">
          <Circle
            cx="80"
            cy="80"
            r="50"
            stroke="rgba(255, 255, 255, 0.05)"
            strokeWidth="12"
            fill="none"
          />

          {donutArcs.length > 0 && (
            <G transform="rotate(-90 80 80)">
              {donutArcs.map((arc) => (
                <Circle
                  key={arc.name}
                  cx="80"
                  cy="80"
                  r="50"
                  stroke={arc.color}
                  strokeWidth="12"
                  strokeDasharray={arc.strokeDasharray}
                  strokeDashoffset={arc.strokeDashoffset}
                  fill="none"
                />
              ))}
            </G>
          )}
        </Svg>

        {/* Overlay do Texto perfeitamente centralizado via Flexbox nativo */}
        <View style={styles.donutCenterOverlay} pointerEvents="none">
          <Text style={[styles.donutLabel, { color: theme.text }]}>
            Total saídas
          </Text>
          <Text style={[styles.donutValue, { color: theme.text }]}>
            R${" "}
            {totalExpense >= 1000
              ? `${(totalExpense / 1000).toFixed(1)}k`
              : totalExpense.toFixed(2)}
          </Text>
        </View>
      </View>

      {/* Dynamic Categories List */}
      <View style={styles.categoriesList}>
        {categoryList.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={{ color: "#94A3B8", fontSize: 13 }}>
              Nenhuma saída registrada no período
            </Text>
          </View>
        ) : (
          categoryList.map((cat) => (
            <View key={cat.name} style={styles.categoryRow}>
              <View style={styles.categoryLeft}>
                <View
                  style={[
                    styles.categoryColorDot,
                    {
                      backgroundColor: cat.color,
                      shadowColor: cat.color,
                      shadowOffset: { width: 0, height: 0 },
                      shadowOpacity: 0.8,
                      shadowRadius: 6,
                    },
                  ]}
                />
                <Text style={[styles.categoryName, { color: theme.text }]}>
                  {cat.name}
                </Text>
              </View>
              <Text style={[styles.categoryValue, { color: theme.text }]}>
                {cat.percentage.toFixed(1)}% (R$ {cat.amount.toFixed(2)})
              </Text>
            </View>
          ))
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: 24,
    padding: 20,
    justifyContent: "space-between",
    minHeight: 146,
  },
  largeCard: {
    width: "100%",
    justifyContent: "flex-start",
  },
  chartHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  chartTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#E0E3E5",
  },
  donutContainer: {
    width: 160,
    height: 160,
    alignItems: "center",
    justifyContent: "center",
    alignSelf: "center",
    position: "relative",
    marginVertical: 12,
  },
  donutCenterOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
  },
  donutLabel: {
    fontSize: 12,
    fontWeight: "500",
    color: "#CCC3D8",
    textAlign: "center",
  },
  donutValue: {
    fontSize: 18,
    fontWeight: "700",
    color: "#E0E3E5",
    textAlign: "center",
  },
  categoriesList: {
    gap: 14,
    marginTop: 16,
  },
  categoryRow: {
    flexWrap: "wrap",
    gap: 6,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 4,
  },
  categoryLeft: {
    flexShrink: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  categoryColorDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  categoryName: {
    flexShrink: 1,
    fontSize: 14,
    fontWeight: "500",
    color: "#E0E3E5",
  },
  categoryValue: {
    fontSize: 13,
    fontWeight: "600",
    color: "#CCC3D8",
  },
  emptyContainer: {
    alignItems: "center",
    paddingVertical: 12,
  },
});
