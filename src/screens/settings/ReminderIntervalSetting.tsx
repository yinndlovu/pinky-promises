// external
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

// internal
import {
  getReminderInterval,
  setReminderInterval,
} from "../../services/notificationPreferenceService";

// content
import AlertModal from "../../components/modals/AlertModal";

const ReminderIntervalSetting = () => {
  // use states
  const [interval, setInterval] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");

  // use effects
  useEffect(() => {
    fetchInterval();
  }, []);

  // fetch functions
  const fetchInterval = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = await AsyncStorage.getItem("token");

      if (!token) {
        setError("Session expired, please log in again");
        setSaving(false);
        return;
      }

      const hours = await getReminderInterval(token);
      setInterval(hours ? String(hours) : "");
    } catch (e: any) {
      setError(e.message || "Failed to load reminder interval.");
    }
    setLoading(false);
  };

  // handlers
  const handleSave = async () => {
    setSaving(true);
    setError(null);
    setSuccess(false);

    try {
      const hours = Number(interval);

      if (isNaN(hours) || hours < 1) {
        setError("Please enter a valid positive number");
        setSaving(false);
        return;
      }

      const token = await AsyncStorage.getItem("token");

      if (!token) {
        setError("Session expired, please log in again");
        setSaving(false);
        return;
      }

      await setReminderInterval(token, hours);
      setAlertMessage("Reminder interval updated");
      setAlertVisible(true);
      await fetchInterval();
    } catch (e: any) {
      setAlertMessage("Failed to save interval");
      setAlertVisible(true);
    }
    setSaving(false);
  };

  return (
    <View style={styles.wrapper}>
      <Text style={styles.title}>Reminder interval</Text>
      <Text style={styles.description}>
        Set how often you want to receive reminder notifications (in hours)
      </Text>
      {loading ? (
        <ActivityIndicator color="#e03487" style={{ marginVertical: 16 }} />
      ) : (
        <View style={styles.inputRow}>
          <TextInput
            style={styles.input}
            value={interval}
            onChangeText={setInterval}
            keyboardType="numeric"
            placeholder="e.g. 6"
            placeholderTextColor="#b0b3c6"
            editable={!saving}
          />
          <Text style={styles.unit}>hours</Text>
          <TouchableOpacity
            style={styles.saveButton}
            onPress={handleSave}
            disabled={saving}
            activeOpacity={0.7}
          >
            <Text style={styles.saveButtonText}>
              {saving ? "Saving..." : "Save"}
            </Text>
          </TouchableOpacity>
        </View>
      )}
      <AlertModal
        visible={alertVisible}
        message={alertMessage}
        onClose={() => setAlertVisible(false)}
      />
      {error && <Text style={styles.error}>{error}</Text>}
      {success && <Text style={styles.success}>Saved!</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    backgroundColor: "#1b1c2e",
    borderRadius: 16,
    padding: 20,
    marginTop: 32,
    marginBottom: 100,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },
  title: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 6,
  },
  description: {
    color: "#b0b3c6",
    fontSize: 13,
    marginBottom: 14,
  },
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },
  input: {
    flex: 1,
    backgroundColor: "rgba(255,255,255,0.05)",
    color: "#fff",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#b0b3c6",
    padding: 10,
    fontSize: 16,
    marginRight: 8,
  },
  unit: {
    color: "#b0b3c6",
    fontSize: 15,
    marginRight: 12,
  },
  saveButton: {
    backgroundColor: "#e03487",
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  saveButtonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 15,
  },
  error: {
    color: "#f44336",
    marginTop: 8,
    fontSize: 13,
  },
  success: {
    color: "#4caf50",
    marginTop: 8,
    fontSize: 13,
  },
});

export default ReminderIntervalSetting;
