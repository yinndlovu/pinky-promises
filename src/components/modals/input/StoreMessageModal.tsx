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
  Dimensions,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

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
  const [alertVisible, setAlertVisible] = useState(false);
  const insets = useSafeAreaInsets();

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
      setAlertMessage(err?.message || "Failed to store message");
      setAlertVisible(true);
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
                placeholderTextColor="#b0b3c6"
                value={title}
                onChangeText={setTitle}
                maxLength={50}
                editable={!loading}
              />

              <TextInput
                style={styles.messageInput}
                placeholder="Type the message here..."
                placeholderTextColor="#b0b3c6"
                value={message}
                onChangeText={setMessage}
                multiline
                maxLength={1000}
                editable={!loading}
                textAlignVertical="top"
              />
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
    color: "#b0b3c6",
    fontSize: 18,
    fontWeight: "bold",
  },
  title: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
    flex: 1,
    textAlign: "center",
    marginHorizontal: 16,
  },
  storeButton: {
    backgroundColor: "#e03487",
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    minWidth: 60,
    alignItems: "center",
  },
  storeButtonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 14,
  },
  separator: {
    height: 1,
    backgroundColor: "#2f3149",
    marginVertical: 8,
  },
  content: {
    flex: 1,
    paddingTop: 16,
  },
  titleInput: {
    backgroundColor: "#1b1c2e",
    color: "#fff",
    borderRadius: 10,
    padding: 14,
    fontSize: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#2f3149",
  },
  messageInput: {
    backgroundColor: "#1b1c2e",
    color: "#fff",
    borderRadius: 10,
    padding: 14,
    fontSize: 16,
    flex: 1,
    borderWidth: 1,
    borderColor: "#2f3149",
    marginBottom: 16,
  },
});

export default StoreMessageModal;
