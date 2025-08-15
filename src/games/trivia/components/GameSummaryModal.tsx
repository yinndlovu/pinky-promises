import React from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Modal,
  Image,
  Dimensions,
} from "react-native";
import { Player } from "../types/Player";

interface GameSummaryModalProps {
  visible: boolean;
  onClose: () => void;
  onPlayAgain: () => void;
  players: Player[];
  category: string;
  totalQuestions: number;
  gameType: string;
}

const { width } = Dimensions.get("window");

const GameSummaryModal: React.FC<GameSummaryModalProps> = ({
  visible,
  onClose,
  onPlayAgain,
  players,
  category,
  totalQuestions,
  gameType,
}) => {
  return (
    <Modal
      animationType="slide"
      transparent
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          <View style={styles.handle} />

          <Text style={styles.title}>Game Over</Text>

          <Text style={styles.subTitle}>
            {gameType} - {category}
          </Text>
          <Text style={styles.subTitle}>Total Questions: {totalQuestions}</Text>

          <View style={styles.playersRow}>
            {players.map((p) => (
              <View key={p.id} style={styles.playerCard}>
                <Image source={{ uri: p.avatar }} style={styles.avatar} />
                <Text style={styles.playerName}>{p.name}</Text>
                <Text style={styles.playerScore}>{p.score}</Text>
              </View>
            ))}
          </View>

          <View style={styles.buttonsRow}>
            <Pressable style={styles.playAgainButton} onPress={onPlayAgain}>
              <Text style={styles.buttonText}>Play Again</Text>
            </Pressable>
            <Pressable style={styles.exitButton} onPress={onClose}>
              <Text style={styles.buttonText}>Exit</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default GameSummaryModal;

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "flex-end",
  },
  modalContainer: {
    backgroundColor: "#23243a",
    padding: 20,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    minHeight: 300,
    alignItems: "center",
  },
  handle: {
    width: 40,
    height: 5,
    backgroundColor: "#e03487",
    borderRadius: 2.5,
    marginBottom: 12,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 4,
  },
  subTitle: {
    fontSize: 14,
    color: "#b0b3c6",
    marginBottom: 2,
  },
  playersRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    width: width - 40,
    marginVertical: 16,
  },
  playerCard: {
    alignItems: "center",
    width: "45%",
    backgroundColor: "#2a2b44",
    padding: 10,
    borderRadius: 12,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginBottom: 8,
  },
  playerName: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
    marginBottom: 4,
  },
  playerScore: {
    color: "#e03487",
    fontSize: 20,
    fontWeight: "bold",
  },
  buttonsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: width - 40,
    marginTop: 12,
  },
  playAgainButton: {
    flex: 1,
    backgroundColor: "#e03487",
    paddingVertical: 12,
    borderRadius: 12,
    marginRight: 8,
    alignItems: "center",
  },
  exitButton: {
    flex: 1,
    backgroundColor: "#555",
    paddingVertical: 12,
    borderRadius: 12,
    marginLeft: 8,
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
});
