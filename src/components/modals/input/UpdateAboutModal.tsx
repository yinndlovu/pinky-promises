// external
import React, { useState, useEffect, useMemo } from "react";
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  TouchableWithoutFeedback,
} from "react-native";

// internal
import { useTheme } from "../../../theme/ThemeContext";

// types
type UpdateAboutModalProps = {
  visible: boolean;
  loading: boolean;
  initialAbout: string;
  onClose: () => void;
  onSave: (about: string) => Promise<void>;
};

const UpdateAboutModal: React.FC<UpdateAboutModalProps> = ({
  visible,
  loading,
  initialAbout,
  onClose,
  onSave,
}) => {
  // variables
  const { theme } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);

  // use states
  const [about, setAbout] = useState(initialAbout || "");

  useEffect(() => {
    if (visible) {
      setAbout(initialAbout || "");
    }
  }, [visible, initialAbout]);

  return (
    <Modal visible={visible} animationType="fade" transparent>
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.overlay}>
          <View style={styles.content}>
            <Text style={styles.title}>Update more about you</Text>
            <TextInput
              style={styles.textArea}
              value={about}
              onChangeText={setAbout}
              placeholder="Tell more stuff about you..."
              placeholderTextColor={theme.colors.muted}
              multiline
              numberOfLines={6}
              maxLength={500}
              editable={!loading}
            />
            <View style={styles.buttonRow}>
              <TouchableOpacity
                style={[styles.saveButton, loading && { opacity: 0.5 }]}
                onPress={() => onSave(about)}
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
        </View>
      </TouchableWithoutFeedback>
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
    textArea: {
      backgroundColor: theme.colors.surface,
      color: theme.colors.text,
      borderRadius: 8,
      paddingVertical: 12,
      paddingHorizontal: 12,
      fontSize: 16,
      minHeight: 120,
      width: "100%",
      textAlignVertical: "top",
      marginBottom: 16,
      borderWidth: 1,
      borderColor: theme.colors.border,
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
      color: "#fff",
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
  });

export default UpdateAboutModal;
