// external
import React from "react";
import {
  Modal,
  TouchableWithoutFeedback,
  StyleSheet,
  View,
} from "react-native";
import LottieView from "lottie-react-native";

// animation files
import catFootprints from "../../assets/animations/cat-footprints.json";

// types
type ProcessingAnimationModalProps = {
  visible: boolean;
  onClose: () => void;
  size?: "small" | "medium" | "large";
};

const ProcessingAnimation: React.FC<ProcessingAnimationModalProps> = ({
  visible,
  onClose,
  size = "medium",
}) => {
  if (!visible) {
    return null;
  }

  const animationSource = catFootprints;

  // helpers
  const getSizeStyles = () => {
    switch (size) {
      case "small":
        return { animationSize: 100 };
      case "large":
        return { animationSize: 200 };
      default:
        return { animationSize: 150 };
    }
  };

  const { animationSize } = getSizeStyles();

  return (
    <Modal visible={visible} transparent animationType="fade">
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.overlay}>
          <View style={styles.content}>
            <LottieView
              source={animationSource}
              autoPlay
              loop={true}
              style={[
                styles.animation,
                { width: animationSize, height: animationSize },
              ]}
            />
          </View>
        </View>
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
  content: {
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  animation: {
    marginBottom: 16,
  },
  message: {
    color: "#e03487",
    fontWeight: "bold",
    textAlign: "center",
    maxWidth: 225,
  },
});

export default ProcessingAnimation;
