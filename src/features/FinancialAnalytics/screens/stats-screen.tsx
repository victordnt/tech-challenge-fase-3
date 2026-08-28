import {
  StyleSheet,
  ScrollView,
  View,
  useColorScheme,
  TouchableOpacity,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { ThemedText } from "@/components/themed-text";
import { Colors } from "@/constants/theme";
import { useState } from "react";
import {
  Badge,
  BadgeText,
  HStack,
  VStack,
  Text,
  Card,
} from "@gluestack-ui/themed";
import { SymbolView } from "expo-symbols";
import { cardData } from "../schemas/MockStats";
import CashFlowGraph from "../components/CashFlowGraph";
import CategoriesGraph from "../components/CategoriesGraph";

export default function StatsScreen() {
  const colorScheme = useColorScheme();
  const validColorScheme = colorScheme === "dark" ? "dark" : "light";
  const colors = Colors[validColorScheme];
  const [selectedFilter, setSelectedFilter] = useState("All");
  const filterOptions = ["Week", "Month", "Year"];

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
            Análises financeiras
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
                    {option === "Week" ? "Week" : option}
                  </BadgeText>
                </Badge>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Stats Cards Grid */}
        <VStack style={styles.gridContainer}>
          <HStack style={styles.row}>
            {/* Card 1 */}
            <Card style={styles.card}>
              <HStack style={styles.cardHeader}>
                <SymbolView
                  name={cardData[0].iconName as any}
                  size={14}
                  tintColor={cardData[0].iconColor}
                  weight="bold"
                />
                <Text style={styles.cardLabel}>{cardData[0].title}</Text>
              </HStack>
              <View style={styles.cardContent}>
                <Text style={styles.cardValue}>{cardData[0].value}</Text>
                <Text
                  style={[
                    styles.cardSubtext,
                    { color: cardData[0].subtextColor },
                  ]}
                >
                  {cardData[0].subtext}
                </Text>
              </View>
            </Card>

            {/* Card 2 */}
            <Card style={styles.card}>
              <HStack style={styles.cardHeader}>
                <SymbolView
                  name={cardData[1].iconName as any}
                  size={14}
                  tintColor={cardData[1].iconColor}
                  weight="bold"
                />
                <Text style={styles.cardLabel}>{cardData[1].title}</Text>
              </HStack>
              <View style={styles.cardContent}>
                <Text style={styles.cardValue}>{cardData[1].value}</Text>
                <Text
                  style={[
                    styles.cardSubtext,
                    { color: cardData[1].subtextColor },
                  ]}
                >
                  {cardData[1].subtext}
                </Text>
              </View>
            </Card>
          </HStack>

          <HStack style={styles.row}>
            {/* Card 3 */}
            <Card style={styles.card}>
              <HStack style={styles.cardHeader}>
                <SymbolView
                  name={cardData[2].iconName as any}
                  size={14}
                  tintColor={cardData[2].iconColor}
                  weight="bold"
                />
                <Text style={styles.cardLabel}>{cardData[2].title}</Text>
              </HStack>
              <View style={styles.cardContent}>
                <Text style={styles.cardValue}>{cardData[2].value}</Text>
                <Text
                  style={[
                    styles.cardSubtext,
                    { color: cardData[2].subtextColor, opacity: 0.7 },
                  ]}
                >
                  {cardData[2].subtext}
                </Text>
              </View>
            </Card>

            {/* Card 4 */}
            <Card style={styles.card}>
              <HStack style={styles.cardHeader}>
                <SymbolView
                  name={cardData[3].iconName as any}
                  size={14}
                  tintColor={cardData[3].iconColor}
                  weight="bold"
                />
                <Text style={styles.cardLabel}>{cardData[3].title}</Text>
              </HStack>
              <View style={styles.cardContent}>
                <Text style={styles.cardValue}>{cardData[3].value}</Text>
                <Text
                  style={[
                    styles.cardSubtext,
                    { color: cardData[3].subtextColor, opacity: 0.7 },
                  ]}
                >
                  {cardData[3].subtext}
                </Text>
              </View>
            </Card>
          </HStack>
        </VStack>

        <CashFlowGraph />

        {/* Categories Card */}
        <CategoriesGraph />
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
    backgroundColor: "rgba(255, 255, 255, 0.03)",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.08)",
    borderRadius: 24,
    padding: 20,
    justifyContent: "space-between",
    minHeight: 146,
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.35,
    shadowRadius: 20,
    elevation: 6,
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
  iconContainer: {
    width: 28,
    height: 28,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  cardLabel: {
    fontSize: 14,
    fontWeight: "500",
    color: "#CCC3D8",
  },
  cardValue: {
    fontSize: 28,
    fontWeight: "700",
    color: "#E0E3E5",
  },
  cardSubtext: {
    fontSize: 13,
    fontWeight: "500",
  },
  largeCard: {
    width: "100%",
    justifyContent: "flex-start",
    minHeight: "auto",
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
  barChartContainer: {
    width: "100%",
    alignItems: "center",
    opacity: 0.7,
  },
  weekLabelsContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    width: "100%",
    paddingLeft: 45,
    paddingRight: 10,
    marginTop: 8,
  },
  xAxisLabel: {
    fontSize: 11,
    color: "#CCC3D8",
    width: 50,
    textAlign: "center",
  },
  legendContainer: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 20,
    marginTop: 20,
    borderTopWidth: 1,
    borderTopColor: "rgba(255, 255, 255, 0.05)",
    paddingTop: 16,
    width: "100%",
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  legendText: {
    fontSize: 12,
    color: "#CCC3D8",
    fontWeight: "500",
  },
  donutContainer: {
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
    marginVertical: 12,
  },
  categoriesList: {
    gap: 14,
    marginTop: 16,
  },
  categoryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 4,
  },
  categoryLeft: {
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
    fontSize: 14,
    fontWeight: "500",
    color: "#E0E3E5",
  },
  categoryValue: {
    fontSize: 14,
    fontWeight: "600",
    color: "#CCC3D8",
  },
});
