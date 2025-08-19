// external
import React, { useEffect, useRef } from "react";
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import type { ComponentProps } from "react";

// types
type IconName = ComponentProps<typeof MaterialCommunityIcons>["name"];
type AlertType = "info" | "success" | "error";
type AlertModalProps = {
  visible: boolean;
  title?: string;
  message: string;
  type?: AlertType;
  buttonText?: string;
  onClose: () => void;
};

const AlertModal: React.FC<AlertModalProps> = ({
  visible,
  title,
  message,
  type = "info",
  buttonText = "OK",
  onClose,
}) => {
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          useNativeDriver: true,
          friction: 6,
          tension: 50,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(opacityAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 0.8,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible]);

  const getIconData = (type: AlertType): { name: IconName; color: string } => {
    switch (type) {
      case "success":
        return {
          name: "check-circle",
          color: "#4CAF50",
        };
      case "error":
        return {
          name: "close-circle",
          color: "#f44336",
        };
      default:
        return {
          name: "information",
          color: "#2196F3",
        };
    }
  };

  const { name, color } = getIconData(type);

  return (
    <Modal visible={visible} transparent animationType="none">
      <View style={styles.overlay}>
        <Animated.View
          style={[
            styles.content,
            { opacity: opacityAnim, transform: [{ scale: scaleAnim }] },
          ]}
        >
          <MaterialCommunityIcons name={name} size={48} color={color} />
          {title && <Text style={styles.title}>{title}</Text>}
          <Text style={styles.message}>{message}</Text>
          <TouchableOpacity style={styles.okButton} onPress={onClose}>
            <Text style={styles.okButtonText}>{buttonText}</Text>
          </TouchableOpacity>
        </Animated.View>
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
  title: {
    color: "#fff",
    fontSize: 18,
    marginTop: 12,
    marginBottom: 6,
    textAlign: "center",
    fontWeight: "bold",
  },
  message: {
    color: "#fff",
    fontSize: 16,
    marginBottom: 24,
    textAlign: "center",
  },
  okButton: {
    backgroundColor: "#e03487",
    borderRadius: 14,
    paddingVertical: 12,
    width: "90%",
    alignSelf: "center",
    alignItems: "center",
  },
  okButtonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
});

export default AlertModal;
