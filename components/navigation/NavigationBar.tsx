import React from "react";
import { View, TouchableOpacity, Text, StyleSheet } from "react-native";
import { Feather } from "@expo/vector-icons";
import type {
  NavigationHelpers,
  ParamListBase,
} from "@react-navigation/native";
import type { BottomTabNavigationEventMap } from "@react-navigation/bottom-tabs";
import { SafeAreaView } from "react-native-safe-area-context";

// Feather icon names used
const NAV_ITEMS = [
  { name: "Home", icon: "home" as const },
  { name: "Gifts", icon: "gift" as const },
  { name: "Feed", icon: "rss" as const },
  { name: "Profile", icon: "user" as const },
];

type NavItem = (typeof NAV_ITEMS)[number]["name"];

type Props = {
  navigation: NavigationHelpers<ParamListBase, BottomTabNavigationEventMap>;
  currentRoute: NavItem;
};

const ACTIVE_COLOR = "#e03487";
const INACTIVE_COLOR = "#b0b3c6";

export default function NavigationBar({ navigation, currentRoute }: Props) {
  return (
    <SafeAreaView edges={["bottom"]} style={{ backgroundColor: "#23243a" }}>
      <View style={styles.container}>
        {NAV_ITEMS.map((item) => {
          const isActive = currentRoute === item.name;
          return (
            <TouchableOpacity
              key={item.name}
              style={styles.tab}
              onPress={() => navigation.navigate(item.name)}
              activeOpacity={0.7}
            >
              <Feather
                name={item.icon}
                size={26}
                color={isActive ? ACTIVE_COLOR : INACTIVE_COLOR}
              />
              <Text
                style={[
                  styles.label,
                  { color: isActive ? ACTIVE_COLOR : INACTIVE_COLOR },
                ]}
              >
                {item.name}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    backgroundColor: "#23243a",
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: "rgba(255,255,255,0.05)",
  },
  tab: {
    flex: 1,
    alignItems: "center",
  },
  label: {
    fontSize: 12,
    marginTop: 2,
    fontWeight: "bold",
  },
});
