// external
import React from "react";
import { Modal, View, Text, TouchableOpacity, StyleSheet } from "react-native";

// internal
import { formatDateDMYHM } from "../../../utils/formatDate";

// types
type Props = {
  visible: boolean;
  onClose: () => void;
  message: any | null;
  type: "sweet" | "vent" | "stored" | null;
  customTitle?: string;
};

const ViewMessageModal: React.FC<Props> = ({
  visible,
  onClose,
  message,
  type,
  customTitle,
}) => {
  if (!message) {
    return null;
  }

  let title = customTitle;

  if (!title) {
    if (type === "sweet") {
      title = "Sweet message";
    } else if (type === "vent") {
      title = "Vent message";
    } else if (type === "stored") {
      title = message?.title || "Stored message";
    } else {
      title = "Message";
    }
  }

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.container}>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.message}>{message?.message || ""}</Text>
          <Text style={styles.meta}>{formatDateDMYHM(message.createdAt)}</Text>
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Text style={styles.closeButtonText}>Close</Text>
          </TouchableOpacity>
        </View>
      </View>
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
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 16,
    textAlign: "center",
  },
  message: {
    color: "#fff",
    fontSize: 16,
    marginBottom: 24,
    textAlign: "center",
  },
  closeButton: {
    backgroundColor: "#e03487",
    borderRadius: 8,
    paddingVertical: 10,
    alignItems: "center",
  },
  closeButtonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 15,
  },
  meta: {
    color: "#b0b3c6",
    fontSize: 12,
    textAlign: "center",
    marginBottom: 12,
  },
});

export default ViewMessageModal;
