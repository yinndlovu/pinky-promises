import React from "react";
import { Modal, View, Text, TouchableOpacity, StyleSheet } from "react-native";

type ClaimedGiftModalProps = {
  visible: boolean;
  giftName: string;
  value: string;
  message: string;
  onClose: () => void;
};

const ClaimedGiftModal: React.FC<ClaimedGiftModalProps> = ({
  visible,
  giftName,
  value,
  message,
  onClose,
}) => (
  <Modal visible={visible} transparent animationType="fade">
    <View style={styles.overlay}>
      <View style={styles.content}>
        <Text style={styles.title}>Gift successfully claimed</Text>
        <Text style={styles.giftName}>{giftName}</Text>
        <View style={styles.valueContainer}>
          <Text style={styles.valueText}>{value}</Text>
        </View>
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
  title: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 12,
    textAlign: "center",
  },
  giftName: {
    color: "#e03487",
    fontSize: 17,
    fontWeight: "bold",
    marginBottom: 10,
    textAlign: "center",
  },
  valueContainer: {
    backgroundColor: "#18192b",
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 18,
    marginBottom: 14,
  },
  valueText: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "bold",
    textAlign: "center",
  },
  message: {
    color: "#b0b3c6",
    fontSize: 15,
    marginBottom: 24,
    textAlign: "center",
  },
  okButton: {
    backgroundColor: "#e03487",
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 36,
    alignItems: "center",
  },
  okButtonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
});

export default ClaimedGiftModal;
