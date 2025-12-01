// external
import React, { useState, useMemo } from "react";
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
type StartTrackingModalProps = {
  visible: boolean;
  onClose: () => void;
  onStart: (platforms: SocialMediaPlatform[]) => void;
  loading?: boolean;
  currentlyTracking?: SocialMediaPlatform[];
};

const PLATFORMS: SocialMediaPlatform[] = ["snapchat", "tiktok"];

const StartTrackingModal: React.FC<StartTrackingModalProps> = ({
  visible,
  onClose,
  onStart,
  loading = false,
  currentlyTracking = [],
}) => {
  // state
  const [selected, setSelected] = useState<SocialMediaPlatform[]>([]);

  // variables
  const { theme } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);

  // handlers
  const togglePlatform = (platform: SocialMediaPlatform) => {
    if (currentlyTracking.includes(platform)) return; // Already tracking
    setSelected((prev) =>
      prev.includes(platform)
        ? prev.filter((p) => p !== platform)
        : [...prev, platform]
    );
  };

  const handleStart = () => {
    if (selected.length > 0) {
      onStart(selected);
      setSelected([]);
    }
  };

  const handleClose = () => {
    setSelected([]);
    onClose();
  };

  const availablePlatforms = PLATFORMS.filter(
    (p) => !currentlyTracking.includes(p)
  );

  return (
    <Modal visible={visible} transparent animationType="fade">
      <TouchableWithoutFeedback onPress={handleClose}>
        <View style={styles.overlay}>
          <TouchableWithoutFeedback onPress={() => {}}>
            <View style={styles.container}>
              <View style={styles.handle} />

              <View style={styles.iconContainer}>
                <LinearGradient
                  colors={["#FF6B6B", "#FF8E53"]}
                  style={styles.iconGradient}
                >
                  <Feather name="zap" size={28} color="#fff" />
                </LinearGradient>
              </View>

              <Text style={styles.title}>Start Tracking Streaks</Text>
              <Text style={styles.subtitle}>
                Select the platforms you want to track streaks for
              </Text>

              {availablePlatforms.length === 0 ? (
                <View style={styles.alreadyTrackingContainer}>
                  <Feather
                    name="check-circle"
                    size={24}
                    color={theme.colors.primary}
                  />
                  <Text style={styles.alreadyTrackingText}>
                    You're already tracking all platforms!
                  </Text>
                </View>
              ) : (
                <View style={styles.platformsContainer}>
                  {PLATFORMS.map((platform) => {
                    const isTracking = currentlyTracking.includes(platform);
                    const isSelected = selected.includes(platform);
                    const isActive = isSelected || isTracking;

                    return (
                      <TouchableOpacity
                        key={platform}
                        style={[
                          styles.platformButton,
                          isActive && styles.platformButtonActive,
                          isTracking && styles.platformButtonDisabled,
                        ]}
                        onPress={() => togglePlatform(platform)}
                        disabled={isTracking}
                        activeOpacity={0.7}
                      >
                        <View
                          style={[
                            styles.platformIconContainer,
                            platform === "snapchat" && {
                              backgroundColor: "#FFFC00",
                            },
                            platform === "tiktok" && {
                              backgroundColor: "#000",
                            },
                          ]}
                        >
                          <PlatformIcon
                            platform={platform}
                            size={28}
                            color={platform === "snapchat" ? "#000" : "#fff"}
                          />
                        </View>
                        <Text style={styles.platformName}>
                          {PLATFORM_NAMES[platform]}
                        </Text>
                        {isTracking && (
                          <View style={styles.trackingBadge}>
                            <Text style={styles.trackingBadgeText}>
                              Tracking
                            </Text>
                          </View>
                        )}
                        {isSelected && !isTracking && (
                          <View style={styles.checkContainer}>
                            <Feather
                              name="check"
                              size={18}
                              color={theme.colors.text}
                            />
                          </View>
                        )}
                      </TouchableOpacity>
                    );
                  })}
                </View>
              )}

              <View style={styles.buttonContainer}>
                <TouchableOpacity
                  style={styles.cancelButton}
                  onPress={handleClose}
                >
                  <Text style={styles.cancelText}>Cancel</Text>
                </TouchableOpacity>

                {availablePlatforms.length > 0 && (
                  <TouchableOpacity
                    style={[
                      styles.startButton,
                      selected.length === 0 && styles.startButtonDisabled,
                    ]}
                    onPress={handleStart}
                    disabled={selected.length === 0 || loading}
                  >
                    {loading ? (
                      <ActivityIndicator color={theme.colors.text} size={20} />
                    ) : (
                      <Text style={styles.startText}>Start Tracking</Text>
                    )}
                  </TouchableOpacity>
                )}
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
      marginBottom: 8,
      textAlign: "center",
    },
    subtitle: {
      color: theme.colors.muted,
      fontSize: 15,
      textAlign: "center",
      marginBottom: 24,
      lineHeight: 22,
    },
    platformsContainer: {
      width: "100%",
      gap: 12,
      marginBottom: 24,
    },
    platformButton: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: theme.colors.surfaceAlt,
      borderRadius: 16,
      padding: 16,
      borderWidth: 2,
      borderColor: "transparent",
    },
    platformButtonActive: {
      borderColor: theme.colors.primary,
      backgroundColor: `${theme.colors.primary}15`,
    },
    platformButtonDisabled: {
      opacity: 0.6,
      borderColor: theme.colors.muted,
    },
    platformIconContainer: {
      width: 48,
      height: 48,
      borderRadius: 12,
      justifyContent: "center",
      alignItems: "center",
      marginRight: 14,
    },
    platformName: {
      color: theme.colors.text,
      fontSize: 17,
      fontWeight: "600",
      flex: 1,
    },
    trackingBadge: {
      backgroundColor: theme.colors.primary,
      paddingHorizontal: 10,
      paddingVertical: 4,
      borderRadius: 8,
    },
    trackingBadgeText: {
      color: theme.colors.text,
      fontSize: 12,
      fontWeight: "600",
    },
    checkContainer: {
      width: 28,
      height: 28,
      borderRadius: 14,
      backgroundColor: theme.colors.primary,
      justifyContent: "center",
      alignItems: "center",
    },
    alreadyTrackingContainer: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: theme.colors.surfaceAlt,
      borderRadius: 12,
      padding: 16,
      marginBottom: 24,
      gap: 12,
    },
    alreadyTrackingText: {
      color: theme.colors.text,
      fontSize: 15,
      flex: 1,
    },
    buttonContainer: {
      flexDirection: "row",
      width: "100%",
      gap: 12,
    },
    cancelButton: {
      flex: 1,
      paddingVertical: 14,
      paddingHorizontal: 20,
      borderRadius: 12,
      backgroundColor: theme.colors.cancelButton,
      alignItems: "center",
    },
    cancelText: {
      color: theme.colors.muted,
      fontSize: 16,
      fontWeight: "600",
    },
    startButton: {
      flex: 1,
      paddingVertical: 14,
      paddingHorizontal: 20,
      borderRadius: 12,
      backgroundColor: theme.colors.primary,
      alignItems: "center",
    },
    startButtonDisabled: {
      opacity: 0.5,
    },
    startText: {
      color: theme.colors.text,
      fontSize: 16,
      fontWeight: "600",
    },
  });

export default StartTrackingModal;

