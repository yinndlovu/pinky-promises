// external
import React, { useState, useEffect, useMemo } from "react";
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from "react-native";

// internal
import { useTheme } from "../../../theme/ThemeContext";

// types
type Props = {
  visible: boolean;
  onClose: () => void;
  onSave: (title: string) => Promise<void>;
  initialTitle?: string;
  loading?: boolean;
};

const EditTitleModal: React.FC<Props> = ({
  visible,
  onClose,
  onSave,
  initialTitle = "",
  loading = false,
}) => {
  // variables
  const { theme } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);

  // use states
  const [title, setTitle] = useState(initialTitle);
  const [error, setError] = useState("");

  // use effects
  useEffect(() => {
    if (visible) {
      setTitle(initialTitle);
      setError("");
    }
  }, [visible, initialTitle]);

  // handlers
  const handleSave = async () => {
    const trimmedTitle = title.trim();
    if (!trimmedTitle) {
      setError("Title cannot be empty");
      return;
    }

    if (trimmedTitle.length > 50) {
      setError("Title must be 50 characters or less");
      return;
    }

    try {
      await onSave(trimmedTitle);
    } catch (err: any) {
      setError(err.response?.data?.error || "Failed to update title");
    }
  };

  return (
    <Modal visible={visible} animationType="fade" transparent>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.overlay}
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
      >
        <View style={styles.content}>
          <Text style={styles.title}>Edit Title</Text>

          <View style={styles.inputGroup}>
            <TextInput
              style={styles.input}
              value={title}
              onChangeText={(text) => {
                setTitle(text);
                setError("");
              }}
              placeholder="Enter a title"
              placeholderTextColor={theme.colors.muted}
              maxLength={50}
              editable={!loading}
              autoFocus
              selectTextOnFocus
            />
            <Text style={styles.charCount}>{title.length}/50</Text>
          </View>

          {error ? <Text style={styles.errorText}>{error}</Text> : null}

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
        </View>
      </KeyboardAvoidingView>
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
      maxWidth: 400,
      shadowColor: theme.colors.shadow,
      shadowOpacity: 0.2,
      shadowRadius: 10,
      elevation: 5,
    },
    title: {
      fontSize: 20,
      fontWeight: "bold",
      color: theme.colors.text,
      marginBottom: 20,
    },
    inputGroup: {
      width: "100%",
      marginBottom: 8,
    },
    input: {
      backgroundColor: theme.colors.surface,
      color: theme.colors.text,
      borderRadius: 12,
      paddingVertical: 14,
      paddingHorizontal: 16,
      fontSize: 16,
      borderWidth: 1,
      borderColor: theme.colors.border,
      width: "100%",
    },
    charCount: {
      fontSize: 12,
      color: theme.colors.muted,
      textAlign: "right",
      marginTop: 6,
      marginRight: 4,
    },
    errorText: {
      color: "#ff4444",
      fontSize: 13,
      marginBottom: 12,
      textAlign: "center",
    },
    buttonRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      width: "100%",
      marginTop: 16,
    },
    saveButton: {
      backgroundColor: theme.colors.primary,
      paddingVertical: 14,
      paddingHorizontal: 32,
      borderRadius: 10,
      alignItems: "center",
      flex: 1,
      marginRight: 8,
    },
    saveButtonText: {
      color: "#fff",
      fontWeight: "bold",
      fontSize: 16,
    },
    cancelButton: {
      backgroundColor: theme.colors.cancelButton,
      paddingVertical: 14,
      paddingHorizontal: 32,
      borderRadius: 10,
      alignItems: "center",
      flex: 1,
      marginLeft: 8,
    },
    cancelButtonText: {
      color: theme.colors.text,
      fontWeight: "bold",
      fontSize: 16,
    },
  });

export default EditTitleModal;

