import { useColorScheme } from "@/hooks/use-color-scheme";
import React from "react";
import { StyleSheet, TouchableOpacity, View, Platform } from "react-native";
import { SymbolView } from "expo-symbols";

import { Colors } from "@/constants/theme";

export function FloatingNavbar({ state, descriptors, navigation }: any) {
  const colorScheme = useColorScheme();
  const validColorScheme = colorScheme === "dark" ? "dark" : "light";
  const colors = Colors[validColorScheme];

  // Mapeamento de ícones para cada aba
  const getIconName = (routeName: string, isFocused: boolean) => {
    switch (routeName) {
      case "index":
        return {
          ios: isFocused ? "house.fill" : "house",
          android: "home",
          web: "home",
        };
      case "wallet":
        return {
          ios: isFocused ? "creditcard.fill" : "creditcard",
          android: "credit_card",
          web: "credit_card",
        };
      case "stats":
        return {
          ios: isFocused ? "chart.bar.fill" : "chart.bar",
          android: "bar_chart",
          web: "bar_chart",
        };
      case "profile":
        return {
          ios: isFocused ? "person.fill" : "person",
          android: "person",
          web: "person",
        };
      default:
        return {
          ios: "questionmark",
          android: "help",
          web: "help",
        };
    }
  };

  return (
    <View
      style={[
        styles.navbarContainer,
        {
          backgroundColor: "#111116", // Dark bar in both themes as requested in screenshot
          shadowColor: colors.shadow,
        },
      ]}
    >
      {state.routes.map((route: any, index: number) => {
        const { options } = descriptors[route.key];
        const isFocused = state.index === index;

        const onPress = () => {
          const event = navigation.emit({
            type: "tabPress",
            target: route.key,
            canPreventDefault: true,
          });

          if (!isFocused && !event.defaultPrevented) {
            navigation.navigate(route.name, route.params);
          }
        };

        const onLongPress = () => {
          navigation.emit({
            type: "tabLongPress",
            target: route.key,
          });
        };

        const iconSymbol = getIconName(route.name, isFocused);

        // No screenshot, active tab has a light lilac background circle and a dark purple icon.
        // Inactive tabs have simple outlined light gray icons.
        return (
          <TouchableOpacity
            key={route.key}
            accessibilityRole="button"
            accessibilityState={isFocused ? { selected: true } : {}}
            accessibilityLabel={options.tabBarAccessibilityLabel}
            testID={options.tabBarTestID}
            onPress={onPress}
            onLongPress={onLongPress}
            activeOpacity={0.8}
            style={styles.tabButton}
          >
            {isFocused ? (
              <View
                style={[styles.activeCircle, { backgroundColor: "#D8B4FE" }]}
              >
                <SymbolView
                  name={iconSymbol as any}
                  size={24}
                  weight="bold"
                  tintColor="#5B21B6" // Dark purple icon
                />
              </View>
            ) : (
              <SymbolView
                name={iconSymbol as any}
                size={24}
                weight="medium"
                tintColor="#9CA3AF" // Muted light gray icon
              />
            )}
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  navbarContainer: {
    position: "absolute",
    bottom: Platform.OS === "ios" ? 34 : 24,
    left: 24,
    right: 24,
    height: 72,
    borderRadius: 36,
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: "#272730",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.35,
    shadowRadius: 15,
    elevation: 10,
  },
  tabButton: {
    flex: 1,
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  activeCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#C084FC",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 6,
  },
});
