// external
import React, { useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Pressable,
} from "react-native";
import { Feather } from "@expo/vector-icons";

// internal
import { useTheme } from "../../../theme/ThemeContext";

// types
type Props = {
  visible: boolean;
  onClose: () => void;
  onSelectNew: () => void;
  onViewCurrent: () => void;
};

const ProfilePictureModal: React.FC<Props> = ({
  visible,
  onClose,
  onSelectNew,
  onViewCurrent,
}) => {
  // variables
  const { theme } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <TouchableOpacity style={styles.backdrop} onPress={onClose} />
        <View style={styles.modalContent}>
          <View style={styles.handle} />
          <TouchableOpacity style={styles.option} onPress={onSelectNew}>
            <Feather name="camera" size={24} color={theme.colors.primary} />
            <Text style={styles.optionText}>Select new picture</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.option} onPress={onViewCurrent}>
            <Feather name="eye" size={24} color={theme.colors.primary} />
            <Text style={styles.optionText}>View current picture</Text>
          </TouchableOpacity>
          <Pressable
            android_ripple={{ color: theme.colors.ripple }}
            style={styles.cancelButton}
            onPress={onClose}
          >
            <Text style={styles.cancelText}>Cancel</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
};

const createStyles = (theme: ReturnType<typeof useTheme>["theme"]) =>
  StyleSheet.create({
    modalOverlay: {
      flex: 1,
      backgroundColor: theme.colors.modalOverlay,
      justifyContent: "flex-end",
    },
    backdrop: {
      position: "absolute",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
    },
    modalContent: {
      backgroundColor: theme.colors.background,
      borderTopLeftRadius: 20,
      borderTopRightRadius: 20,
      paddingTop: 12,
      paddingBottom: 40,
      paddingHorizontal: 20,
      shadowColor: theme.colors.shadow,
      shadowOpacity: 0.3,
      shadowRadius: 20,
      elevation: 10,
    },
    handle: {
      width: 40,
      height: 4,
      backgroundColor: theme.colors.muted,
      borderRadius: 2,
      alignSelf: "center",
      marginBottom: 20,
      opacity: 0.6,
    },
    option: {
      flexDirection: "row",
      alignItems: "center",
      paddingVertical: 16,
      paddingHorizontal: 8,
      borderRadius: 12,
      marginBottom: 8,
    },
    optionText: {
      color: theme.colors.text,
      fontSize: 16,
      fontWeight: "500",
      marginLeft: 16,
    },
    cancelButton: {
      marginTop: 16,
      paddingVertical: 16,
      alignItems: "center",
      borderRadius: 12,
      backgroundColor: theme.colors.cancelButton,
    },
    cancelText: {
      color: theme.colors.text,
      fontSize: 16,
      fontWeight: "500",
    },
  });

export default ProfilePictureModal;
