// external
import React from "react";
import {
  View,
  Text,
  StyleSheet,
  Modal,
  Pressable,
  TouchableOpacity,
} from "react-native";

// interfaces
interface RequestGameModalProps {
  visible: boolean;
  isRequesting: boolean;
  onClose: () => void;
  onRequestGame: () => void;
  gameName: string;
}

const RequestGameModal: React.FC<RequestGameModalProps> = ({
  visible,
  onClose,
  isRequesting,
  onRequestGame,
  gameName,
}) => {
  return (
    <Modal
      animationType="fade"
      transparent
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={styles.backdrop}>
        <Pressable style={styles.backdrop} onPress={onClose} />
      </View>

      <View style={styles.modalContainer}>
        <View style={styles.handle} />

        <Text style={styles.title}>Start a game</Text>
        <Text style={styles.subtitle}>
          Invite Yin to play{" "}
          <Text style={{ fontWeight: "bold" }}>{gameName}</Text>
        </Text>

        <Pressable
          style={[styles.requestButton, isRequesting && { opacity: 0.7 }]}
          onPress={onRequestGame}
          android_ripple={{ color: "#a82f6aff" }}
          disabled={isRequesting}
        >
          <Text style={styles.requestButtonText}>
            {isRequesting ? "Requesting..." : "Request Game"}
          </Text>
        </Pressable>

        <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
          <Text style={styles.cancelButtonText}>Cancel</Text>
        </TouchableOpacity>
      </View>
    </Modal>
  );
};

export default RequestGameModal;

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  modalContainer: {
    position: "absolute",
    bottom: 0,
    width: "100%",
    backgroundColor: "#2a2b44",
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 32,
  },
  handle: {
    width: 50,
    height: 5,
    backgroundColor: "#e03487",
    borderRadius: 2.5,
    alignSelf: "center",
    marginBottom: 16,
  },
  title: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "bold",
    textAlign: "center",
  },
  subtitle: {
    color: "#b0b3c6",
    fontSize: 16,
    textAlign: "center",
    marginVertical: 12,
  },
  requestButton: {
    backgroundColor: "#e03487",
    paddingVertical: 14,
    borderRadius: 12,
    marginTop: 12,
    alignItems: "center",
  },
  requestButtonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
  cancelButton: {
    paddingVertical: 12,
    marginTop: 8,
    alignItems: "center",
  },
  cancelButtonText: {
    color: "#b0b3c6",
    fontSize: 16,
  },
});
