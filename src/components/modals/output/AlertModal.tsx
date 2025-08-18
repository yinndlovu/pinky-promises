// external
import React from "react";
import { Modal, View, Text, TouchableOpacity, StyleSheet } from "react-native";

// types
type AlertModalProps = {
  visible: boolean;
  message: string;
  onClose: () => void;
};

const AlertModal: React.FC<AlertModalProps> = ({
  visible,
  message,
  onClose,
}) => (
  <Modal visible={visible} transparent animationType="fade">
    <View style={styles.overlay}>
      <View style={styles.content}>
        <Text style={styles.message}>{message}</Text>
        <TouchableOpacity style={styles.okButton} onPress={onClose}>
          <Text style={styles.okButtonText}>OK</Text>
        </TouchableOpacity>
      </View>
    </View>
  </Modal>
);

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(5, 3, 12, 0.7)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1000,
  },
  content: {
    backgroundColor: "#23243a",
    borderRadius: 16,
    padding: 28,
    alignItems: "center",
    width: "80%",
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 5,
  },
  message: {
    color: "#fff",
    fontSize: 17,
    marginBottom: 24,
    textAlign: "center",
    fontWeight: "bold",
  },
  okButton: {
    backgroundColor: "#e03487",
    borderRadius: 14,
    paddingVertical: 14,
    width: "90%",
    alignSelf: "center",
    alignItems: "center",
  },
  okButtonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
});

export default AlertModal;
