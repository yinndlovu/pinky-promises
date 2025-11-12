// external
import React, { useState, useEffect, useMemo } from "react";
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  ActivityIndicator,
  TouchableWithoutFeedback,
} from "react-native";
import { Feather } from "@expo/vector-icons";

// internal
import { useTheme } from "../../../theme/ThemeContext";

// types
type Props = {
  visible: boolean;
  initialGiftName?: string;
  onClose: () => void;
  onSave: (giftName: string) => Promise<void>;
  loading?: boolean;
};

const UpdateMonthlyGiftModal: React.FC<Props> = ({
  visible,
  initialGiftName = "",
  onClose,
  onSave,
  loading = false,
}) => {
  // variables
  const { theme } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);

  // use states
  const [giftName, setGiftName] = useState(initialGiftName);

  // use effects
  useEffect(() => {
    setGiftName(initialGiftName);
  }, [visible, initialGiftName]);

  return (
    <Modal visible={visible} transparent animationType="fade">
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.overlay}>
          <View style={styles.content}>
            <View style={styles.header}>
              <Text style={styles.title}>
                {initialGiftName
                  ? "Edit your favorite present"
                  : "Add your favorite present"}
              </Text>
              <TouchableOpacity
                onPress={onClose}
                style={styles.closeButton}
                disabled={loading}
              >
                <Feather name="x" size={24} color={theme.colors.text} />
              </TouchableOpacity>
            </View>
            <View style={styles.form}>
              <Text style={styles.label}>Present name</Text>
              <TextInput
                style={styles.input}
                value={giftName}
                onChangeText={setGiftName}
                placeholder="e.g., Spotify gift card"
                placeholderTextColor={theme.colors.muted}
                maxLength={50}
                editable={!loading}
              />
            </View>
            <View style={styles.actions}>
              <TouchableOpacity
                style={[
                  styles.saveButton,
                  (!giftName.trim() || loading) && styles.saveButtonDisabled,
                ]}
                onPress={() => onSave(giftName.trim())}
                disabled={!giftName.trim() || loading}
              >
                <Text style={styles.saveButtonText}>
                  {loading ? "Saving..." : initialGiftName ? "Update" : "Save"}
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
      padding: 28,
      alignItems: "center",
      width: "80%",
      shadowColor: theme.colors.shadow,
      shadowOpacity: 0.2,
      shadowRadius: 10,
      elevation: 5,
    },
    header: {
      flexDirection: "row",
      alignItems: "center",
      width: "100%",
      marginBottom: 18,
      justifyContent: "space-between",
    },
    title: {
      color: theme.colors.text,
      fontSize: 18,
      fontWeight: "bold",
      textAlign: "left",
      flex: 1,
    },
    closeButton: {
      marginLeft: 12,
      padding: 4,
    },
    form: {
      width: "100%",
      marginBottom: 18,
    },
    label: {
      color: theme.colors.muted,
      fontSize: 14,
      marginBottom: 6,
      fontWeight: "bold",
    },
    input: {
      backgroundColor: theme.colors.surface,
      color: theme.colors.text,
      borderRadius: 8,
      paddingVertical: 10,
      paddingHorizontal: 14,
      fontSize: 16,
      marginBottom: 8,
    },
    actions: {
      flexDirection: "row",
      justifyContent: "space-between",
      marginTop: 8,
    },
    cancelButton: {
      backgroundColor: theme.colors.cancelButton,
      borderRadius: 8,
      paddingVertical: 10,
      paddingHorizontal: 24,
      alignItems: "center",
      flex: 1,
    },
    cancelButtonText: {
      color: theme.colors.text,
      fontWeight: "bold",
      fontSize: 15,
    },
    saveButton: {
      backgroundColor: theme.colors.primary,
      borderRadius: 8,
      paddingVertical: 10,
      paddingHorizontal: 24,
      alignItems: "center",
      marginRight: 8,
      flex: 1,
    },
    saveButtonDisabled: {
      opacity: 0.6,
    },
    saveButtonText: {
      color: theme.colors.text,
      fontWeight: "bold",
      fontSize: 15,
    },
  });

export default UpdateMonthlyGiftModal;
