import React from "react";
import { Modal, View, Text, Pressable, StyleSheet } from "react-native";

interface GameInviteModal {
  visible: boolean;
  inviterName: string;
  gameName: string;
  onAccept: () => void;
  onDecline: () => void;
}

const GameInviteModal: React.FC<GameInviteModal> = ({
  visible,
  inviterName,
  gameName,
  onAccept,
  onDecline,
}) => {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onDecline}
    >
      <View style={styles.overlay}>
        <View style={styles.modal}>
          <Text style={styles.title}>Game Invite</Text>
          <Text style={styles.message}>
            {inviterName} invited you to play {gameName}!
          </Text>
          <View style={styles.buttonRow}>
            <Pressable
              style={({ pressed }) => [
                styles.button,
                styles.acceptButton,
                { opacity: pressed ? 0.7 : 1 },
              ]}
              onPress={onAccept}
            >
              <Text style={styles.buttonText}>Accept</Text>
            </Pressable>
            <Pressable
              style={({ pressed }) => [
                styles.button,
                styles.declineButton,
                { opacity: pressed ? 0.7 : 1 },
              ]}
              onPress={onDecline}
            >
              <Text style={styles.buttonText}>Decline</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modal: {
    backgroundColor: "#2a2b44",
    borderRadius: 12,
    padding: 16,
    width: "80%",
    alignItems: "center",
  },
  title: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 12,
  },
  message: {
    color: "#b0b3c6",
    fontSize: 16,
    textAlign: "center",
    marginBottom: 16,
  },
  buttonRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    width: "100%",
  },
  button: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    minWidth: "40%",
    alignItems: "center",
  },
  acceptButton: {
    backgroundColor: "#4caf50",
  },
  declineButton: {
    backgroundColor: "#f44336",
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
});

export default GameInviteModal;
