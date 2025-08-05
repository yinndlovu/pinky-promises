// external
import React, { useState } from "react";
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  TouchableWithoutFeedback,
  Dimensions,
  Keyboard,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";

// content
import AlertModal from "../output/AlertModal";
import PasswordVerificationModal from "./PasswordVerificationModal";

// types
type Props = {
  visible: boolean;
  onClose: () => void;
  onDelete: () => Promise<void>;
  onVerifyPassword: (password: string) => Promise<boolean>;
  loading?: boolean;
};

const { width: screenWidth } = Dimensions.get("window");

const DeleteAccountModal: React.FC<Props> = ({
  visible,
  onClose,
  onDelete,
  onVerifyPassword,
  loading = false,
}) => {
  // use states
  const [isConfirmed, setIsConfirmed] = useState(false);
  const [alertMessage, setAlertMessage] = useState<string | null>(null);
  const [alertVisible, setAlertVisible] = useState(false);
  const [passwordModalVisible, setPasswordModalVisible] = useState(false);
  const insets = useSafeAreaInsets();

  // handlers
  const handleCheckboxPress = () => {
    if (!isConfirmed) {
      setPasswordModalVisible(true);
    } else {
      setIsConfirmed(false);
    }
  };

  const handlePasswordVerify = async (password: string) => {
    try {
      const isValid = await onVerifyPassword(password);
      if (isValid) {
        setIsConfirmed(true);
        return true;
      }
      return false;
    } catch (error) {
      throw error;
    }
  };

  const handleDelete = async () => {
    if (!isConfirmed) {
      return;
    }

    try {
      await onDelete();
    } catch (err: any) {
      setAlertMessage(err.response?.data?.error || "Failed to delete account");
      setAlertVisible(true);
    }
  };

  const handleClose = () => {
    setIsConfirmed(false);
    onClose();
  };

  return (
    <>
      <Modal visible={visible} transparent animationType="slide">
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View style={styles.overlay}>
            <View style={[styles.container, { paddingTop: insets.top + 2 }]}>
              <View style={styles.handle} />
              <View style={styles.content}>
                <View style={styles.dangerSection}>
                  <Feather name="alert-triangle" size={32} color="#ff4757" />
                  <Text style={styles.dangerTitle}>Account deletion</Text>
                  <TouchableOpacity
                  style={styles.closeButton}
                  onPress={handleClose}
                  disabled={loading}
                >
                  <Text style={styles.closeButtonText}>✕</Text>
                </TouchableOpacity>
                </View>

                <Text style={styles.description}>
                  Are you sure you want to delete your account? This action
                  cannot be undone and will permanently remove all your data,
                  including messages, memories, and profile information.
                </Text>

                <View style={styles.warningSection}>
                  <Text style={styles.warningText}>
                    • All your messages will be permanently deleted
                  </Text>
                  <Text style={styles.warningText}>
                    • Your profile and settings will be removed
                  </Text>
                  <Text style={styles.warningText}>
                    • All shared memories and special dates will be lost
                  </Text>
                  <Text style={styles.warningText}>
                    • This action cannot be reversed
                  </Text>
                  <Text style={styles.warningText}>
                    • Your history with your partner and your partnership will
                    be removed
                  </Text>
                </View>

                <TouchableOpacity
                  style={styles.checkboxContainer}
                  onPress={handleCheckboxPress}
                  disabled={loading}
                >
                  <View
                    style={[
                      styles.checkbox,
                      isConfirmed && styles.checkboxChecked,
                    ]}
                  >
                    {isConfirmed && (
                      <Feather name="check" size={16} color="#fff" />
                    )}
                  </View>
                  <Text style={styles.checkboxText}>
                    I understand that this action is permanent and cannot be
                    undone
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.deleteButton,
                    (!isConfirmed || loading) && {
                      opacity: 0.5,
                    },
                  ]}
                  onPress={handleDelete}
                  disabled={!isConfirmed || loading}
                >
                  <Text style={styles.deleteButtonText}>
                    {loading ? "Deleting..." : "Delete"}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            <AlertModal
              visible={alertVisible}
              message={alertMessage || ""}
              onClose={() => setAlertVisible(false)}
            />
          </View>
        </TouchableWithoutFeedback>
      </Modal>

      <PasswordVerificationModal
        visible={passwordModalVisible}
        onClose={() => setPasswordModalVisible(false)}
        onVerify={handlePasswordVerify}
        loading={loading}
      />
    </>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(5,3,12,0.7)",
    justifyContent: "flex-end",
  },
  container: {
    backgroundColor: "#23243a",
    width: screenWidth,
    height: "75%",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 20,
  },
  handle: {
    width: 40,
    height: 4,
    backgroundColor: "#b0b3c6",
    borderRadius: 2,
    alignSelf: "center",
    marginBottom: 20,
    opacity: 0.6,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingBottom: 0,
  },
  closeButton: {
    width: 32,
    height: 32,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 16,
    backgroundColor: "transparent",
  },
  closeButtonText: {
    color: "#b0b3c6",
    fontSize: 18,
    fontWeight: "bold",
  },
  deleteButton: {
    backgroundColor: "#ff4757",
    paddingVertical: 8,
    marginTop: 16,
    paddingHorizontal: 16,
    borderRadius: 8,
    width: "100%",
    alignItems: "center",
  },
  deleteButtonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 14,
  },
  content: {
    flex: 1,
    paddingTop: 0,
  },
  dangerSection: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    marginBottom: 26,
  },
  dangerTitle: {
    color: "#ff4757",
    fontSize: 20,
    fontWeight: "bold",
    marginLeft: 12,
  },
  description: {
    color: "#fff",
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 20,
    textAlign: "center",
  },
  warningSection: {
    backgroundColor: "#1b1c2e",
    borderRadius: 10,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: "#ff4757",
  },
  warningText: {
    color: "#ff6b6b",
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 8,
  },
  checkboxContainer: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 20,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: "#b0b3c6",
    marginRight: 12,
    marginTop: 2,
    justifyContent: "center",
    alignItems: "center",
  },
  checkboxChecked: {
    backgroundColor: "#ff4757",
    borderColor: "#ff4757",
  },
  checkboxText: {
    color: "#fff",
    fontSize: 14,
    lineHeight: 20,
    flex: 1,
  },
});

export default DeleteAccountModal;
