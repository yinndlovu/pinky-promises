// external
import React, { useState, useEffect, useMemo } from "react";
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  Platform,
  ActivityIndicator,
} from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import { Feather } from "@expo/vector-icons";

// internal
import { useTheme } from "../../../theme/ThemeContext";
import { formatDate } from "../../../helpers/favoriteMemoryModalHelper";

// types
type UpdateSpecialDateModalProps = {
  visible: boolean;
  loading: boolean;
  onClose: () => void;
  onSave: (date: string, title: string, description?: string) => Promise<void>;
  initialDate?: string;
  initialTitle?: string;
  initialDescription?: string;
  isEditing?: boolean;
};

const UpdateSpecialDateModal: React.FC<UpdateSpecialDateModalProps> = ({
  visible,
  loading,
  onClose,
  onSave,
  initialDate,
  initialTitle = "",
  initialDescription = "",
  isEditing = false,
}) => {
  // variables
  const { theme } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);

  // use states
  const [date, setDate] = useState<Date>(
    initialDate ? new Date(initialDate) : new Date()
  );
  const [title, setTitle] = useState(initialTitle);
  const [description, setDescription] = useState(initialDescription);
  const [showDatePicker, setShowDatePicker] = useState(false);

  // use effects
  useEffect(() => {
    setDate(initialDate ? new Date(initialDate) : new Date());
    setTitle(initialTitle);
    setDescription(initialDescription);
  }, [initialDate, initialTitle, initialDescription, visible]);

  // handlers
  const handleSave = async () => {
    if (!title.trim()) {
      return;
    }

    try {
      const formattedDate = date.toISOString().split("T")[0];

      await onSave(
        formattedDate,
        title.trim(),
        description.trim() || undefined
      );
    } catch (error: any) {
      throw error;
    }
  };

  const handleClose = () => {
    setDate(new Date());
    setTitle("");
    setDescription("");
    setShowDatePicker(false);
    onClose();
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
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.content}>
          <View style={styles.header}>
            <Text style={styles.title}>
              {isEditing ? "Edit special date" : "Add special date"}
            </Text>
            <TouchableOpacity
              onPress={handleClose}
              style={styles.closeButton}
              disabled={loading}
            >
              <Feather name="x" size={24} color={theme.colors.text} />
            </TouchableOpacity>
          </View>

          <View style={styles.form}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Date</Text>
              <TouchableOpacity
                style={styles.dateButton}
                onPress={showDatePickerModal}
                disabled={loading}
              >
                <Text style={styles.dateButtonText}>{formatDate(date)}</Text>
                <Feather
                  name="calendar"
                  size={20}
                  color={theme.colors.primary}
                />
              </TouchableOpacity>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Title</Text>
              <TextInput
                style={styles.input}
                value={title}
                onChangeText={setTitle}
                placeholder="e.g., Anniversary, Day we met"
                placeholderTextColor={theme.colors.muted}
                maxLength={50}
                editable={!loading}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Description (Optional)</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={description}
                onChangeText={setDescription}
                placeholder="Add a description..."
                placeholderTextColor={theme.colors.muted}
                multiline
                numberOfLines={3}
                maxLength={200}
                editable={!loading}
              />
            </View>
          </View>

          <View style={styles.actions}>
            <TouchableOpacity
              style={[
                styles.saveButton,
                { opacity: !title.trim() || loading ? 0.5 : 1 },
              ]}
              onPress={handleSave}
              disabled={!title.trim() || loading}
            >
              <Text style={styles.saveButtonText}>
                {loading ? "Saving..." : isEditing ? "Update" : "Save"}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={handleClose}
              disabled={loading}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
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
      width: "90%",
      shadowColor: theme.colors.shadow,
      shadowOpacity: 0.2,
      shadowRadius: 10,
      elevation: 5,
      position: "relative",
    },
    header: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 24,
    },
    title: {
      fontSize: 20,
      fontWeight: "bold",
      color: theme.colors.text,
    },
    closeButton: {
      padding: 4,
    },
    form: {
      marginBottom: 24,
    },
    inputGroup: {
      marginBottom: 20,
    },
    label: {
      fontSize: 16,
      fontWeight: "bold",
      color: theme.colors.muted,
      marginBottom: 8,
    },
    input: {
      backgroundColor: theme.colors.surface,
      borderRadius: 8,
      paddingHorizontal: 16,
      paddingVertical: 12,
      color: theme.colors.text,
      fontSize: 16,
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    textArea: {
      height: 80,
      textAlignVertical: "top",
    },
    dateButton: {
      backgroundColor: theme.colors.surfaceAlt,
      borderRadius: 8,
      paddingHorizontal: 16,
      paddingVertical: 12,
      borderWidth: 1,
      borderColor: theme.colors.border,
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
    },
    dateButtonText: {
      color: theme.colors.text,
      fontSize: 16,
    },
    actions: {
      flexDirection: "row",
      justifyContent: "space-between",
      gap: 12,
    },
    cancelButton: {
      flex: 1,
      backgroundColor: theme.colors.cancelButton,
      borderRadius: 8,
      paddingVertical: 12,
      alignItems: "center",
    },
    saveButton: {
      flex: 1,
      backgroundColor: theme.colors.primary,
      borderRadius: 8,
      paddingVertical: 12,
      alignItems: "center",
    },
    cancelButtonText: {
      color: theme.colors.text,
      fontWeight: "bold",
      fontSize: 16,
    },
    saveButtonText: {
      color: theme.colors.text,
      fontWeight: "bold",
      fontSize: 16,
    },
    iosDatePicker: {
      backgroundColor: theme.colors.absoluteFillObject,
      borderRadius: 8,
      marginTop: 10,
    },
  });

export default UpdateSpecialDateModal;
