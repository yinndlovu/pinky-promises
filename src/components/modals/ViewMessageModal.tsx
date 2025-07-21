// external
import React from "react";
import { Modal, View, Text, TouchableOpacity, StyleSheet } from "react-native";

type Props = {
  visible: boolean;
  onClose: () => void;
  message: any | null;
  type: "sweet" | "vent";
};

const ViewMessageModal: React.FC<Props> = ({
  visible,
  onClose,
  message,
  type,
}) => {
    // utils
  function formatDate(dateString?: string) {
    if (!dateString) {
        return "";
    }

    const date = new Date(dateString);

    if (isNaN(date.getTime())) {
        return "";
    }

    return date
      .toLocaleString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      })
      .replace(",", "");
  }

  if (!message) {
    return null;
  }

  const title = type === "sweet" ? "Sweet message" : "Vent message";

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.container}>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.message}>{message?.message || ""}</Text>
          <Text style={styles.meta}>
            {formatDate(message.createdAt)}
          </Text>
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
