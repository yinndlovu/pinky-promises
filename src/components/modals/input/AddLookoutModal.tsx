// external
import React, { useState, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TextInput,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import DateTimePicker from "@react-native-community/datetimepicker";

// internal
import { useTheme } from "../../../theme/ThemeContext";
import useToken from "../../../hooks/useToken";
import { createLookout } from "../../../services/api/period/periodService";

// props
interface Props {
  visible: boolean;
  onClose: () => void;
  onSuccess: () => void;
  periodUserId?: number;
}

const AddLookoutModal: React.FC<Props> = ({
  visible,
  onClose,
  onSuccess,
  periodUserId,
}) => {
  // hook variables
  const { theme } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const token = useToken();

  // use states
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [showOnDate, setShowOnDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [priority, setPriority] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // handlers
  const handleSubmit = async () => {
    if (!token || !periodUserId || !title.trim()) {
      setError("Please enter a title");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await createLookout(token, {
        userId: periodUserId,
        title: title.trim(),
        description: description.trim() || undefined,
        showOnDate: showOnDate.toISOString().split("T")[0],
        priority,
      });

      setTitle("");
      setDescription("");
      setShowOnDate(new Date());
      setPriority(0);
      onSuccess();
    } catch (err: any) {
      setError(err.response?.data?.error || "Failed to add lookout");
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setTitle("");
    setDescription("");
    setShowOnDate(new Date());
    setPriority(0);
    setError(null);
    onClose();
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      statusBarTranslucent
    >
      <BlurView intensity={20} tint="dark" style={styles.overlay}>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.keyboardView}
        >
          <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
              <Text style={styles.headerTitle}>Add Reminder</Text>
              <TouchableOpacity
                onPress={handleClose}
                style={styles.closeButton}
              >
                <Feather name="x" size={24} color={theme.colors.text} />
              </TouchableOpacity>
            </View>

            <ScrollView
              style={styles.content}
              showsVerticalScrollIndicator={false}
            >
              {/* Info Banner */}
              <View style={styles.infoBanner}>
                <Feather name="eye" size={18} color={theme.colors.primary} />
                <Text style={styles.infoBannerText}>
                  This reminder will be shown to your partner on the date you
                  choose
                </Text>
              </View>

              {/* Title Input */}
              <Text style={styles.label}>What to look out for?</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g., Take iron supplements"
                placeholderTextColor={theme.colors.muted}
                value={title}
                onChangeText={setTitle}
                maxLength={100}
              />

              {/* Description Input */}
              <Text style={styles.label}>More details (optional)</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="Any additional information..."
                placeholderTextColor={theme.colors.muted}
                value={description}
                onChangeText={setDescription}
                multiline
                numberOfLines={3}
                maxLength={500}
              />

              {/* Date Picker */}
              <Text style={styles.label}>When to show this?</Text>
              <TouchableOpacity
                style={styles.dateButton}
                onPress={() => setShowDatePicker(true)}
              >
                <Feather
                  name="calendar"
                  size={18}
                  color={theme.colors.primary}
                />
                <Text style={styles.dateButtonText}>
                  {formatDate(showOnDate)}
                </Text>
                <Feather
                  name="chevron-right"
                  size={18}
                  color={theme.colors.muted}
                />
              </TouchableOpacity>

              {showDatePicker && (
                <DateTimePicker
                  value={showOnDate}
                  mode="date"
                  display="spinner"
                  minimumDate={new Date()}
                  onChange={(event, date) => {
                    setShowDatePicker(Platform.OS === "ios");
                    if (date) setShowOnDate(date);
                  }}
                />
              )}

              {/* Priority Toggle */}
              <Text style={styles.label}>Priority</Text>
              <View style={styles.priorityRow}>
                <TouchableOpacity
                  style={[
                    styles.priorityButton,
                    priority === 0 && styles.priorityButtonActive,
                  ]}
                  onPress={() => setPriority(0)}
                >
                  <Text
                    style={[
                      styles.priorityButtonText,
                      priority === 0 && styles.priorityButtonTextActive,
                    ]}
                  >
                    Normal
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.priorityButton,
                    styles.priorityButtonImportant,
                    priority === 1 && styles.priorityButtonImportantActive,
                  ]}
                  onPress={() => setPriority(1)}
                >
                  <Feather
                    name="alert-circle"
                    size={14}
                    color={priority === 1 ? "#fff" : "#ff6b6b"}
                  />
                  <Text
                    style={[
                      styles.priorityButtonText,
                      { color: priority === 1 ? "#fff" : "#ff6b6b" },
                    ]}
                  >
                    Important
                  </Text>
                </TouchableOpacity>
              </View>

              {/* Error */}
              {error && (
                <View style={styles.errorContainer}>
                  <Feather name="alert-circle" size={16} color="#ff6b6b" />
                  <Text style={styles.errorText}>{error}</Text>
                </View>
              )}
            </ScrollView>

            {/* Submit Button */}
            <TouchableOpacity
              style={[
                styles.submitButton,
                !title.trim() && styles.submitButtonDisabled,
              ]}
              onPress={handleSubmit}
              disabled={loading || !title.trim()}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <>
                  <Feather name="bell" size={18} color="#fff" />
                  <Text style={styles.submitButtonText}>Add Reminder</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </BlurView>
    </Modal>
  );
};

