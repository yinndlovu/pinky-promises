import React from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from "react-native";
import { Feather } from "@expo/vector-icons";
import type { StackScreenProps } from '@react-navigation/stack';

type SettingsScreenProps = StackScreenProps<any, any>;

const SettingsScreen: React.FC<SettingsScreenProps> = ({ navigation }) => {
  const settingsOptions = [
    {
      label: "Change email",
      icon: "mail",
      onPress: () => navigation.navigate("ChangeEmail"),
    },
    {
      label: "Change password",
      icon: "lock",
      onPress: () => { },
    },
    {
      label: "Notifications",
      icon: "bell",
      onPress: () => { },
    },
    {
      label: "About",
      icon: "info",
      onPress: () => { },
    },
  ];

  return (
    <View style={{ flex: 1, backgroundColor: "#23243a" }}>
      <ScrollView
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.headerTitle}>Settings</Text>
        <View style={styles.optionsWrapper}>
          {settingsOptions.map((option, idx) => (
            <TouchableOpacity
              key={option.label}
              style={styles.optionRow}
              onPress={option.onPress}
              activeOpacity={0.7}
            >
              <Feather name={option.icon as any} size={20} color="#e03487" style={styles.optionIcon} />
              <Text style={styles.optionLabel}>{option.label}</Text>
              <Feather name="chevron-right" size={20} color="#b0b3c6" style={styles.chevron} />
            </TouchableOpacity>
          ))}
        </View>
        <TouchableOpacity
          style={styles.logoutButton}
          onPress={() => Alert.alert("Log out", "Are you sure you want to log out?", [
            { text: "Cancel", style: "cancel" },
            { text: "Log out", style: "destructive", onPress: () => {/* handle logout */ } },
          ])}
        >
          <Feather name="log-out" size={20} color="#fff" style={styles.optionIcon} />
          <Text style={styles.logoutText}>Log out</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingTop: 60,
    paddingBottom: 32,
    alignItems: "stretch",
    backgroundColor: "#23243a",
    minHeight: "100%",
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#fff",
    letterSpacing: 1,
    alignSelf: "center",
    marginBottom: 36,
  },
  optionsWrapper: {
    backgroundColor: "#1b1c2e",
    borderRadius: 16,
    paddingVertical: 8,
    marginBottom: 32,
    width: "100%",
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },
  optionRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 18,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#23243a",
  },
  optionIcon: {
    marginRight: 16,
  },
  optionLabel: {
    color: "#fff",
    fontSize: 16,
    flex: 1,
    fontWeight: "500",
  },
  chevron: {
    marginLeft: 8,
  },
  logoutButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#e03487",
    borderRadius: 8,
    paddingVertical: 14,
    paddingHorizontal: 24,
    alignSelf: "center",
    marginTop: 8,
  },
  logoutText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
    marginLeft: 10,
    letterSpacing: 1,
  },
});

export default SettingsScreen;
