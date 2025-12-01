// external
import React, { useMemo } from "react";
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  TouchableWithoutFeedback,
  ActivityIndicator,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";

// internal
import { useTheme } from "../../../theme/ThemeContext";
import PlatformIcon from "../../common/PlatformIcon";
import { SocialMediaPlatform, PLATFORM_NAMES } from "../../../types/Streak";

// types
type ConfirmStreakModalProps = {
  visible: boolean;
  onClose: () => void;
  onConfirm: (confirmed: boolean) => void;
  loading?: boolean;
  streak: {
    id: number;
    partnerName: string;
    socialMedia: SocialMediaPlatform;
    createdAt: string;
  } | null;
};

const ConfirmStreakModal: React.FC<ConfirmStreakModalProps> = ({
  visible,
  onClose,
  onConfirm,
  loading = false,
  streak,
}) => {
  // variables
  const { theme } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);

  if (!streak) return null;

  const platformName = PLATFORM_NAMES[streak.socialMedia];

  return (
    <Modal visible={visible} transparent animationType="fade">
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.overlay}>
          <TouchableWithoutFeedback onPress={() => {}}>
            <View style={styles.container}>
              <View style={styles.handle} />

              <View style={styles.iconContainer}>
                <LinearGradient
                  colors={["#5B86E5", "#36D1DC"]}
                  style={styles.iconGradient}
                >
                  <Feather name="help-circle" size={28} color="#fff" />
                </LinearGradient>
              </View>

              <Text style={styles.title}>Streak Accusation</Text>

              <View style={styles.messageContainer}>
                <Text style={styles.accuserName}>{streak.partnerName}</Text>
                <Text style={styles.messageText}>
                  is saying you ended the streak on
                </Text>
                <View style={styles.platformBadge}>
                  <View
                    style={[
                      styles.platformIconSmall,
                      streak.socialMedia === "snapchat" && {
                        backgroundColor: "#FFFC00",
                      },
                      streak.socialMedia === "tiktok" && {
                        backgroundColor: "#000",
                      },
                    ]}
                  >
                    <PlatformIcon
                      platform={streak.socialMedia}
                      size={16}
                      color={
                        streak.socialMedia === "snapchat" ? "#000" : "#fff"
                      }
                    />
                  </View>
                  <Text style={styles.platformName}>{platformName}</Text>
                </View>
              </View>

              <Text style={styles.questionText}>
                Did you end the streak?
              </Text>

              <View style={styles.buttonContainer}>
                <TouchableOpacity
                  style={styles.denyButton}
                  onPress={() => onConfirm(false)}
                  disabled={loading}
                >
                  {loading ? (
                    <ActivityIndicator color={theme.colors.text} size={18} />
                  ) : (
                    <>
                      <Feather name="x" size={18} color={theme.colors.text} />
                      <Text style={styles.denyText}>No, I didn't</Text>
                    </>
                  )}
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.confirmButton}
                  onPress={() => onConfirm(true)}
                  disabled={loading}
                >
                  {loading ? (
                    <ActivityIndicator color={theme.colors.text} size={18} />
                  ) : (
                    <>
                      <Feather
                        name="check"
                        size={18}
                        color={theme.colors.text}
                      />
                      <Text style={styles.confirmText}>Yes, I did</Text>
                    </>
                  )}
                </TouchableOpacity>
              </View>

              <TouchableOpacity
                style={styles.laterButton}
                onPress={onClose}
              >
                <Text style={styles.laterText}>Answer later</Text>
              </TouchableOpacity>
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
    container: {
      backgroundColor: theme.colors.background,
      borderRadius: 24,
      paddingTop: 12,
      paddingBottom: 24,
      paddingHorizontal: 24,
      width: "90%",
      maxWidth: 360,
      alignItems: "center",
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
      marginBottom: 20,
      opacity: 0.6,
    },
    iconContainer: {
      marginBottom: 16,
    },
    iconGradient: {
      width: 64,
      height: 64,
      borderRadius: 32,
      justifyContent: "center",
      alignItems: "center",
    },
    title: {
      color: theme.colors.text,
      fontSize: 22,
      fontWeight: "bold",
      marginBottom: 20,
      textAlign: "center",
    },
    messageContainer: {
      alignItems: "center",
      marginBottom: 20,
    },
    accuserName: {
      color: theme.colors.primary,
      fontSize: 18,
      fontWeight: "bold",
      marginBottom: 4,
    },
    messageText: {
      color: theme.colors.text,
      fontSize: 16,
      textAlign: "center",
      marginBottom: 12,
    },
    platformBadge: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: theme.colors.surfaceAlt,
      borderRadius: 12,
      paddingVertical: 10,
      paddingHorizontal: 16,
      gap: 10,
    },
    platformIconSmall: {
      width: 28,
      height: 28,
      borderRadius: 7,
      justifyContent: "center",
      alignItems: "center",
    },
    platformName: {
      color: theme.colors.text,
      fontSize: 16,
      fontWeight: "600",
    },
    questionText: {
      color: theme.colors.muted,
      fontSize: 15,
      textAlign: "center",
      marginBottom: 20,
    },
    buttonContainer: {
      flexDirection: "row",
      width: "100%",
      gap: 12,
      marginBottom: 12,
    },
    denyButton: {
      flex: 1,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      paddingVertical: 14,
      paddingHorizontal: 16,
      borderRadius: 12,
      backgroundColor: theme.colors.cancelButton,
      gap: 8,
    },
    denyText: {
      color: theme.colors.text,
      fontSize: 15,
      fontWeight: "600",
    },
    confirmButton: {
      flex: 1,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      paddingVertical: 14,
      paddingHorizontal: 16,
      borderRadius: 12,
      backgroundColor: theme.colors.primary,
      gap: 8,
    },
    confirmText: {
      color: theme.colors.text,
      fontSize: 15,
      fontWeight: "600",
    },
    laterButton: {
      paddingVertical: 10,
      paddingHorizontal: 20,
    },
    laterText: {
      color: theme.colors.muted,
      fontSize: 14,
      fontWeight: "500",
    },
  });

export default ConfirmStreakModal;

