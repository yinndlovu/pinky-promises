// external
import React, { useState, useMemo, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";

// internal
import { SocialMediaPlatform, PLATFORM_NAMES } from "../../types/Streak";
import { formatTimeAgo } from "../../utils/formatters/formatDate";

// internal (hooks)
import { useTheme } from "../../theme/ThemeContext";
import { useAuth } from "../../contexts/AuthContext";
import useToken from "../../hooks/useToken";
import {
  useStreakData,
  useStreakHistory,
  useLogEndedStreak,
  useStopTracking,
} from "../../hooks/useStreak";
import { useProfilePicture } from "../../hooks/useProfilePicture";

// content
import PlatformIcon from "../../components/common/PlatformIcon";
import Shimmer from "../../components/skeletons/Shimmer";
import AlertModal from "../../components/modals/output/AlertModal";
import ProfileImage from "../../components/common/ProfileImage";

// types
type Props = NativeStackScreenProps<any>;

const StreakScreen: React.FC<Props> = ({ navigation }) => {
  // variables
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();
  const { user } = useAuth();
  const token = useToken();
  const styles = useMemo(() => createStyles(theme), [theme]);

  const basePrimaryColor = theme.colors.primary || "#e03487";
  const primaryColorWithoutAlpha =
    basePrimaryColor.length === 9
      ? basePrimaryColor.slice(0, 7)
      : basePrimaryColor;

  const addOpacity = (hex: string, opacity: string) => {
    return `${hex}${opacity}`;
  };

  // states
  const [expandedPlatform, setExpandedPlatform] =
    useState<SocialMediaPlatform | null>(null);
  const [alertMessage, setAlertMessage] = useState("");
  const [alertTitle, setAlertTitle] = useState("");
  const [showErrorAlert, setShowErrorAlert] = useState(false);
  const [showSuccessAlert, setShowSuccessAlert] = useState(false);
  const [userAvatarFetched, setUserAvatarFetched] = useState(false);
  const [partnerAvatarFetched, setPartnerAvatarFetched] = useState(false);

  // hooks
  const {
    data: streakData,
    isLoading,
    refetch: refetchStreakData,
  } = useStreakData(token, user?.id);
  const {
    data: historyData,
    isLoading: isLoadingHistory,
    refetch: refetchHistory,
  } = useStreakHistory(
    token,
    user?.id,
    expandedPlatform as SocialMediaPlatform
  );

  const logStreakMutation = useLogEndedStreak(token);
  const stopTrackingMutation = useStopTracking(token);

  // partner profile picture
  const {
    avatarUri: partnerAvatar,
    profilePicUpdatedAt: partnerProfilePicUpdatedAt,
    fetchPicture: fetchPartnerPicture,
  } = useProfilePicture(streakData?.partner?.id?.toString() || "", token);
  const {
    avatarUri: userAvatar,
    fetchPicture: fetchUserPicture,
    profilePicUpdatedAt: userProfilePicUpdatedAt,
  } = useProfilePicture(user?.id, token);

  // use effects
  useEffect(() => {
    if (user?.id && token) {
      Promise.resolve(fetchUserPicture()).finally(() =>
        setUserAvatarFetched(true)
      );
    }
  }, [user?.id, token, fetchUserPicture]);

  useEffect(() => {
    if (streakData?.partner?.id && token) {
      Promise.resolve(fetchPartnerPicture()).finally(() =>
        setPartnerAvatarFetched(true)
      );
    }
  }, [streakData?.partner?.id, token, fetchPartnerPicture]);

  // handlers
  const toggleExpand = (platform: SocialMediaPlatform) => {
    setExpandedPlatform(expandedPlatform === platform ? null : platform);
  };

  const handleLogStreak = async (
    accusedUserId: number,
    platform: SocialMediaPlatform
  ) => {
    try {
      await logStreakMutation.mutateAsync({
        accusedUserId,
        socialMedia: platform,
      });

      refetchStreakData();
      if (expandedPlatform) {
        refetchHistory();
      }
    } catch (error: any) {
      setAlertTitle("Couldn't Log");
      setAlertMessage(
        error.response?.data?.err ||
          error.message ||
          "For some weird reason, you couldn't record this detail."
      );
      setShowErrorAlert(true);
      console.error("Error logging streak:", error);
    }
  };

  const openLogStreakScreen = () => {
    navigation.navigate("LogStreakScreen", {
      platforms: streakData?.platforms || [],
      user: {
        id: Number(user?.id) || 0,
        name: user?.name || "You",
        avatar: userAvatar || undefined,
      },
      partner: {
        id: streakData?.partner?.id || 0,
        name: streakData?.partner?.name || "Partner",
        avatar: partnerAvatar || undefined,
      },
      onLog: handleLogStreak,
      loading: logStreakMutation.isPending,
    });
  };

  const handleStopTracking = async (platform: SocialMediaPlatform) => {
    try {
      await stopTrackingMutation.mutateAsync(platform);
      refetchStreakData();
      if (expandedPlatform) {
        refetchHistory();
      }
    } catch (error: any) {
      setAlertTitle("Couldn't Stop Tracking");
      setAlertMessage(
        error.response?.data?.err ||
          error.message ||
          "For some weird reason, you couldn't stop tracking."
      );
      setShowErrorAlert(true);
      console.error("Error stopping tracking:", error);
    }
  };

  if (!streakData?.isTracking) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <View style={styles.emptyState}>
          <Feather name="zap" size={64} color={theme.colors.muted} />
          <Text style={styles.emptyTitle}>No Active Tracking</Text>
          <Text style={styles.emptySubtitle}>
            Start tracking streaks from Settings
          </Text>
          <TouchableOpacity
            style={styles.goToSettingsButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.goToSettingsText}>Go to Settings</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Feather name="arrow-left" size={24} color={theme.colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Streak Tracking</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <LinearGradient
          colors={[addOpacity(primaryColorWithoutAlpha, "30"), "transparent"]}
          style={styles.titleGradient}
        >
          <Text style={styles.mainTitle}>See who keeps ending the streak</Text>
        </LinearGradient>

        {isLoading ? (
          <Shimmer height={200} radius={20} style={{ width: "100%" }} />
        ) : (
          <>
            {streakData?.platforms.map((platform) => {
              const platformData = streakData.byPlatform[platform];
              const isExpanded = expandedPlatform === platform;

              return (
                <View key={platform} style={styles.platformSection}>
                  <View style={styles.platformHeader}>
                    <View
                      style={[
                        styles.platformIconContainer,
                        platform === "snapchat" && {
                          backgroundColor: "#FFFC00",
                        },
                        platform === "tiktok" && { backgroundColor: "#000" },
                      ]}
                    >
                      <PlatformIcon
                        platform={platform}
                        size={20}
                        color={platform === "snapchat" ? "#000" : "#fff"}
                      />
                    </View>
                    <Text style={styles.platformTitle}>
                      {PLATFORM_NAMES[platform]}
                    </Text>
                    <TouchableOpacity
                      style={styles.stopTrackingButton}
                      onPress={() => handleStopTracking(platform)}
                    >
                      <Feather name="x" size={16} color={theme.colors.muted} />
                    </TouchableOpacity>
                  </View>

                  <View style={styles.usersComparisonRow}>
                    <View style={styles.userCompareCard}>
                      <View style={styles.userAvatarContainer}>
                        {userAvatar ? (
                          <ProfileImage
                            avatarUri={userAvatar}
                            avatarFetched={userAvatarFetched}
                            updatedAt={userProfilePicUpdatedAt}
                            style={styles.userAvatar}
                            userId={user?.id}
                          />
                        ) : (
                          <View style={styles.avatarPlaceholder}>
                            <Feather
                              name="user"
                              size={28}
                              color={theme.colors.muted}
                            />
                          </View>
                        )}
                      </View>
                      <Text style={styles.userCardName}>You</Text>
                      <Text style={styles.lastEndedText}>
                        {platformData?.user?.lastEnded
                          ? `Last: ${formatTimeAgo(
                              platformData.user.lastEnded
                            )}`
                          : "Never ended"}
                      </Text>
                      <View style={styles.countBadge}>
                        <Text style={styles.countNumber}>
                          {platformData?.user?.count || 0}
                        </Text>
                        <Text style={styles.countLabel}>times</Text>
                      </View>
                    </View>

                    <View style={styles.vsDivider}>
                      <Text style={styles.vsText}>VS</Text>
                    </View>

                    <View style={styles.userCompareCard}>
                      <View style={styles.userAvatarContainer}>
                        {partnerAvatar ? (
                          <ProfileImage
                            avatarUri={partnerAvatar}
                            avatarFetched={partnerAvatarFetched}
                            updatedAt={partnerProfilePicUpdatedAt}
                            style={styles.userAvatar}
                            userId={streakData?.partner?.id}
                          />
                        ) : (
                          <View style={styles.avatarPlaceholder}>
                            <Feather
                              name="user"
                              size={28}
                              color={theme.colors.muted}
                            />
                          </View>
                        )}
                      </View>
                      <Text style={styles.userCardName}>
                        {streakData?.partner?.name || "Partner"}
                      </Text>
                      <Text style={styles.lastEndedText}>
                        {platformData?.partner?.lastEnded
                          ? `Last: ${formatTimeAgo(
                              platformData.partner.lastEnded
                            )}`
                          : "Never ended"}
                      </Text>
                      <View style={styles.countBadge}>
                        <Text style={styles.countNumber}>
                          {platformData?.partner?.count || 0}
                        </Text>
                        <Text style={styles.countLabel}>times</Text>
                      </View>
                    </View>
                  </View>

                  <TouchableOpacity
                    style={styles.expandButton}
                    onPress={() => toggleExpand(platform)}
                  >
                    <Text style={styles.expandButtonText}>
                      {isExpanded ? "Hide History" : "View History"}
                    </Text>
                    <Feather
                      name={isExpanded ? "chevron-up" : "chevron-down"}
                      size={18}
                      color={theme.colors.primary}
                    />
                  </TouchableOpacity>

                  {isExpanded && (
                    <View style={styles.historyContainer}>
                      {isLoadingHistory ? (
                        <View style={styles.historyLoadingContainer}>
                          <ActivityIndicator
                            size="small"
                            color={theme.colors.primary}
                          />
                          <Text style={styles.historyLoadingText}>
                            Loading history...
                          </Text>
                        </View>
                      ) : historyData ? (
                        historyData.user.history.length === 0 &&
                        historyData.partner.history.length === 0 ? (
                          <Text style={styles.noHistoryText}>
                            No streak endings recorded yet
                          </Text>
                        ) : (
                          <>
                            {historyData.user.history.length > 0 && (
                              <View style={styles.historySection}>
                                <Text style={styles.historySectionTitle}>
                                  Your endings
                                </Text>
                                {historyData.user.history
                                  .slice(0, 5)
                                  .map((entry, index) => (
                                    <View
                                      key={entry.id}
                                      style={styles.historyItem}
                                    >
                                      <View style={styles.historyDot} />
                                      <Text style={styles.historyText}>
                                        You ended the streak{" "}
                                        {formatTimeAgo(entry.createdAt)}
                                      </Text>
                                    </View>
                                  ))}
                              </View>
                            )}

                            {historyData.partner.history.length > 0 && (
                              <View style={styles.historySection}>
                                <Text style={styles.historySectionTitle}>
                                  {historyData.partner.name}'s endings
                                </Text>
                                {historyData.partner.history
                                  .slice(0, 5)
                                  .map((entry, index) => (
                                    <View
                                      key={entry.id}
                                      style={styles.historyItem}
                                    >
                                      <View
                                        style={[
                                          styles.historyDot,
                                          {
                                            backgroundColor:
                                              theme.colors.primary,
                                          },
                                        ]}
                                      />
                                      <Text style={styles.historyText}>
                                        {historyData.partner.name} ended the
                                        streak {formatTimeAgo(entry.createdAt)}
                                      </Text>
                                    </View>
                                  ))}
                              </View>
                            )}
                          </>
                        )
                      ) : null}
                    </View>
                  )}
                </View>
              );
            })}
          </>
        )}

        <TouchableOpacity
          style={styles.logStreakButton}
          onPress={openLogStreakScreen}
        >
          <LinearGradient
            colors={[
              primaryColorWithoutAlpha,
              addOpacity(primaryColorWithoutAlpha, "CC"),
            ]}
            style={styles.logStreakGradient}
          >
            <Feather name="plus" size={22} color={theme.colors.text} />
            <Text style={styles.logStreakText}>Log Ended Streak</Text>
          </LinearGradient>
        </TouchableOpacity>
      </ScrollView>

      <AlertModal
        visible={showSuccessAlert}
        type="success"
        title={alertTitle}
        message={alertMessage}
        buttonText="Great"
        onClose={() => setShowSuccessAlert(false)}
      />

      <AlertModal
        visible={showErrorAlert}
        type="error"
        title={alertTitle}
        message={alertMessage}
        buttonText="Close"
        onClose={() => setShowErrorAlert(false)}
      />
    </View>
  );
};

const createStyles = (theme: ReturnType<typeof useTheme>["theme"]) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    header: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingHorizontal: 16,
      paddingVertical: 12,
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
    scrollView: {
      flex: 1,
    },
    scrollContent: {
      padding: 16,
      paddingBottom: 40,
    },
    titleGradient: {
      borderRadius: 16,
      padding: 20,
      marginBottom: 20,
    },
    mainTitle: {
      fontSize: 20,
      fontWeight: "bold",
      color: theme.colors.text,
      textAlign: "center",
    },
    platformSection: {
      backgroundColor: theme.colors.surfaceAlt,
      borderRadius: 20,
      padding: 20,
      marginBottom: 16,
    },
    platformHeader: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: 16,
    },
    platformIconContainer: {
      width: 36,
      height: 36,
      borderRadius: 10,
      justifyContent: "center",
      alignItems: "center",
      marginRight: 12,
    },
    platformTitle: {
      fontSize: 18,
      fontWeight: "bold",
      color: theme.colors.text,
      flex: 1,
    },
    stopTrackingButton: {
      width: 32,
      height: 32,
      borderRadius: 16,
      backgroundColor: theme.colors.cancelButton,
      justifyContent: "center",
      alignItems: "center",
    },
    usersComparisonRow: {
      flexDirection: "row",
      alignItems: "center",
    },
    userCompareCard: {
      flex: 1,
      alignItems: "center",
      padding: 12,
    },
    userAvatarContainer: {
      marginBottom: 10,
    },
    userAvatar: {
      width: 64,
      height: 64,
      borderRadius: 32,
    },
    avatarPlaceholder: {
      width: 64,
      height: 64,
      borderRadius: 32,
      backgroundColor: theme.colors.background,
      justifyContent: "center",
      alignItems: "center",
    },
    userCardName: {
      fontSize: 16,
      fontWeight: "600",
      color: theme.colors.text,
      marginBottom: 4,
    },
    lastEndedText: {
      fontSize: 12,
      color: theme.colors.muted,
      marginBottom: 10,
      textAlign: "center",
    },
    countBadge: {
      backgroundColor: theme.colors.background,
      paddingHorizontal: 16,
      paddingVertical: 8,
      borderRadius: 12,
      alignItems: "center",
    },
    countNumber: {
      fontSize: 24,
      fontWeight: "bold",
      color: theme.colors.primary,
    },
    countLabel: {
      fontSize: 12,
      color: theme.colors.muted,
    },
    vsDivider: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: theme.colors.background,
      justifyContent: "center",
      alignItems: "center",
    },
    vsText: {
      fontSize: 14,
      fontWeight: "bold",
      color: theme.colors.muted,
    },
    expandButton: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      marginTop: 12,
      paddingVertical: 10,
      gap: 6,
    },
    expandButtonText: {
      fontSize: 14,
      fontWeight: "600",
      color: theme.colors.primary,
    },
    historyContainer: {
      marginTop: 12,
      paddingTop: 12,
      borderTopWidth: 1,
      borderTopColor: theme.colors.background,
    },
    noHistoryText: {
      fontSize: 14,
      color: theme.colors.muted,
      textAlign: "center",
      paddingVertical: 12,
    },
    historyLoadingContainer: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      paddingVertical: 20,
      gap: 10,
    },
    historyLoadingText: {
      fontSize: 14,
      color: theme.colors.muted,
    },
    historySection: {
      marginBottom: 16,
    },
    historySectionTitle: {
      fontSize: 14,
      fontWeight: "600",
      color: theme.colors.text,
      marginBottom: 8,
    },
    historyItem: {
      flexDirection: "row",
      alignItems: "center",
      paddingVertical: 8,
      gap: 10,
    },
    historyDot: {
      width: 8,
      height: 8,
      borderRadius: 4,
      backgroundColor: theme.colors.muted,
    },
    historyText: {
      fontSize: 14,
      color: theme.colors.muted,
      flex: 1,
    },
    logStreakButton: {
      marginTop: 8,
      borderRadius: 16,
      overflow: "hidden",
    },
    logStreakGradient: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      paddingVertical: 16,
      gap: 10,
    },
    logStreakText: {
      fontSize: 17,
      fontWeight: "bold",
      color: theme.colors.text,
    },
    emptyState: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      padding: 40,
    },
    emptyTitle: {
      fontSize: 22,
      fontWeight: "bold",
      color: theme.colors.text,
      marginTop: 20,
      marginBottom: 8,
    },
    emptySubtitle: {
      fontSize: 16,
      color: theme.colors.muted,
      textAlign: "center",
      marginBottom: 24,
    },
    goToSettingsButton: {
      backgroundColor: theme.colors.primary,
      paddingHorizontal: 24,
      paddingVertical: 14,
      borderRadius: 12,
    },
    goToSettingsText: {
      fontSize: 16,
      fontWeight: "600",
      color: theme.colors.text,
    },
  });

export default StreakScreen;
