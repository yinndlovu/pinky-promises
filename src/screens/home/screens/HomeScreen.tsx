// external
import React, { useState, useEffect, useCallback, useMemo } from "react";
import { ScrollView, View, Text, TouchableOpacity } from "react-native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { Feather } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { BlurView } from "expo-blur";
import { useFocusEffect } from "@react-navigation/native";
import { Image } from "expo-image";
import { useQueryClient } from "@tanstack/react-query";
import NetInfo from "@react-native-community/netinfo";
import LottieView from "lottie-react-native";

// internal
import { buildCachedImageUrl } from "../../../utils/cache/imageCacheUtils";
import { interactWithPartner } from "../../../services/api/home/interactionService";
import {
  formatDateDMY,
  formatTime,
  formatTimeLeft,
} from "../../../utils/formatters/formatDate";
import { useAuth } from "../../../contexts/AuthContext";
import { checkAndUpdateHomeStatus } from "../../../helpers/checkHomeStatus";
import {
  getInteractionMessage,
  getInteractionFeedback,
} from "../../../helpers/interactions";
import { markNotificationSeen } from "../../../services/api/notifications/notificationService";
import { Notification } from "../../../interfaces/Notification";
import { useTheme } from "../../../theme/ThemeContext";
import { createHomeStyles } from "../styles/HomeScreen.styles";

// screen content
import RecentActivity from "../components/RecentActivity";
import ActionsModal from "../../../components/modals/selection/ActionsModal";
import PortalPreview from "../components/PortalPreview";
import ProfileCard from "../components/ProfileCard";
import InteractionAnimationModal from "../../../components/modals/output/InteractionAnimationModal";
import ProcessingAnimation from "../../../components/loading/ProcessingAnimation";
import NotificationsDropdown from "../../../components/dropdowns/NotificationsDropdown";
import AvatarSkeleton from "../../../components/skeletons/AvatarSkeleton";
import Shimmer from "../../../components/skeletons/Shimmer";
import ErrorState from "../../../components/common/ErrorState";
import ConfirmStreakModal from "../../../components/modals/streak/ConfirmStreakModal";
import AttentivenessInsightsModal from "../../../components/modals/output/AttentivenessInsightsModal";
import Resolutions from "../components/Resolutions";

// animation files
import { animationMap } from "../../../utils/animations/getAnimation";
import defaultAnimation from "../../../assets/animations/hug.json";

// hooks
import { useProfilePicture } from "../../../hooks/useProfilePicture";
import { useHome } from "../../../hooks/useHome";
import { useHomeSelector } from "../../../hooks/useHomeSelector";
import useToken from "../../../hooks/useToken";
import {
  useStreakPreview,
  usePendingEndedStreak,
  useConfirmEndedStreak,
} from "../../../hooks/useStreak";
import {
  useAttentivenessInsights,
  useMarkAttentivenessAsShown,
} from "../../../hooks/useAttentiveness";
import { useGifts } from "../../../hooks/useGifts";
import { useGiftsSelector } from "../../../hooks/useGiftsSelector";

// types
type Props = NativeStackScreenProps<any>;

