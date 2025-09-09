// external
import React from "react";
import {
  Modal,
  Text,
  TouchableWithoutFeedback,
  StyleSheet,
} from "react-native";
import { BlurView } from "expo-blur";
import LottieView from "lottie-react-native";

// animation files
import { animationMap } from "../../../utils/animations/getAnimation";
import defaultAnimation from "../../../assets/animations/hug.json";

// types
type InteractionAnimationModalProps = {
  visible: boolean;
  onClose: () => void;
  action: string | null;
  message: string;
};

const InteractionAnimationModal: React.FC<InteractionAnimationModalProps> = ({
  visible,
  onClose,
  action,
  message,
}) => {
  if (!visible || !action) {
    return null;
  }

  const animationSource = animationMap[action] || defaultAnimation;

  return (
    <Modal visible={visible} transparent animationType="fade">
      <TouchableWithoutFeedback onPress={onClose}>
        <TouchableWithoutFeedback onPress={() => {}}>
          <BlurView intensity={80} tint="dark" style={styles.overlay}>
            <LottieView
              source={animationSource}
              autoPlay
              loop={false}
              style={styles.animation}
              onAnimationFinish={onClose}
            />
            <Text style={styles.message}>{message}</Text>
          </BlurView>
        </TouchableWithoutFeedback>
      </TouchableWithoutFeedback>
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
  container: {
    backgroundColor: "rgba(5, 3, 12, 0.5)",
    borderRadius: 24,
    padding: 32,
    alignItems: "center",
    width: "80%",
    maxWidth: 300,
    overflow: "hidden",
  },
  animation: {
    width: 150,
    height: 150,
    marginBottom: 16,
  },
  message: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
    textAlign: "center",
    maxWidth: 225,
  },
});

export default InteractionAnimationModal;
