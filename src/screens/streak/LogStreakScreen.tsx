// external
import React, { useState, useMemo } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
  TouchableWithoutFeedback,
  Platform,
  Keyboard,
  ScrollView,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { SafeAreaView } from "react-native-safe-area-context";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";

// internal
import { useTheme } from "../../theme/ThemeContext";
import PlatformIcon from "../../components/common/PlatformIcon";
import { SocialMediaPlatform, PLATFORM_NAMES } from "../../types/Streak";
import { HomeStackParamList } from "../../types/StackParamList";

// types
type Props = NativeStackScreenProps<HomeStackParamList, "LogStreakScreen">;

const LogStreakScreen: React.FC<Props> = ({ navigation, route }) => {
  const { platforms, user, partner, onLog, loading = false } = route.params;

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
      navigation.goBack();
    }
  };

  const canSubmit = selectedPlatform !== null && selectedUser !== null;

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 0}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            <View style={styles.header}>
              <TouchableOpacity
                style={styles.backButton}
                onPress={() => navigation.goBack()}
              >
                <Feather name="arrow-left" size={24} color={theme.colors.text} />
              </TouchableOpacity>
              <Text style={styles.headerTitle}>Log Ended Streak</Text>
              <View style={{ width: 40 }} />
            </View>

            <View style={styles.iconContainer}>
              <LinearGradient
                colors={["#FF4757", "#FF6B81"]}
                style={styles.iconGradient}
              >
                <Feather name="alert-triangle" size={32} color="#fff" />
              </LinearGradient>
            </View>

            <Text style={styles.title}>Who ended the streak?</Text>
            <Text style={styles.subtitle}>
              Select the platform and who let the streak end
            </Text>

            <Text style={styles.sectionLabel}>Platform</Text>
            <View style={styles.platformsRow}>
              {platforms.map((platform) => (
                <TouchableOpacity
                  key={platform}
                  style={[
                    styles.platformChip,
                    selectedPlatform === platform && styles.platformChipSelected,
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
                onPress={() => navigation.goBack()}
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
          </ScrollView>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const createStyles = (theme: ReturnType<typeof useTheme>["theme"]) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    keyboardView: {
      flex: 1,
    },
    scrollView: {
      flex: 1,
    },
    scrollContent: {
      flexGrow: 1,
      padding: 20,
    },
    header: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      marginBottom: 24,
    },
    backButton: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: theme.colors.surfaceAlt,
      justifyContent: "center",
      alignItems: "center",
    },
    headerTitle: {
      fontSize: 18,
      fontWeight: "600",
      color: theme.colors.text,
    },
    iconContainer: {
      alignItems: "center",
      marginBottom: 20,
    },
    iconGradient: {
      width: 72,
      height: 72,
      borderRadius: 36,
      justifyContent: "center",
      alignItems: "center",
    },
    title: {
      color: theme.colors.text,
      fontSize: 24,
      fontWeight: "bold",
      marginBottom: 8,
      textAlign: "center",
    },
    subtitle: {
      color: theme.colors.muted,
      fontSize: 15,
      textAlign: "center",
      marginBottom: 28,
      lineHeight: 22,
    },
    sectionLabel: {
      color: theme.colors.text,
      fontSize: 14,
      fontWeight: "600",
      marginBottom: 12,
      textTransform: "uppercase",
      letterSpacing: 0.5,
    },
    platformsRow: {
      gap: 10,
      marginBottom: 24,
    },
    platformChip: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: theme.colors.surfaceAlt,
      borderRadius: 14,
      padding: 14,
      borderWidth: 2,
      borderColor: "transparent",
    },
    platformChipSelected: {
      borderColor: theme.colors.primary,
      backgroundColor: `${theme.colors.primary}15`,
    },
    platformChipIcon: {
      width: 36,
      height: 36,
      borderRadius: 10,
      justifyContent: "center",
      alignItems: "center",
      marginRight: 14,
    },
    platformChipText: {
      color: theme.colors.text,
      fontSize: 16,
      fontWeight: "500",
      flex: 1,
    },
    usersRow: {
      flexDirection: "row",
      gap: 14,
      marginBottom: 32,
    },
    userCard: {
      flex: 1,
      alignItems: "center",
      backgroundColor: theme.colors.surfaceAlt,
      borderRadius: 18,
      padding: 20,
      borderWidth: 2,
      borderColor: "transparent",
    },
    userCardSelected: {
      borderColor: theme.colors.primary,
      backgroundColor: `${theme.colors.primary}15`,
    },
    avatarContainer: {
      position: "relative",
      marginBottom: 12,
    },
    avatar: {
      width: 64,
      height: 64,
      borderRadius: 32,
    },
    avatarPlaceholder: {
      width: 64,
      height: 64,
      borderRadius: 32,
      backgroundColor: theme.colors.background,
      borderWidth: 2,
      borderColor: theme.colors.muted,
      justifyContent: "center",
      alignItems: "center",
    },
    avatarCheck: {
      position: "absolute",
      bottom: -2,
      right: -2,
      width: 24,
      height: 24,
      borderRadius: 12,
      backgroundColor: theme.colors.primary,
      justifyContent: "center",
      alignItems: "center",
      borderWidth: 2,
      borderColor: theme.colors.background,
    },
    userName: {
      color: theme.colors.text,
      fontSize: 16,
      fontWeight: "600",
      marginBottom: 4,
    },
    userSubtext: {
      color: theme.colors.muted,
      fontSize: 12,
      textAlign: "center",
    },
    buttonContainer: {
      flexDirection: "row",
      gap: 14,
      marginTop: "auto",
    },
    cancelButton: {
      flex: 1,
      paddingVertical: 16,
      paddingHorizontal: 20,
      borderRadius: 14,
      backgroundColor: theme.colors.surfaceAlt,
      alignItems: "center",
    },
    cancelText: {
      color: theme.colors.muted,
      fontSize: 16,
      fontWeight: "600",
    },
    logButton: {
      flex: 1,
      paddingVertical: 16,
      paddingHorizontal: 20,
      borderRadius: 14,
      backgroundColor: theme.colors.primary,
      alignItems: "center",
    },
    logButtonDisabled: {
      opacity: 0.5,
    },
    logText: {
      color: "#fff",
      fontSize: 16,
      fontWeight: "600",
    },
  });

export default LogStreakScreen;
