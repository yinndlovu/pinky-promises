// external
import React, { useEffect } from "react";
import { Modal, View, Text, StyleSheet } from "react-native";
import LottieView, { AnimationObject } from "lottie-react-native";

// types
type AnimatedDialogProps = {
  visible: boolean;
  message: string;
  loop?: boolean;
  animation: AnimationObject;
  onFinish?: () => void;
  autoCloseAfter?: number;
  mode?: "modal" | "inline";
};

const AnimatedDialog: React.FC<AnimatedDialogProps> = ({
  visible,
  message,
  loop = false,
  animation,
  onFinish,
  autoCloseAfter = 5000,
  mode = "modal",
}) => {
  // use effects
  useEffect(() => {
    if (visible && onFinish) {
      const timer = setTimeout(() => {
        onFinish();
      }, autoCloseAfter);
      return () => clearTimeout(timer);
    }
  }, [visible]);

  if (!visible) {
    return null;
  }

  const isError =
    message.toLowerCase().includes("error") ||
    message.toLowerCase().includes("invalid") ||
    message.toLowerCase().includes("cannot") ||
    message.toLowerCase().includes("issues");

  const bubbleColor = isError ? "#ff9da6" : "#facafcff";

  const content = (
    <View
      style={[
        styles.container,
        mode === "inline" && { backgroundColor: "transparent", padding: 0 },
      ]}
    >
      <View style={styles.bubbleContainer}>
        <View style={[styles.bubble, { backgroundColor: bubbleColor }]}>
          <Text style={styles.message}>{message}</Text>
        </View>
        <View style={[styles.triangle, { borderTopColor: bubbleColor }]} />
      </View>
      <LottieView
        source={animation}
        autoPlay
        loop={loop}
        style={{ width: 180, height: 180 }}
      />
    </View>
  );

  if (mode === "inline") {
    return content;
  }

  return (
    <Modal visible transparent animationType="fade">
      <View style={styles.overlay}>{content}</View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "center",
    alignItems: "center",
  },
  container: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 40,
    paddingHorizontal: 30,
    borderRadius: 20,
  },
  bubbleContainer: {
    alignItems: "center",
    marginTop: 8,
  },
  bubble: {
    backgroundColor: "#facafcff",
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 20,
    maxWidth: 250,
  },
  triangle: {
    width: 0,
    height: 0,
    borderLeftWidth: 10,
    borderRightWidth: 10,
    borderTopWidth: 12,
    borderLeftColor: "transparent",
    borderRightColor: "transparent",
    borderTopColor: "#facafcff",
  },
  message: {
    color: "#000",
    fontSize: 15,
    textAlign: "center",
  },
});

export default AnimatedDialog;
