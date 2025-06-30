import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import type { StackScreenProps } from "@react-navigation/stack";
import { useAuth } from "../../contexts/AuthContext";
import LogoutModal from "../../components/modals/LogoutModal";

type SettingsScreenProps = StackScreenProps<any, any>;

const SettingsScreen: React.FC<SettingsScreenProps> = ({
  navigation,
  route,
}) => {
  const [success, setSuccess] = useState<string | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const { logout } = useAuth();

  const handleLogout = async () => {
    setShowLogoutModal(false);
    await logout();
    navigation.reset({
      index: 0,
      routes: [{ name: "Welcome" }],
    });
  };

  useEffect(() => {
    const unsubscribe = navigation.addListener("focus", () => {
      if (route.params?.passwordChanged) {
        setSuccess("Password changed successfully!");
        navigation.setParams({ passwordChanged: undefined });
      }
      if (route.params?.emailChanged) {
        setSuccess("Email address updated successfully!");
        navigation.setParams({ emailChanged: undefined });
      }
    });

    return unsubscribe;
  }, [navigation, route.params]);

  useEffect(() => {
    if (success) {
      setShowSuccess(true);
      const timer = setTimeout(() => {
        setShowSuccess(false);
        setSuccess(null);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [success]);

  const settingsOptions = [
    {
      label: "Change email",
      icon: "mail",
      onPress: () => navigation.navigate("ChangeEmail"),
    },
    {
      label: "Change password",
      icon: "lock",
      onPress: () => navigation.navigate("ChangePassword"),
    },
    {
      label: "Notifications",
      icon: "bell",
      onPress: () => {},
    },
    {
      label: "About",
      icon: "info",
      onPress: () => {},
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
              <Feather
                name={option.icon as any}
                size={20}
                color="#e03487"
                style={styles.optionIcon}
              />
              <Text style={styles.optionLabel}>{option.label}</Text>
              <Feather
                name="chevron-right"
                size={20}
                color="#b0b3c6"
                style={styles.chevron}
              />
            </TouchableOpacity>
          ))}
        </View>
        <TouchableOpacity
          style={styles.logoutButton}
          onPress={() => setShowLogoutModal(true)}
          activeOpacity={0.8}
        >
          <Feather
            name="log-out"
            size={20}
            color="#fff"
            style={styles.optionIcon}
          />
          <Text style={styles.logoutText}>Log out</Text>
        </TouchableOpacity>
      </ScrollView>
      {showSuccess && (
        <View style={[styles.toast, { backgroundColor: "#4caf50" }]}>
          <Text style={styles.toastText}>{success}</Text>
        </View>
      )}

      <LogoutModal
        visible={showLogoutModal}
        onClose={() => setShowLogoutModal(false)}
        onConfirm={handleLogout}
      />
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
  toast: {
    position: "absolute",
    top: StatusBar.currentHeight ? StatusBar.currentHeight + 10 : 50,
    left: 20,
    right: 20,
    backgroundColor: "#e03487",
    padding: 14,
    borderRadius: 10,
    alignItems: "center",
    zIndex: 100,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
  },
  toastText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
});

export default SettingsScreen;