const createStyles = (theme: any) =>
  StyleSheet.create({
    overlay: {
      flex: 1,
      justifyContent: "flex-end",
    },
    keyboardView: {
      flex: 1,
      justifyContent: "flex-end",
    },
    container: {
      backgroundColor: theme.colors.background,
      borderTopLeftRadius: 24,
      borderTopRightRadius: 24,
      maxHeight: "90%",
      paddingBottom: 34,
    },
    header: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      padding: 20,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.separator,
    },
    headerTitle: {
      fontSize: 20,
      fontWeight: "700",
      color: theme.colors.text,
    },
    closeButton: {
      padding: 4,
    },
    content: {
      padding: 20,
    },
    infoBanner: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: theme.colors.primary + "15",
      padding: 14,
      borderRadius: 12,
      gap: 10,
      marginBottom: 20,
    },
    infoBannerText: {
      flex: 1,
      fontSize: 13,
      color: theme.colors.text,
      lineHeight: 18,
    },
    label: {
      fontSize: 14,
      fontWeight: "600",
      color: theme.colors.text,
      marginBottom: 12,
      marginTop: 8,
    },
    input: {
      backgroundColor: theme.colors.surfaceAlt,
      borderRadius: 12,
      padding: 16,
      fontSize: 16,
      color: theme.colors.text,
      marginBottom: 16,
    },
    textArea: {
      minHeight: 80,
      textAlignVertical: "top",
    },
    dateButton: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: theme.colors.surfaceAlt,
      borderRadius: 12,
      padding: 16,
      gap: 10,
      marginBottom: 16,
    },
    dateButtonText: {
      flex: 1,
      fontSize: 16,
      color: theme.colors.text,
    },
    priorityRow: {
      flexDirection: "row",
      gap: 12,
      marginBottom: 16,
    },
    priorityButton: {
      flex: 1,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      paddingVertical: 14,
      borderRadius: 12,
      backgroundColor: theme.colors.surfaceAlt,
      gap: 6,
    },
    priorityButtonActive: {
      backgroundColor: theme.colors.primary,
    },
    priorityButtonImportant: {
      borderWidth: 1,
      borderColor: "#ff6b6b40",
    },
    priorityButtonImportantActive: {
      backgroundColor: "#ff6b6b",
      borderColor: "#ff6b6b",
    },
    priorityButtonText: {
      fontSize: 14,
      fontWeight: "600",
      color: theme.colors.text,
    },
    priorityButtonTextActive: {
      color: "#fff",
    },
    errorContainer: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: "#ff6b6b15",
      padding: 12,
      borderRadius: 10,
      gap: 8,
      marginBottom: 16,
    },
    errorText: {
      color: "#ff6b6b",
      fontSize: 14,
      flex: 1,
    },
    submitButton: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: theme.colors.primary,
      marginHorizontal: 20,
      paddingVertical: 16,
      borderRadius: 14,
      gap: 8,
    },
    submitButtonDisabled: {
      opacity: 0.5,
    },
    submitButtonText: {
      color: "#fff",
      fontSize: 16,
      fontWeight: "600",
    },
  });

export default AddLookoutModal;