const HomeScreen: React.FC<Props> = ({ navigation }) => {
  // variables
  const insets = useSafeAreaInsets();
  const HEADER_HEIGHT = 60;
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const token = useToken();
  const { theme } = useTheme();
  const styles = useMemo(() => createHomeStyles(theme), [theme]);

  // use states
  const [error, setError] = useState<string | null>(null);
  const [showError, setShowError] = useState(false);
  const [isOnline, setIsOnline] = useState(true);
  const [interactionLoading, setInteractionLoading] = useState(false);
  const [currentAction, setCurrentAction] = useState<string | null>(null);
  const [failed, setFailed] = useState(false);
  const [notificationsVisible, setNotificationsVisible] = useState(false);
  const [avatarFetched, setAvatarFetched] = useState(false);

  // use states (modals)
  const [actionsModalVisible, setActionsModalVisible] = useState(false);
  const [animationModalVisible, setAnimationModalVisible] = useState(false);
  const [animationMessage, setAnimationMessage] = useState("");
  const [showStreakConfirmModal, setShowStreakConfirmModal] = useState(false);
  const [confirmingStreak, setConfirmingStreak] = useState(false);
  const [showAttentivenessModal, setShowAttentivenessModal] = useState(false);

  // streak hooks
  const { data: streakPreview } = useStreakPreview(token, user?.id);
  const { data: pendingStreak, refetch: refetchPendingStreak } =
    usePendingEndedStreak(token, user?.id);
  const confirmStreakMutation = useConfirmEndedStreak(token);

  // attentiveness hooks
  const { data: attentivenessInsights } = useAttentivenessInsights(
    token,
    user?.id
  );
  const markAttentivenessAsShownMutation = useMarkAttentivenessAsShown(token);

  // home data hook
  const {
    data: _homeData,
    isLoading: homeLoading,
    refetch: refetchHome,
    isError: homeError,
  } = useHome(token, user?.id);

  const rawActivities =
    useHomeSelector(user?.id, (h) => h?.recentActivities || []) || [];
  const activities = useMemo(() => {
    return rawActivities.map((activity: any) => ({
      id: activity.id,
      description: activity.activity,
      date: formatDateDMY(activity.createdAt),
      time: formatTime(activity.createdAt),
    }));
  }, [rawActivities]);

  const partner = useHomeSelector(user?.id, (home) => home?.partner) || null;
  const notificationsData =
    useHomeSelector(user?.id, (home) => home?.notifications || []) || [];
  const unseenInteractions =
    useHomeSelector(user?.id, (home) => home?.unseenInteractions || []) || [];
  const upcomingDate =
    useHomeSelector(user?.id, (home) => home?.upcomingSpecialDate) || null;
  const partnerMood = useHomeSelector(user?.id, (m) => m?.partnerMood) || null;
  const partnerStatus =
    useHomeSelector(user?.id, (home) => home?.partnerStatus) || null;
  const resolutions =
    useHomeSelector(user?.id, (home) => home?.resolutions || []) || [];

  const partnerLoading = homeLoading;
  const activitiesLoading = homeLoading;
  const upcomingDateLoading = homeLoading;
  const partnerMoodLoading = homeLoading;
  const partnerStatusLoading = homeLoading;

  // gifts data for presents card
  const { data: _giftsData } = useGifts(token, user?.id);
  const unclaimedGift =
    useGiftsSelector(user?.id, (gifts) => gifts?.unclaimedGift) || null;
  const setMonthlyGift =
    useGiftsSelector(user?.id, (gifts) => gifts?.setMonthlyGift) || null;

  const {
    avatarUri,
    profilePicUpdatedAt,
    fetchPicture: fetchPartnerPicture,
  } = useProfilePicture(partner?.id, token);

  const [optimisticNotifications, setOptimisticNotifications] = useState<
    Notification[]
  >([]);

  // use effects
  useEffect(() => {
    if (token && notificationsData) {
      setOptimisticNotifications(notificationsData);
    }
  }, [token, notificationsData]);

  useFocusEffect(
    useCallback(() => {
      if (partner?.id && token) {
        Promise.resolve(fetchPartnerPicture()).finally(() =>
          setAvatarFetched(true)
        );
      }
    }, [partner?.id, token])
  );

  useFocusEffect(
    useCallback(() => {
      const run = async () => {
        await checkAndUpdateHomeStatus(token);
        queryClient.invalidateQueries({ queryKey: ["home", user?.id] });
        queryClient.invalidateQueries({
          queryKey: ["profile", user?.id],
        });
      };

      run();

      const interval = setInterval(run, 5 * 60 * 1000);
      return () => clearInterval(interval);
    }, [token, user?.id])
  );

  useEffect(() => {
    if (error) {
      setShowError(true);
      const timer = setTimeout(() => {
        setShowError(false);
        setError(null);
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state) => {
      setIsOnline(!!state.isConnected);
    });
    return () => unsubscribe();
  }, []);

  // show streak confirmation modal when there's a pending accusation
  useEffect(() => {
    if (pendingStreak?.pendingEndedStreak && pendingStreak?.streak) {
      setShowStreakConfirmModal(true);
    }
  }, [pendingStreak]);

  // show attentiveness insights modal when available
  useEffect(() => {
    if (attentivenessInsights && attentivenessInsights.messages?.length > 0) {
      // small delay to ensure other modals don't conflict
      const timer = setTimeout(() => {
        setShowAttentivenessModal(true);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [attentivenessInsights]);

  // handle toggle
  const toggleNotifications = async () => {
    const newVisible = !notificationsVisible;
    setNotificationsVisible(newVisible);

    if (newVisible && token) {
      const unseen = optimisticNotifications.filter((n) => !n.seen);

      setOptimisticNotifications((prev) =>
        prev.map((n) => ({ ...n, seen: true }))
      );

      if (unseen.length > 0) {
        await Promise.all(unseen.map((n) => markNotificationSeen(token, n.id)));
      }

      queryClient.setQueryData(["home", user?.id], (old: any) => {
        if (!old) {
          return old;
        }

        return {
          ...old,
          notifications: (old.notifications || []).map((n: any) => ({
            ...n,
            seen: true,
          })),
        };
      });

      const res = await refetchHome();
      if (res.data && Array.isArray(res.data.notifications)) {
        setOptimisticNotifications(res.data.notifications);
      }
    }
  };

  const unseenCount = optimisticNotifications.filter((n) => !n.seen).length;

  // handlers
  const handleInteraction = async (action: string) => {
    setActionsModalVisible(false);
    setInteractionLoading(true);

    try {
      if (!token) {
        setError("Your session has expired. Log in again and retry.");
        return;
      }
      await interactWithPartner(token, action);
      await queryClient.invalidateQueries({
        queryKey: ["home", user?.id],
      });

      setAnimationMessage(
        getInteractionFeedback(action, partner?.name || "your partner")
      );
      setAnimationModalVisible(true);
      setCurrentAction(action);
    } catch (err: any) {
      setError(err.response?.data?.error || "Failed to interact");
    } finally {
      setInteractionLoading(false);
    }
  };

  const handleCloseNotifications = () => {
    setNotificationsVisible(false);
  };

  const handleConfirmStreak = async (confirmed: boolean) => {
    if (!pendingStreak?.streak?.id) {
      return;
    }

    setConfirmingStreak(true);
    try {
      await confirmStreakMutation.mutateAsync({
        streakId: pendingStreak.streak.id,
        confirmed,
      });
      setShowStreakConfirmModal(false);
      refetchPendingStreak();
    } catch (error) {
      console.error("Error confirming streak:", error);
    } finally {
      setConfirmingStreak(false);
    }
  };

  const handleMarkAttentivenessAsShown = async (weekKey: string) => {
    try {
      await markAttentivenessAsShownMutation.mutateAsync(weekKey);
    } catch (error) {
      console.error("Error marking attentiveness as shown:", error);
    }
  };

  // helpers
  const renderPartnerImage = () => {
    if (avatarUri && profilePicUpdatedAt && partner) {
      const timestamp = Math.floor(
        new Date(profilePicUpdatedAt).getTime() / 1000
      );
      const cachedImageUrl = buildCachedImageUrl(
        partner.id.toString(),
        timestamp
      );

      return (
        <Image
          source={
            failed
              ? require("../../../assets/default-avatar-two.png")
              : { uri: cachedImageUrl }
          }
          style={styles.avatar}
          cachePolicy="disk"
          contentFit="cover"
          transition={200}
          onError={() => setFailed(true)}
        />
      );
    }

    if (!avatarFetched) {
      return (
        <AvatarSkeleton
          style={styles.avatar}
          darkColor={theme.colors.skeletonDark}
          highlightColor={theme.colors.skeletonHighlight}
        />
      );
    }

    if (!avatarUri) {
      return (
        <Image
          source={require("../../../assets/default-avatar-two.png")}
          style={styles.avatar}
          cachePolicy="disk"
          contentFit="cover"
          transition={200}
        />
      );
    }

    return (
      <Image
        source={
          avatarUri
            ? { uri: avatarUri }
            : require("../../../assets/default-avatar-two.png")
        }
        style={styles.avatar}
        cachePolicy="disk"
        contentFit="cover"
        transition={200}
        onError={() => setFailed(true)}
      />
    );
  };

  // handle status
  const status = partnerStatus?.unreachable
    ? "Unreachable"
    : partnerStatus?.isAtHome
    ? "Home"
    : partnerStatus?.isAtHome === false
    ? "Away"
    : "Unavailable";

  const isActive = status === "Home" || status === "Unavailable";

  const statusColor =
    status === "Home"
      ? "#4caf50"
      : status === "Away"
      ? "#e03487"
      : status === "Unreachable"
      ? "#db8a47"
      : theme.colors.muted;

  const mood = partnerMood?.mood || null;
  const batteryLevel = partnerStatus?.batteryLevel ?? null;
  const distanceFromHome = partnerStatus?.distance ?? null;

  const lastSeen = partnerStatus?.updatedAt ?? null;
  const userLocation = partnerStatus?.userSuburb ?? null;
  const userTimezone = partnerStatus?.timezoneOffset ?? null;

  if (homeError) {
    return (
      <ErrorState
        message="Failed to load overview. Try again?"
        onRetry={() => refetchHome()}
      />
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
      {!isOnline && (
        <View
          style={{
            backgroundColor: "red",
            position: "absolute",
            top: insets.top,
            left: 0,
            right: 0,
            zIndex: 10,
            paddingVertical: 2,
          }}
        >
          <Text style={{ color: theme.colors.text, textAlign: "center" }}>
            You are offline
          </Text>
        </View>
      )}
      <View
        style={{
          backgroundColor: theme.colors.background,
          paddingTop: insets.top,
          height: HEADER_HEIGHT + insets.top,
          justifyContent: "center",
          alignItems: "center",
          position: "relative",
          zIndex: 2,
        }}
      >
        <Text
          style={{
            fontSize: 20,
            color: theme.colors.text,
            letterSpacing: 0,
          }}
        >
          Overview
        </Text>

        <TouchableOpacity
          style={{
            position: "absolute",
            top: insets.top + (HEADER_HEIGHT - 36) / 2,
            left: 18,
            zIndex: 10,
            backgroundColor: theme.colors.background,
            borderRadius: 20,
            padding: 8,
            shadowColor: theme.colors.shadow,
            shadowOpacity: 0.1,
            shadowRadius: 4,
          }}
          onPress={() => navigation.navigate("Search")}
        >
          <Feather name="search" size={22} color={theme.colors.text} />
        </TouchableOpacity>

        <TouchableOpacity
          style={{
            position: "absolute",
            top: insets.top + (HEADER_HEIGHT - 36) / 2,
            right: 64,
            zIndex: 20,
            backgroundColor: theme.colors.background,
            borderRadius: 20,
            padding: 8,
            shadowColor: theme.colors.shadow,
            shadowOpacity: 0.05,
            shadowRadius: 4,
            alignItems: "center",
            justifyContent: "center",
          }}
          onPress={toggleNotifications}
        >
          <Feather name="bell" size={20} color={theme.colors.text} />

          {unseenCount > 0 && (
            <View
              style={{
                position: "absolute",
                top: -6,
                right: -6,
                backgroundColor: theme.colors.primary,
                paddingHorizontal: 6,
                paddingVertical: 2,
                borderRadius: 10,
                minWidth: 20,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Text
                style={{
                  color: theme.colors.text,
                  fontSize: 11,
                  fontWeight: "700",
                }}
              >
                {unseenCount}
              </Text>
            </View>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={{
            position: "absolute",
            top: insets.top + (HEADER_HEIGHT - 36) / 2,
            right: 18,
            zIndex: 10,
            backgroundColor: theme.colors.background,
            borderRadius: 20,
            padding: 8,
            shadowColor: theme.colors.shadow,
            shadowOpacity: 0.1,
            shadowRadius: 4,
          }}
          onPress={() => navigation.navigate("Profile", { screen: "Settings" })}
        >
          <Feather name="settings" size={22} color={theme.colors.text} />
        </TouchableOpacity>
      </View>

      <NotificationsDropdown
        visible={notificationsVisible}
        notifications={
          optimisticNotifications.length > 0
            ? optimisticNotifications
            : notificationsData
        }
        onClose={handleCloseNotifications}
      />

      <ScrollView
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.partnerLabel}>PARTNER</Text>

        {partnerLoading || partnerStatusLoading || partnerMoodLoading ? (
          <Shimmer height={120} radius={24} style={{ width: "100%" }} />
        ) : (
          <ProfileCard
            partner={partner}
            avatarUri={avatarUri}
            status={status}
            statusColor={statusColor}
            mood={mood}
            isActive={isActive}
            batteryLevel={batteryLevel}
            distanceFromHome={distanceFromHome}
            lastSeen={lastSeen}
            onPress={() =>
              navigation.navigate("PartnerProfile", { userId: partner?.id })
            }
            renderPartnerImage={renderPartnerImage}
            userLocation={userLocation}
            userTimezone={userTimezone}
          />
        )}

        <View style={styles.buttonRow}>
          <BlurView intensity={50} tint="dark" style={styles.blurButton}>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => handleInteraction("hold")}
            >
              <Text style={styles.buttonText}>HOLD</Text>
            </TouchableOpacity>
          </BlurView>
          <BlurView intensity={50} tint="dark" style={styles.blurButton}>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => handleInteraction("cuddle")}
            >
              <Text style={styles.buttonText}>CUDDLE</Text>
            </TouchableOpacity>
          </BlurView>
          <BlurView intensity={50} tint="dark" style={styles.blurButton}>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => setActionsModalVisible(true)}
            >
              <Text style={styles.buttonText}>MORE</Text>
            </TouchableOpacity>
          </BlurView>
          <ActionsModal
            visible={actionsModalVisible}
            onClose={() => setActionsModalVisible(false)}
            onAction={handleInteraction}
          />
        </View>

        {streakPreview && (
          <TouchableOpacity
            style={{
              backgroundColor: theme.colors.surfaceAlt,
              borderRadius: 16,
              padding: 16,
              marginBottom: 16,
              flexDirection: "row",
              alignItems: "center",
            }}
            onPress={() => navigation.navigate("StreakScreen")}
            activeOpacity={0.7}
          >
            <View
              style={{
                width: 40,
                height: 40,
                borderRadius: 12,
                backgroundColor:
                  streakPreview.type === "warning"
                    ? "#FF6B6B"
                    : streakPreview.type === "achievement"
                    ? "#4CAF50"
                    : streakPreview.type === "positive"
                    ? "#FFD93D"
                    : theme.colors.primary,
                justifyContent: "center",
                alignItems: "center",
                marginRight: 14,
              }}
            >
              <Feather
                name={
                  streakPreview.type === "warning"
                    ? "alert-triangle"
                    : streakPreview.type === "achievement"
                    ? "award"
                    : streakPreview.type === "scoreboard"
                    ? "bar-chart-2"
                    : "zap"
                }
                size={22}
                color="#fff"
              />
            </View>
            <View style={{ flex: 1 }}>
              <Text
                style={{
                  color: theme.colors.text,
                  fontSize: 15,
                  fontWeight: "600",
                }}
                numberOfLines={2}
              >
                {streakPreview.message}
              </Text>
              <Text
                style={{
                  color: theme.colors.muted,
                  fontSize: 12,
                  marginTop: 3,
                }}
              >
                Tap to view streak details
              </Text>
            </View>
            <Feather
              name="chevron-right"
              size={20}
              color={theme.colors.muted}
            />
          </TouchableOpacity>
        )}

        <TouchableOpacity
          style={{
            backgroundColor: theme.colors.surfaceAlt,
            borderRadius: 16,
            padding: 16,
            marginBottom: 16,
            flexDirection: "row",
            alignItems: "center",
          }}
          onPress={() => navigation.navigate("PresentsScreen")}
          activeOpacity={0.7}
        >
          <View
            style={{
              width: 40,
              height: 40,
              borderRadius: 12,
              backgroundColor: unclaimedGift ? "#FF6B9D" : "transparent",
              justifyContent: "center",
              alignItems: "center",
              marginRight: 14,
            }}
          >
            <Feather
              name="gift"
              size={22}
              color={unclaimedGift ? "#fff" : theme.colors.primary}
            />
          </View>
          <View style={{ flex: 1 }}>
            <Text
              style={{
                color: theme.colors.text,
                fontSize: 15,
                fontWeight: "600",
              }}
              numberOfLines={1}
            >
              {unclaimedGift
                ? "You have a present waiting! 🎁"
                : setMonthlyGift?.setMonthlyGift
                ? `Favorite: ${setMonthlyGift.setMonthlyGift}`
                : "View your presents"}
            </Text>
            <Text
              style={{
                color: theme.colors.muted,
                fontSize: 12,
                marginTop: 3,
              }}
            >
              {unclaimedGift
                ? "Tap to unwrap your gift"
                : "Manage presents & wishlist"}
            </Text>
          </View>
          {unclaimedGift && (
            <View
              style={{
                width: 10,
                height: 10,
                borderRadius: 5,
                backgroundColor: "#FF6B9D",
                marginRight: 8,
              }}
            />
          )}
          <Feather name="chevron-right" size={20} color={theme.colors.muted} />
        </TouchableOpacity>

        {unseenInteractions.length > 0 && (
          <>
            <Text style={styles.interactionCardTitle}>
              LOOK WHAT YOUR BABY JUST DID
            </Text>
            <View style={[styles.interactionCard, { position: "relative" }]}>
              <Feather
                name="bell"
                size={22}
                color={theme.colors.primary}
                style={{
                  position: "absolute",
                  top: 14,
                  right: 16,
                  zIndex: 2,
                }}
              />
              {unseenInteractions[unseenInteractions.length - 1] && (
                <LottieView
                  source={
                    animationMap[
                      unseenInteractions[unseenInteractions.length - 1].action
                    ] || defaultAnimation
                  }
                  autoPlay
                  loop
                  style={{
                    width: 80,
                    height: 80,
                    alignSelf: "center",
                    zIndex: 1,
                  }}
                />
              )}
              {unseenInteractions.map((interaction: any, idx: number) => (
                <View
                  key={interaction.id}
                  style={{
                    marginBottom:
                      idx === unseenInteractions.length - 1 ? 0 : 10,
                  }}
                >
                  <Text
                    style={{
                      color: theme.colors.text,
                      fontSize: 16,
                      fontWeight: "bold",
                      marginTop: 12,
                      textAlign: "center",
                    }}
                  >
                    {partner?.name || "Your partner"}{" "}
                    {getInteractionMessage(interaction.action)}
                  </Text>
                  <Text
                    style={{
                      color: theme.colors.muted,
                      fontSize: 12,
                      marginTop: 6,
                      textAlign: "center",
                    }}
                  >
                    {formatDateDMY(interaction.createdAt)} •{" "}
                    {formatTime(interaction.createdAt)}
                  </Text>
                </View>
              ))}
            </View>
          </>
        )}
        {upcomingDateLoading ? (
          <View style={styles.upcomingContainer}>
            <Shimmer height={50} radius={14} style={{ width: "100%" }} />
          </View>
        ) : upcomingDate ? (
          <View style={styles.upcomingContainer}>
            <Text style={styles.upcomingLabel}>UPCOMING</Text>
            <View style={styles.eventCard}>
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  marginBottom: 4,
                }}
              >
                <Text style={styles.eventName}>{upcomingDate.title}</Text>
                <Text style={styles.eventTimeLeft}>
                  {" "}
                  {formatTimeLeft(
                    upcomingDate.timeLeft.days,
                    upcomingDate.timeLeft.hours,
                    upcomingDate.timeLeft.minutes
                  )}
                </Text>
              </View>
              <Text style={styles.eventDescription}>
                {upcomingDate.description ||
                  `${upcomingDate.title} on ${formatDateDMY(
                    upcomingDate.nextOccurrence
                  )}`}
              </Text>
            </View>
          </View>
        ) : null}

        <PortalPreview partner={partner} navigation={navigation} />

        <Resolutions
          resolutions={resolutions}
          isLoading={homeLoading}
          onAddResolution={() =>
            navigation.navigate("AddResolutionScreen", {
              onSuccess: () => {
                queryClient.invalidateQueries({ queryKey: ["home", user?.id] });
              },
            })
          }
        />

        {activitiesLoading ? (
          <View>
            <Shimmer radius={12} height={50} style={{ width: "100%" }} />
            <View style={{ height: 12 }} />
            <Shimmer radius={12} height={50} style={{ width: "100%" }} />
            <View style={{ height: 12 }} />
            <Shimmer radius={12} height={50} style={{ width: "100%" }} />
            <View style={{ height: 12 }} />
            <Shimmer radius={12} height={50} style={{ width: "100%" }} />
            <View style={{ height: 12 }} />
            <Shimmer radius={12} height={50} style={{ width: "100%" }} />
          </View>
        ) : (
          <RecentActivity activities={activities} />
        )}
      </ScrollView>
      {showError && (
        <View style={styles.toast}>
          <Text style={styles.toastText}>{error}</Text>
        </View>
      )}

      {interactionLoading && (
        <View style={styles.centered}>
          <ProcessingAnimation
            visible={interactionLoading}
            onClose={() => {}}
            size="large"
          />
        </View>
      )}

      <InteractionAnimationModal
        visible={animationModalVisible}
        message={animationMessage}
        action={currentAction}
        onClose={() => {
          setAnimationModalVisible(false);
          setCurrentAction(null);
        }}
      />

      <ConfirmStreakModal
        visible={showStreakConfirmModal}
        onClose={() => setShowStreakConfirmModal(false)}
        onConfirm={handleConfirmStreak}
        loading={confirmingStreak}
        streak={
          pendingStreak?.streak
            ? {
                id: pendingStreak.streak.id,
                partnerName: pendingStreak.streak.partnerName,
                socialMedia: pendingStreak.streak.socialMedia,
                createdAt: pendingStreak.streak.createdAt,
              }
            : null
        }
      />

      <AttentivenessInsightsModal
        visible={showAttentivenessModal}
        insights={attentivenessInsights}
        onClose={() => setShowAttentivenessModal(false)}
        onMarkAsShown={handleMarkAttentivenessAsShown}
      />
    </View>
  );
};

export default HomeScreen;
