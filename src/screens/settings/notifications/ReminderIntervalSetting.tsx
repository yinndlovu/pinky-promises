// external
import { useEffect, useState, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";

// internal
import {
  getReminderInterval,
  setReminderInterval,
} from "../../../services/api/settings/notificationPreferenceService";
import useToken from "../../../hooks/useToken";
import { AlertType } from "../../../types/Alert";
import { useTheme } from "../../../theme/ThemeContext";

// content
import AlertModal from "../../../components/modals/output/AlertModal";

const ReminderIntervalSetting = () => {
  // use states
  const [interval, setInterval] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");
  const [alertTitle, setAlertTitle] = useState("");
  const [alertType, setAlertType] = useState<AlertType | undefined>(undefined);

  // variables
  const token = useToken();
  const { theme } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);

  // use effects
  useEffect(() => {
    fetchInterval();
  }, [token]);

  // fetch functions
  const fetchInterval = async () => {
    setLoading(true);
    setError(null);
    try {
      const hours = await getReminderInterval(token);
      setInterval(hours ? String(hours) : "");
    } catch (e: any) {
      setError(e.response?.data?.error || "Failed to load reminder interval.");
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

      await setReminderInterval(token, hours);
      setAlertTitle("Reminder interval updated");
      setAlertMessage("You have updated your reminder interval.");
      setAlertType("success");
      setAlertVisible(true);
      await fetchInterval();
    } catch (e: any) {
      setAlertTitle("Failed");
      setAlertMessage(e.response?.data?.error || "Failed to save interval.");
      setAlertType("error");
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
        <ActivityIndicator color={theme.colors.accent} style={{ marginVertical: 16 }} />
      ) : (
        <View style={styles.inputRow}>
          <TextInput
            style={styles.input}
            value={interval}
            onChangeText={setInterval}
            keyboardType="numeric"
            placeholder="e.g. 6"
            placeholderTextColor={theme.colors.muted}
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
        title={alertTitle}
        type={alertType}
        message={alertMessage}
        onClose={() => setAlertVisible(false)}
      />
      {error && <Text style={styles.error}>{error}</Text>}
      {success && <Text style={styles.success}>Saved!</Text>}
    </View>
  );
};

const createStyles = (theme: ReturnType<typeof useTheme>["theme"]) =>
  StyleSheet.create({
    wrapper: {
      backgroundColor: theme.colors.surfaceAlt,
      borderRadius: 16,
      padding: 20,
      marginTop: 32,
      marginBottom: 100,
      shadowColor: theme.colors.shadow,
      shadowOpacity: 0.08,
      shadowRadius: 8,
      elevation: 2,
    },
    title: {
      color: theme.colors.text,
      fontSize: 16,
      fontWeight: "bold",
      marginBottom: 6,
    },
    description: {
      color: theme.colors.muted,
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
      backgroundColor: theme.colors.surface,
      color: theme.colors.text,
      borderRadius: 8,
      borderWidth: 1,
      borderColor: theme.colors.muted,
      padding: 10,
      fontSize: 16,
      marginRight: 8,
    },
    unit: {
      color: theme.colors.muted,
      fontSize: 15,
      marginRight: 12,
    },
    saveButton: {
      backgroundColor: theme.colors.primary,
      borderRadius: 8,
      paddingVertical: 8,
      paddingHorizontal: 18,
      alignItems: "center",
      justifyContent: "center",
    },
    saveButtonText: {
      color: theme.colors.text,
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
