// external
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  Switch,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  StatusBar,
  KeyboardAvoidingView,
  Platform,
  Modal,
} from "react-native";
import { useQueryClient } from "@tanstack/react-query";

// internal
import {
  NOTIFICATION_TYPES,
  setNotificationPreference,
} from "../../../services/api/settings/notificationPreferenceService";
import { useAuth } from "../../../contexts/AuthContext";
import useToken from "../../../hooks/useToken";
import { useNotificationPrefs } from "../../../hooks/useNotificationPrefs";

// screen content
import ReminderIntervalSetting from "./ReminderIntervalSetting";
import LoadingSpinner from "../../../components/loading/LoadingSpinner";

const NotificationsScreen = () => {
  // variables
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const token = useToken();

  // use states
  const [updating, setUpdating] = useState<{ [key: string]: boolean }>({});
  const [error, setError] = useState<string | null>(null);
  const [showError, setShowError] = useState(false);
  const [localPreferences, setLocalPreferences] = useState<{
    [key: string]: boolean;
  }>({});

  // variables
  const isAnyUpdating = Object.values(updating).some(Boolean);

  // data
  const { data: preferences = {}, isLoading: preferencesLoading } =
    useNotificationPrefs(user?.id, token);

  // handlers
  const handleToggle = async (type: string, value: boolean) => {
    setUpdating((prev) => ({ ...prev, [type]: true }));
    try {
      await setNotificationPreference(token, type, value);

      setLocalPreferences((prev) => ({ ...prev, [type]: value }));

      queryClient.invalidateQueries({
        queryKey: ["notificationPreferences", user?.id],
      });
    } catch (e: any) {
      setError(e.response?.data?.error || "Failed to update notification");
    }

    setUpdating((prev) => ({ ...prev, [type]: false }));
  };

  // use effects
  useEffect(() => {
    if (error) {
      setShowError(true);
      const timer = setTimeout(() => {
        setShowError(false);
        setError(null);
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  useEffect(() => {
    setLocalPreferences((prev) => {
      const prevKeys = Object.keys(prev);
      const newKeys = Object.keys(preferences);
      if (
        prevKeys.length !== newKeys.length ||
        newKeys.some((key) => prev[key] !== preferences[key])
      ) {
        return preferences;
      }
      return prev;
    });
  }, [preferences]);

  if (preferencesLoading) {
    return (
      <View style={styles.centered}>
        <LoadingSpinner showMessage={false} size="medium" />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 80 : 100}
    >
      <View style={{ flex: 1, backgroundColor: "#23243a" }}>
        <ScrollView
          contentContainerStyle={styles.container}
          showsVerticalScrollIndicator={false}
        >
          <Text style={styles.header}>Notification preferences</Text>
          {NOTIFICATION_TYPES.map(({ key, label, description }, idx) => (
            <View
              key={key}
              style={[
                styles.row,
                idx === NOTIFICATION_TYPES.length - 1 && {
                  borderBottomWidth: 0,
                },
              ]}
            >
              <View style={{ flex: 1 }}>
                <Text style={styles.label}>{label}</Text>
                <Text style={styles.description}>{description}</Text>
              </View>
              <Switch
                value={!!localPreferences[key]}
                onValueChange={(val) => handleToggle(key, val)}
                disabled={updating[key]}
                trackColor={{ false: "#767577", true: "#e03487" }}
                thumbColor={localPreferences[key] ? "#fff" : "#b0b3c6"}
              />
            </View>
          ))}
          <ReminderIntervalSetting />
        </ScrollView>
        <Modal
          visible={isAnyUpdating}
          transparent
          animationType="fade"
          onRequestClose={() => {}}
        >
          <View style={styles.loadingOverlay}>
            <ActivityIndicator size="large" color="#e03487" />
          </View>
        </Modal>
        {showError && (
          <View style={styles.toast}>
            <Text style={styles.toastText}>{error}</Text>
          </View>
        )}
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#23243a",
    padding: 20,
  },
  header: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 20,
    color: "#fff",
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 16,
    borderBottomWidth: 0.7,
    borderColor: "#333",
  },
  label: {
    fontSize: 16,
    color: "#e8e8eb",
    fontWeight: "bold",
  },
  description: {
    color: "#b0b3c6",
    fontSize: 13,
    marginTop: 2,
    marginBottom: 0,
    fontWeight: "400",
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
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
  loadingOverlay: {
    flex: 1,
    backgroundColor: "rgba(35,36,58,0.7)",
    justifyContent: "center",
    alignItems: "center",
  },
});

export default NotificationsScreen;
