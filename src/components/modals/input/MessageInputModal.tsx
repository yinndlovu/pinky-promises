// external
import React, { useState, useMemo, useEffect } from "react";
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  TouchableWithoutFeedback,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
} from "react-native";

// internal
import { useTheme } from "../../../theme/ThemeContext";

// content
import AlertModal from "../output/AlertModal";

// types
type Props = {
  visible: boolean;
  onClose: () => void;
  onSend: (text: string) => void;
  type: "sweet" | "vent";
  loading?: boolean;
};

const MessageInputModal: React.FC<Props> = ({
  visible,
  onClose,
  onSend,
  type,
  loading = false,
}) => {
  // variables
  const { theme } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);

  // use states
  const [text, setText] = useState("");
  const [alertMessage, setAlertMessage] = useState<string | null>(null);
  const [alertTitle, setAlertTitle] = useState("");
  const [showSuccessAlert, setShowSuccessAlert] = useState(false);
  const [showErrorAlert, setShowErrorAlert] = useState(false);

  // use effects
  useEffect(() => {
    if (!visible) {
      setText("");
    }
  }, [visible]);

  // handlers
  const handleSend = async () => {
    if (!text.trim()) {
      return;
    }

    try {
      onSend(text.trim());
    } catch (err: any) {
      setAlertTitle("Failed");
      setAlertMessage(err?.message || "Failed to send message.");
      setShowErrorAlert(true);
    }
  };

  // dynamic text
  const title =
    type === "sweet"
      ? "Leave your baby a sweet message"
      : "Tell your baby how you feel";
  const placeholder =
    type === "sweet"
      ? "Type your sweet message..."
      : "Type your vent message...";

  return (
    <Modal visible={visible} transparent animationType="fade">
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.overlay}
          keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
        >
          <View style={styles.container}>
            <Text style={styles.title}>{title}</Text>
            <TextInput
              style={styles.input}
              placeholder={placeholder}
              placeholderTextColor={theme.colors.muted}
              value={text}
              onChangeText={setText}
              multiline
              maxLength={500}
              editable={!loading}
            />
            <View style={styles.buttonRow}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={onClose}
                disabled={loading}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.sendButton,
                  {
                    backgroundColor:
                      type === "sweet" ? theme.colors.primary : "#3b82f6",
                  },
                  (!text.trim() || loading) && { opacity: 0.5 },
                ]}
                onPress={handleSend}
                disabled={!text.trim() || loading}
              >
                <Text style={styles.sendButtonText}>
                  {loading ? "Sending..." : "Send"}
                </Text>
              </TouchableOpacity>
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
        </KeyboardAvoidingView>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const createStyles = (theme: ReturnType<typeof useTheme>["theme"]) =>
  StyleSheet.create({
    overlay: {
      flex: 1,
      backgroundColor: theme.colors.modalOverlay,
      justifyContent: "center",
      alignItems: "center",
    },
    container: {
      backgroundColor: theme.colors.background,
      borderRadius: 16,
      padding: 24,
      width: "90%",
      maxWidth: 350,
      alignItems: "stretch",
    },
    title: {
      color: theme.colors.text,
      fontSize: 17,
      fontWeight: "bold",
      marginBottom: 16,
      textAlign: "center",
    },
    input: {
      backgroundColor: theme.colors.surface,
      color: theme.colors.text,
      borderRadius: 10,
      padding: 14,
      minHeight: 80,
      maxHeight: 160,
      fontSize: 16,
      marginBottom: 20,
      textAlignVertical: "top",
    },
    buttonRow: {
      flexDirection: "row",
      justifyContent: "flex-end",
      alignItems: "center",
    },
    cancelButton: {
      marginRight: 12,
      paddingVertical: 10,
      paddingHorizontal: 18,
      borderRadius: 8,
      backgroundColor: theme.colors.cancelButton,
    },
    cancelButtonText: {
      color: theme.colors.text,
      fontWeight: "bold",
      fontSize: 15,
    },
    sendButton: {
      paddingVertical: 10,
      paddingHorizontal: 22,
      borderRadius: 8,
    },
    sendButtonText: {
      color: theme.colors.text,
      fontWeight: "bold",
      fontSize: 15,
    },
  });

export default MessageInputModal;
