// external
import React, { useMemo } from "react";
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  TouchableWithoutFeedback,
} from "react-native";
import { BlurView } from "expo-blur";

// internal
import { useTheme } from "../../../theme/ThemeContext";

// types
type ActionsModalProps = {
  visible: boolean;
  onClose: () => void;
  onAction: (actionKey: string) => void;
};34

// actions
const ACTIONS = [
  { key: "kiss", label: "KISS" },
  { key: "hug", label: "HUG" },
  { key: "cuddle", label: "CUDDLE" },
  { key: "hold", label: "HOLD" },
  { key: "nudge", label: "NUDGE" },
  { key: "caress", label: "CARESS" },
  { key: "embrace", label: "EMBRACE" },
  { key: "wink", label: "WINK AT" },
  { key: "roll", label: "ROLL EYES" },
];

const ActionsModal: React.FC<ActionsModalProps> = ({
  visible,
  onClose,
  onAction,
}) => {
  // variables
  const { theme } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);

  return (
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
};

const createStyles = (theme: ReturnType<typeof useTheme>["theme"]) =>
  StyleSheet.create({
    overlay: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: theme.colors.modalOverlay,
      justifyContent: "center",
      alignItems: "center",
      zIndex: 1000,
    },
    actionsContainer: {
      backgroundColor: theme.colors.background,
      borderRadius: 20,
      padding: 24,
      alignItems: "center",
      width: "90%",
      maxWidth: 400,
    },
    title: {
      color: theme.colors.text,
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
      backgroundColor: theme.colors.actionButton,
      borderRadius: 12,
      paddingVertical: 16,
      alignItems: "center",
      width: "100%",
    },
    buttonText: {
      color: theme.colors.text,
      fontSize: 16,
      fontWeight: "bold",
      letterSpacing: 1,
      textTransform: "uppercase",
    },
  });

export default ActionsModal;
