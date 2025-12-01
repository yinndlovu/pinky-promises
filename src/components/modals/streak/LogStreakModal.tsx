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
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";

// internal
import { useTheme } from "../../../theme/ThemeContext";
import PlatformIcon from "../../common/PlatformIcon";
import { SocialMediaPlatform, PLATFORM_NAMES } from "../../../types/Streak";

// types
type LogStreakModalProps = {
  visible: boolean;
  onClose: () => void;
  onLog: (accusedUserId: number, platform: SocialMediaPlatform) => void;
  loading?: boolean;
  platforms: SocialMediaPlatform[];
  user: {
    id: number;
    name: string;
    avatar?: string;
  };
  partner: {
    id: number;
    name: string;
    avatar?: string;
  };
};

const LogStreakModal: React.FC<LogStreakModalProps> = ({
  visible,
  onClose,
  onLog,
  loading = false,
  platforms,
  user,
  partner,
}) => {
  // state
  const [selectedPlatform, setSelectedPlatform] =
    useState<SocialMediaPlatform | null>(null);
  const [selectedUser, setSelectedUser] = useState<number | null>(null);

  // variables
  const { theme } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);

  // handlers
  const handleLog = () => {
    if (selectedPlatform && selectedUser !== null) {
      onLog(selectedUser, selectedPlatform);
      resetAndClose();
    }
  };

  const resetAndClose = () => {
    setSelectedPlatform(null);
    setSelectedUser(null);
    onClose();
  };

  const canSubmit = selectedPlatform !== null && selectedUser !== null;

  return (
    <Modal visible={visible} transparent animationType="fade">
      <TouchableWithoutFeedback onPress={resetAndClose}>
        <View style={styles.overlay}>
          <TouchableWithoutFeedback onPress={() => {}}>
            <View style={styles.container}>
              <View style={styles.handle} />

              <View style={styles.iconContainer}>
                <LinearGradient
                  colors={["#FF4757", "#FF6B81"]}
                  style={styles.iconGradient}
                >
                  <Feather name="alert-triangle" size={28} color="#fff" />
                </LinearGradient>
              </View>

              <Text style={styles.title}>Log Ended Streak</Text>
              <Text style={styles.subtitle}>
                Who ended the streak and on which platform?
              </Text>

              <Text style={styles.sectionLabel}>Platform</Text>
              <View style={styles.platformsRow}>
                {platforms.map((platform) => (
                  <TouchableOpacity
                    key={platform}
                    style={[
                      styles.platformChip,
                      selectedPlatform === platform &&
                        styles.platformChipSelected,
                    ]}
                    onPress={() => setSelectedPlatform(platform)}
                    activeOpacity={0.7}
                  >
                    <View
                      style={[
                        styles.platformChipIcon,
                        platform === "snapchat" && {
                          backgroundColor: "#FFFC00",
                        },
                        platform === "tiktok" && { backgroundColor: "#000" },
                      ]}
                    >
                      <PlatformIcon
                        platform={platform}
                        size={18}
                        color={platform === "snapchat" ? "#000" : "#fff"}
                      />
                    </View>
                    <Text style={styles.platformChipText}>
                      {PLATFORM_NAMES[platform]}
                    </Text>
                    {selectedPlatform === platform && (
                      <Feather
                        name="check"
                        size={16}
                        color={theme.colors.primary}
                      />
                    )}
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={styles.sectionLabel}>Who ended it?</Text>
              <View style={styles.usersRow}>
                <TouchableOpacity
                  style={[
                    styles.userCard,
                    selectedUser === user.id && styles.userCardSelected,
                  ]}
                  onPress={() => setSelectedUser(user.id)}
                  activeOpacity={0.7}
                >
                  <View style={styles.avatarContainer}>
                    {user.avatar ? (
                      <Image
                        source={{ uri: user.avatar }}
                        style={styles.avatar}
                        contentFit="cover"
                      />
                    ) : (
                      <View style={styles.avatarPlaceholder}>
                        <Feather
                          name="user"
                          size={24}
                          color={theme.colors.muted}
                        />
                      </View>
                    )}
                    {selectedUser === user.id && (
                      <View style={styles.avatarCheck}>
                        <Feather name="check" size={12} color="#fff" />
                      </View>
                    )}
                  </View>
                  <Text style={styles.userName}>Me</Text>
                  <Text style={styles.userSubtext}>(Verified instantly)</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.userCard,
                    selectedUser === partner.id && styles.userCardSelected,
                  ]}
                  onPress={() => setSelectedUser(partner.id)}
                  activeOpacity={0.7}
                >
                  <View style={styles.avatarContainer}>
                    {partner.avatar ? (
                      <Image
                        source={{ uri: partner.avatar }}
                        style={styles.avatar}
                        contentFit="cover"
                      />
                    ) : (
                      <View style={styles.avatarPlaceholder}>
                        <Feather
                          name="user"
                          size={24}
                          color={theme.colors.muted}
                        />
                      </View>
                    )}
                    {selectedUser === partner.id && (
                      <View style={styles.avatarCheck}>
                        <Feather name="check" size={12} color="#fff" />
                      </View>
                    )}
                  </View>
                  <Text style={styles.userName}>{partner.name}</Text>
                  <Text style={styles.userSubtext}>(Needs confirmation)</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.buttonContainer}>
                <TouchableOpacity
                  style={styles.cancelButton}
                  onPress={resetAndClose}
                >
                  <Text style={styles.cancelText}>Cancel</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.logButton,
                    !canSubmit && styles.logButtonDisabled,
                  ]}
                  onPress={handleLog}
                  disabled={!canSubmit || loading}
                >
                  {loading ? (
                    <ActivityIndicator color={theme.colors.text} size={20} />
                  ) : (
                    <Text style={styles.logText}>Log Streak</Text>
                  )}
                </TouchableOpacity>
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
      maxWidth: 380,
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
      marginBottom: 20,
      lineHeight: 22,
    },
    sectionLabel: {
      color: theme.colors.text,
      fontSize: 14,
      fontWeight: "600",
      alignSelf: "flex-start",
      marginBottom: 12,
      textTransform: "uppercase",
      letterSpacing: 0.5,
    },
    platformsRow: {
      width: "100%",
      gap: 10,
      marginBottom: 20,
    },
    platformChip: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: theme.colors.surfaceAlt,
      borderRadius: 12,
      padding: 12,
      borderWidth: 2,
      borderColor: "transparent",
    },
    platformChipSelected: {
      borderColor: theme.colors.primary,
      backgroundColor: `${theme.colors.primary}15`,
    },
    platformChipIcon: {
      width: 32,
      height: 32,
      borderRadius: 8,
      justifyContent: "center",
      alignItems: "center",
      marginRight: 12,
    },
    platformChipText: {
      color: theme.colors.text,
      fontSize: 16,
      fontWeight: "500",
      flex: 1,
    },
    usersRow: {
      flexDirection: "row",
      width: "100%",
      gap: 12,
      marginBottom: 24,
    },
    userCard: {
      flex: 1,
      alignItems: "center",
      backgroundColor: theme.colors.surfaceAlt,
      borderRadius: 16,
      padding: 16,
      borderWidth: 2,
      borderColor: "transparent",
    },
    userCardSelected: {
      borderColor: theme.colors.primary,
      backgroundColor: `${theme.colors.primary}15`,
    },
    avatarContainer: {
      position: "relative",
      marginBottom: 10,
    },
    avatar: {
      width: 56,
      height: 56,
      borderRadius: 28,
    },
    avatarPlaceholder: {
      width: 56,
      height: 56,
      borderRadius: 28,
      backgroundColor: theme.colors.surfaceAlt,
      borderWidth: 2,
      borderColor: theme.colors.muted,
      justifyContent: "center",
      alignItems: "center",
    },
    avatarCheck: {
      position: "absolute",
      bottom: -2,
      right: -2,
      width: 22,
      height: 22,
      borderRadius: 11,
      backgroundColor: theme.colors.primary,
      justifyContent: "center",
      alignItems: "center",
      borderWidth: 2,
      borderColor: theme.colors.background,
    },
    userName: {
      color: theme.colors.text,
      fontSize: 15,
      fontWeight: "600",
      marginBottom: 4,
    },
    userSubtext: {
      color: theme.colors.muted,
      fontSize: 11,
      textAlign: "center",
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
    logButton: {
      flex: 1,
      paddingVertical: 14,
      paddingHorizontal: 20,
      borderRadius: 12,
      backgroundColor: theme.colors.primary,
      alignItems: "center",
    },
    logButtonDisabled: {
      opacity: 0.5,
    },
    logText: {
      color: theme.colors.text,
      fontSize: 16,
      fontWeight: "600",
    },
  });

export default LogStreakModal;
