// external
import React, { useMemo } from "react";
import {
  Modal,
  TouchableWithoutFeedback,
  StyleSheet,
  View,
} from "react-native";
import LottieView from "lottie-react-native";

// animation files
import catFootprints from "../../assets/animations/cat-footprints.json";
import { useTheme } from "../../theme/ThemeContext";

// types
type LoadingAnimationModalProps = {
  visible: boolean;
  onClose: () => void;
  size?: "small" | "medium" | "large";
};

const LoadingAnimation: React.FC<LoadingAnimationModalProps> = ({
  visible,
  onClose,
  size = "medium",
}) => {
  // variables
  const { theme } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);

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

const createStyles = (theme: ReturnType<typeof useTheme>["theme"]) =>
  StyleSheet.create({
    overlay: {
      ...StyleSheet.absoluteFillObject,
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
      color: theme.colors.accent,
      fontWeight: "bold",
      textAlign: "center",
      maxWidth: 225,
    },
  });

export default LoadingAnimation;
