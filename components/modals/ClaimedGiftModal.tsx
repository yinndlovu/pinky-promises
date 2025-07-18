import React, { useState } from "react";
import { Modal, View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import * as Clipboard from "expo-clipboard";

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
}) => {
  const [showToast, setShowToast] = useState(false);

  const handleCopy = async () => {
    await Clipboard.setStringAsync(value);
    
    setShowToast(true);
    setTimeout(() => setShowToast(false), 1800);
  };

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.content}>
          {showToast && (
            <View style={styles.toast}>
              <Text style={styles.toastText}>Copied</Text>
            </View>
          )}
          <MaterialCommunityIcons
            name="gift"
            size={54}
            color="#e03487"
            style={{ marginBottom: 10 }}
          />
          <Text style={styles.giftName}>{giftName}</Text>
          <TouchableOpacity
            style={styles.valueContainer}
            onLongPress={handleCopy}
            delayLongPress={300}
            activeOpacity={0.7}
          >
            <Text style={styles.valueText}>{value}</Text>
          </TouchableOpacity>
          <Text style={styles.message}>{message}</Text>
          <TouchableOpacity style={styles.okButton} onPress={onClose}>
            <Text style={styles.okButtonText}>Yay</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

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
  giftName: {
    color: "#fcfafa",
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
  toast: {
    position: "absolute",
    top: 10,
    left: 120,
    right: 120,
    backgroundColor: "#e03487",
    padding: 5,
    borderRadius: 10,
    alignItems: "center",
    zIndex: 100,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
    alignSelf: "center",
  },
  toastText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 12,
  },
});

export default ClaimedGiftModal;
