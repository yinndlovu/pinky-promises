// external
import React, { useState, useEffect, useMemo } from "react";
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Platform,
} from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import { Feather } from "@expo/vector-icons";

// content
import AlertModal from "../output/AlertModal";

// internal
import { useTheme } from "../../../theme/ThemeContext";
import { formatDate } from "../../../helpers/favoriteMemoryModalHelper";

// types
type Props = {
  visible: boolean;
  onClose: () => void;
  onSave: (memory: string, date: string) => Promise<void>;
  initialMemory?: string;
  initialDate?: string;
  isEditing?: boolean;
  loading?: boolean;
};

const UpdateFavoriteMemoryModal: React.FC<Props> = ({
  visible,
  onClose,
  onSave,
  initialMemory = "",
  initialDate = "",
  isEditing = false,
  loading = false,
}) => {
  // variables
  const { theme } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);

  // use states
  const [memory, setMemory] = useState(initialMemory);
  const [date, setDate] = useState<Date>(
    initialDate ? new Date(initialDate) : new Date()
  );
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showSuccessAlert, setShowSuccessAlert] = useState(false);
  const [showErrorAlert, setShowErrorAlert] = useState(false);
  const [alertTitle, setAlertTitle] = useState("");
  const [alertMessage, setAlertMessage] = useState("");

  // use effects
  useEffect(() => {
    if (visible) {
      setMemory(initialMemory);
      setDate(initialDate ? new Date(initialDate) : new Date());
    }
  }, [visible, initialMemory, initialDate]);

  // handlers
  const handleSave = async () => {
    if (!memory || !date) {
      setAlertTitle("Missing info");
      setAlertMessage("Memory and date are required.");
      setShowErrorAlert(true);

      return;
    }
    try {
      const formattedDate = date.toISOString().split("T")[0];
      await onSave(memory, formattedDate);

      onClose();
    } catch (err: any) {
      setAlertTitle("Failed");
      setAlertMessage(err.response?.data?.error || "Failed to save memory.");
      setShowErrorAlert(true);
    }
  };

  const onDateChange = (event: any, selectedDate?: Date) => {
    if (Platform.OS === "android") {
      setShowDatePicker(false);
    }
    if (selectedDate) {
      setDate(selectedDate);
    }
  };

  const showDatePickerModal = () => {
    if (!loading) {
      setShowDatePicker(true);
    }
  };

  return (
    <Modal visible={visible} animationType="fade" transparent>
      <View style={styles.overlay}>
        <View style={styles.content}>
          <Text style={styles.title}>
            {isEditing ? "Edit" : "Add"} favorite memory
          </Text>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Date</Text>
            <TouchableOpacity
              style={styles.dateButton}
              onPress={showDatePickerModal}
              disabled={loading}
            >
              <Text style={styles.dateButtonText}>{formatDate(date)}</Text>
              <Feather name="calendar" size={20} color={theme.colors.primary} />
            </TouchableOpacity>
          </View>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Memory</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={memory}
              onChangeText={setMemory}
              placeholder="Describe your memory"
              placeholderTextColor={theme.colors.muted}
              multiline
              numberOfLines={6}
              editable={!loading}
            />
          </View>
          <View style={styles.buttonRow}>
            <TouchableOpacity
              style={[styles.saveButton, loading && { opacity: 0.5 }]}
              onPress={handleSave}
              disabled={loading}
            >
              <Text style={styles.saveButtonText}>
                {loading ? "Saving..." : "Save"}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={onClose}
              disabled={loading}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>

          <AlertModal
            visible={showSuccessAlert}
            type="success"
            title={alertTitle}
            message={alertMessage}
            buttonText="Great"
            onClose={() => setShowSuccessAlert(false)}
          />

          <AlertModal
            visible={showErrorAlert}
            type="error"
            title={alertTitle}
            message={alertMessage}
            buttonText="Close"
            onClose={() => setShowErrorAlert(false)}
          />
        </View>
        {showDatePicker && (
          <DateTimePicker
            value={date}
            mode="date"
            display={Platform.OS === "ios" ? "spinner" : "default"}
            onChange={onDateChange}
            maximumDate={new Date()}
            style={Platform.OS === "ios" ? styles.iosDatePicker : undefined}
          />
        )}
      </View>
    </Modal>
  );
};

const createStyles = (theme: ReturnType<typeof useTheme>["theme"]) =>
  StyleSheet.create({
    overlay: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: theme.colors.modalOverlay,
      justifyContent: "center",
      alignItems: "center",
      zIndex: 1000,
    },
    content: {
      backgroundColor: theme.colors.background,
      borderRadius: 16,
      padding: 24,
      alignItems: "center",
      width: "90%",
      maxHeight: "90%",
      shadowColor: theme.colors.shadow,
      shadowOpacity: 0.2,
      shadowRadius: 10,
      elevation: 5,
      position: "relative",
    },
    title: {
      fontSize: 20,
      fontWeight: "bold",
      color: theme.colors.text,
      marginBottom: 16,
      alignSelf: "center",
    },
    inputGroup: {
      width: "100%",
      marginBottom: 14,
    },
    label: {
      color: theme.colors.muted,
      fontSize: 15,
      marginBottom: 4,
      marginLeft: 2,
    },
    dateButton: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: theme.colors.border,
      borderRadius: 8,
      paddingVertical: 10,
      paddingHorizontal: 14,
      marginBottom: 8,
      justifyContent: "space-between",
    },
    dateButtonText: {
      color: theme.colors.text,
      fontSize: 16,
      marginRight: 8,
    },
    input: {
      backgroundColor: theme.colors.surface,
      color: theme.colors.text,
      borderRadius: 8,
      paddingVertical: 8,
      paddingHorizontal: 12,
      fontSize: 16,
      borderWidth: 1,
      borderColor: theme.colors.border,
      marginBottom: 14,
      width: "100%",
    },
    textArea: {
      minHeight: 100,
      textAlignVertical: "top",
    },
    buttonRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      width: "100%",
      marginTop: 12,
    },
    saveButton: {
      backgroundColor: theme.colors.primary,
      paddingVertical: 12,
      paddingHorizontal: 32,
      borderRadius: 8,
      alignItems: "center",
      flex: 1,
      marginRight: 8,
    },
    saveButtonText: {
      color: theme.colors.text,
      fontWeight: "bold",
      fontSize: 16,
    },
    cancelButton: {
      backgroundColor: theme.colors.cancelButton,
      paddingVertical: 12,
      paddingHorizontal: 32,
      borderRadius: 8,
      alignItems: "center",
      flex: 1,
      marginLeft: 8,
    },
    cancelButtonText: {
      color: theme.colors.text,
      fontWeight: "bold",
      fontSize: 16,
    },
    iosDatePicker: {
      backgroundColor: theme.colors.background,
      width: "100%",
    },
  });

export default UpdateFavoriteMemoryModal;
