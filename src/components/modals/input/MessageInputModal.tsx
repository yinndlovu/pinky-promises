// external
import React, { useState } from "react";
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  TouchableWithoutFeedback,
  Keyboard,
  ActivityIndicator,
} from "react-native";

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
  // use states
  const [text, setText] = useState("");
  const [alertMessage, setAlertMessage] = useState<string | null>(null);
  const [alertVisible, setAlertVisible] = useState(false);

  // handlers
  const handleSend = async () => {
    if (!text.trim()) {
      return;
    }

    try {
      await onSend(text.trim());
      setText("");
    } catch (err: any) {
      setAlertMessage(err?.message || "Failed to send message");
      setAlertVisible(true);
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
        <View style={styles.overlay}>
          <View style={styles.container}>
            <Text style={styles.title}>{title}</Text>
            <TextInput
              style={styles.input}
              placeholder={placeholder}
              placeholderTextColor="#b0b3c6"
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
                  { backgroundColor: type === "sweet" ? "#e03487" : "#3b82f6" },
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
            visible={alertVisible}
            message={alertMessage || ""}
            onClose={() => setAlertVisible(false)}
          />
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(5,3,12,0.7)",
    justifyContent: "center",
    alignItems: "center",
  },
  container: {
    backgroundColor: "#23243a",
    borderRadius: 16,
    padding: 24,
    width: "90%",
    maxWidth: 350,
    alignItems: "stretch",
  },
  title: {
    color: "#fff",
    fontSize: 17,
    fontWeight: "bold",
    marginBottom: 16,
    textAlign: "center",
  },
  input: {
    backgroundColor: "#1b1c2e",
    color: "#fff",
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
    backgroundColor: "transparent",
    borderWidth: 1,
    borderColor: "#b0b3c6",
  },
  cancelButtonText: {
    color: "#b0b3c6",
    fontWeight: "bold",
    fontSize: 15,
  },
  sendButton: {
    paddingVertical: 10,
    paddingHorizontal: 22,
    borderRadius: 8,
  },
  sendButtonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 15,
  },
});

export default MessageInputModal;
