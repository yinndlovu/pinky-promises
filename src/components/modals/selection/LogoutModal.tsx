// external
import React, { useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  TouchableWithoutFeedback,
} from "react-native";
import { Feather } from "@expo/vector-icons";

// internal
import { useTheme } from "../../../theme/ThemeContext";

// types
type Props = {
  visible: boolean;
  onClose: () => void;
  onConfirm: () => void;
};

const LogoutModal: React.FC<Props> = ({ visible, onClose, onConfirm }) => {
  // variables
  const { theme } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.modalOverlay}>
          <TouchableOpacity style={styles.backdrop} onPress={onClose} />
          <View style={styles.modalContent}>
            <View style={styles.handle} />

            <View style={styles.iconContainer}>
              <Feather name="log-out" size={32} color={theme.colors.primary} />
            </View>

            <Text style={styles.title}>Log out</Text>
            <Text style={styles.message}>
              Are you sure you want to log out? You'll need to sign in again to
              access your account.
            </Text>

            <View style={styles.buttonContainer}>
              <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
                <Text style={styles.cancelText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.confirmButton}
                onPress={onConfirm}
              >
                <Text style={styles.confirmText}>Log out</Text>
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
    modalOverlay: {
      flex: 1,
      backgroundColor: theme.colors.modalOverlay,
      justifyContent: "center",
      alignItems: "center",
      paddingHorizontal: 20,
    },
    backdrop: {
      position: "absolute",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
    },
    modalContent: {
      backgroundColor: theme.colors.background,
      borderRadius: 20,
      paddingTop: 12,
      paddingBottom: 24,
      paddingHorizontal: 24,
      width: "100%",
      maxWidth: 320,
      shadowColor: theme.colors.shadow,
      shadowOpacity: 0.3,
      shadowRadius: 20,
      elevation: 10,
      alignItems: "center",
    },
    handle: {
      width: 40,
      height: 4,
      backgroundColor: theme.colors.muted,
      borderRadius: 2,
      alignSelf: "center",
      marginBottom: 20,
      opacity: 0.6,
    },
    iconContainer: {
      width: 64,
      height: 64,
      borderRadius: 32,
      backgroundColor: theme.colors.glowBackground,
      justifyContent: "center",
      alignItems: "center",
      marginBottom: 16,
    },
    title: {
      color: theme.colors.text,
      fontSize: 20,
      fontWeight: "bold",
      marginBottom: 12,
      textAlign: "center",
    },
    message: {
      color: theme.colors.muted,
      fontSize: 16,
      textAlign: "center",
      lineHeight: 22,
      marginBottom: 24,
      paddingHorizontal: 8,
    },
    buttonContainer: {
      flexDirection: "row",
      width: "100%",
      gap: 12,
    },
    cancelButton: {
      flex: 1,
      paddingVertical: 14,
      paddingHorizontal: 20,
      borderRadius: 12,
      backgroundColor: theme.colors.cancelButton,
      alignItems: "center",
    },
    cancelText: {
      color: theme.colors.muted,
      fontSize: 16,
      fontWeight: "500",
    },
    confirmButton: {
      flex: 1,
      paddingVertical: 14,
      paddingHorizontal: 20,
      borderRadius: 12,
      backgroundColor: theme.colors.primary,
      alignItems: "center",
    },
    confirmText: {
      color: theme.colors.text,
      fontSize: 16,
      fontWeight: "500",
    },
  });

export default LogoutModal;
