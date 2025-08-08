// external
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Pressable,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import type { StackScreenProps } from "@react-navigation/stack";

// internal
import { useAuth } from "../../contexts/AuthContext";
import LogoutModal from "../../components/modals/selection/LogoutModal";

// types
type SettingsScreenProps = StackScreenProps<any, any>;

const SettingsScreen: React.FC<SettingsScreenProps> = ({
  navigation,
  route,
}) => {
  const [success, setSuccess] = useState<string | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const { logout } = useAuth();

  // handlers
  const handleLogout = async () => {
    setShowLogoutModal(false);
    await logout();
    navigation.reset({
      index: 0,
      routes: [{ name: "Welcome" }],
    });
  };

  // use effects
  useEffect(() => {
    const unsubscribe = navigation.addListener("focus", () => {
      if (route.params?.emailChanged) {
        setSuccess("Email address updated");
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
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [success]);

  // options
  const settingsOptions = [
    {
      label: "Account",
      icon: "user",
      onPress: () => navigation.navigate("AccountScreen"),
    },
    {
      label: "Notifications",
      icon: "bell",
      onPress: () => navigation.navigate("NotificationsScreen"),
    },
    {
      label: "About",
      icon: "info",
      onPress: () => navigation.navigate("AboutScreen"),
    },
  ];

  return (
    <View style={{ flex: 1, backgroundColor: "#23243a" }}>
      <ScrollView
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.optionsWrapper}>
          {settingsOptions.map((option, idx) => (
            <Pressable
              key={option.label}
              style={styles.optionRow}
              onPress={option.onPress}
              android_ripple={{ color: "#282942ff" }}
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
            </Pressable>
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
    paddingTop: 18,
    paddingBottom: 32,
    alignItems: "stretch",
    backgroundColor: "#23243a",
    minHeight: "100%",
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
