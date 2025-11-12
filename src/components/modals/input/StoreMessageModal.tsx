// external
import React, { useState, useMemo } from "react";
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  TouchableWithoutFeedback,
  Keyboard,
  Dimensions,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

// internal
import { useTheme } from "../../../theme/ThemeContext";

// content
import AlertModal from "../output/AlertModal";

// types
type Props = {
  visible: boolean;
  onClose: () => void;
  onStore: (title: string, message: string) => Promise<void>;
  loading?: boolean;
};

const { width: screenWidth } = Dimensions.get("window");

const StoreMessageModal: React.FC<Props> = ({
  visible,
  onClose,
  onStore,
  loading = false,
}) => {
  // use states
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [alertMessage, setAlertMessage] = useState<string | null>(null);
  const [showSuccessAlert, setShowSuccessAlert] = useState(false);
  const [showErrorAlert, setShowErrorAlert] = useState(false);
  const [alertTitle, setAlertTitle] = useState("");

  // variables
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);

  // handlers
  const handleStore = async () => {
    if (!title.trim() || !message.trim()) {
      return;
    }

    try {
      await onStore(title.trim(), message.trim());

      setTitle("");
      setMessage("");
    } catch (err: any) {
      setAlertTitle("Failed");
      setAlertMessage(err.response?.data?.error || "Failed to store message.");
      setShowErrorAlert(true);
    }
  };

  const handleClose = () => {
    setTitle("");
    setMessage("");
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="slide">
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={styles.overlay}>
          <View style={[styles.container, { paddingTop: insets.top + 2 }]}>
            <View style={styles.handle} />
            <View style={styles.header}>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={handleClose}
                disabled={loading}
              >
                <Text style={styles.closeButtonText}>✕</Text>
              </TouchableOpacity>

              <Text style={styles.title}>Store your favorite message</Text>

              <TouchableOpacity
                style={[
                  styles.storeButton,
                  (!title.trim() || !message.trim() || loading) && {
                    opacity: 0.5,
                  },
                ]}
                onPress={handleStore}
                disabled={!title.trim() || !message.trim() || loading}
              >
                <Text style={styles.storeButtonText}>
                  {loading ? "Storing..." : "Store"}
                </Text>
              </TouchableOpacity>
            </View>

            <View style={styles.separator} />

            <View style={styles.content}>
              <TextInput
                style={styles.titleInput}
                placeholder="Message title..."
                placeholderTextColor={theme.colors.muted}
                value={title}
                onChangeText={setTitle}
                maxLength={50}
                editable={!loading}
              />

              <TextInput
                style={styles.messageInput}
                placeholder="Type the message here..."
                placeholderTextColor={theme.colors.muted}
                value={message}
                onChangeText={setMessage}
                multiline
                maxLength={5000}
                editable={!loading}
                textAlignVertical="top"
              />
            </View>
          </View>

          <AlertModal
            visible={showSuccessAlert}
            type="success"
            title={alertTitle}
            message={alertMessage || ""}
            buttonText="Great"
            onClose={() => setShowSuccessAlert(false)}
          />

          <AlertModal
            visible={showErrorAlert}
            type="error"
            title={alertTitle}
            message={alertMessage || ""}
            buttonText="Close"
            onClose={() => setShowErrorAlert(false)}
          />
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const createStyles = (theme: ReturnType<typeof useTheme>["theme"]) =>
  StyleSheet.create({
    overlay: {
      flex: 1,
      backgroundColor: theme.colors.modalOverlay,
      justifyContent: "flex-end",
    },
    container: {
      backgroundColor: theme.colors.background,
      width: screenWidth,
      height: "75%",
      borderTopLeftRadius: 20,
      borderTopRightRadius: 20,
      paddingHorizontal: 20,
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
    header: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      paddingBottom: 20,
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
      color: theme.colors.muted,
      fontSize: 18,
      fontWeight: "bold",
    },
    title: {
      color: theme.colors.text,
      fontSize: 16,
      fontWeight: "bold",
      flex: 1,
      textAlign: "center",
      marginHorizontal: 16,
    },
    storeButton: {
      backgroundColor: theme.colors.primary,
      paddingVertical: 8,
      paddingHorizontal: 16,
      borderRadius: 8,
      minWidth: 60,
      alignItems: "center",
    },
    storeButtonText: {
      color: theme.colors.text,
      fontWeight: "bold",
      fontSize: 14,
    },
    separator: {
      height: 1,
      backgroundColor: theme.colors.separator,
      marginVertical: 8,
    },
    content: {
      flex: 1,
      paddingTop: 16,
    },
    titleInput: {
      backgroundColor: theme.colors.surfaceAlt,
      color: theme.colors.text,
      borderRadius: 10,
      padding: 14,
      fontSize: 16,
      marginBottom: 16,
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    messageInput: {
      backgroundColor: theme.colors.surfaceAlt,
      color: theme.colors.text,
      borderRadius: 10,
      padding: 14,
      fontSize: 16,
      flex: 1,
      borderWidth: 1,
      borderColor: theme.colors.border,
      marginBottom: 16,
    },
  });

export default StoreMessageModal;
