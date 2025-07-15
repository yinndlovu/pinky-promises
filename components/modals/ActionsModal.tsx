import React from "react";
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  TouchableWithoutFeedback,
} from "react-native";
import { BlurView } from "expo-blur";

type ActionsModalProps = {
  visible: boolean;
  onClose: () => void;
  onAction: (actionKey: string) => void;
};

const ACTIONS = [
  { key: "kiss", label: "KISS" },
  { key: "hug", label: "HUG" },
  { key: "cuddle", label: "CUDDLE" },
  { key: "hold", label: "HOLD" },
  { key: "nudge", label: "NUDGE" },
  { key: "caress", label: "CARESS" },
  { key: "embrace", label: "EMBRACE" },
  { key: "wink", label: "WINK AT"}
];

const ActionsModal: React.FC<ActionsModalProps> = ({
  visible,
  onClose,
  onAction,
}) => (
  <Modal visible={visible} transparent animationType="fade">
    <TouchableWithoutFeedback onPress={onClose}>
      <View style={styles.overlay}>
        <TouchableWithoutFeedback onPress={() => {}}>
          <View style={styles.actionsContainer}>
            <Text style={styles.title}>What do you want to do?</Text>
            <View style={styles.grid}>
              {ACTIONS.map((action) => (
                <BlurView
                  key={action.key}
                  intensity={50}
                  tint="dark"
                  style={styles.blurButton}
                >
                  <TouchableOpacity
                    style={styles.actionButton}
                    onPress={() => onAction(action.key)}
                  >
                    <Text style={styles.buttonText}>{action.label}</Text>
                  </TouchableOpacity>
                </BlurView>
              ))}
            </View>
          </View>
        </TouchableWithoutFeedback>
      </View>
    </TouchableWithoutFeedback>
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
  actionsContainer: {
    backgroundColor: "#23243a",
    borderRadius: 20,
    padding: 24,
    alignItems: "center",
    width: "90%",
    maxWidth: 400,
  },
  title: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 18,
    textAlign: "center",
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    width: "100%",
  },
  blurButton: {
    width: "30%",
    margin: "1.5%",
    borderRadius: 12,
    overflow: "hidden",
  },
  actionButton: {
    backgroundColor: "rgba(194, 58, 124, 0.3)",
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: "center",
    width: "100%",
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
    letterSpacing: 1,
    textTransform: "uppercase",
  },
});

export default ActionsModal;
