// external
import React, { useState, useEffect, useCallback } from "react";
import {
  ScrollView,
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { Feather } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { BlurView } from "expo-blur";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { encode } from "base64-arraybuffer";
import * as Location from "expo-location";
import { useFocusEffect } from "@react-navigation/native";
import { Image } from "expo-image";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import NetInfo from "@react-native-community/netinfo";

// internal
import { BASE_URL } from "../../../configuration/config";
import { getHomeLocation } from "../../../services/api/profiles/homeLocationService";
import { updateUserStatus } from "../../../services/api/profiles/userStatusService";
import { getDistance } from "../../../utils/locationUtils";
import { fetchUserStatus } from "../../../services/api/profiles/userStatusService";
import { getUserMood } from "../../../services/api/profiles/moodService";
import { getUpcomingSpecialDate } from "../../../services/api/ours/specialDateService";
import { getRecentActivities } from "../../../services/api/home/recentActivityService";
import { buildCachedImageUrl } from "../../../utils/imageCacheUtils";
import {
  interactWithPartner,
  getUnseenInteractions,
} from "../../../services/api/home/interactionService";
import { getPartner } from "../../../services/api/profiles/partnerService";
import {
  formatDateDMY,
  formatTime,
  formatTimeLeft,
} from "../../../utils/formatDate";
import {
  checkLocationPermissions,
} from "../../../services/location/locationPermissionService";

// screen content
import RecentActivity from "../components/RecentActivity";
import ActionsModal from "../../../components/modals/selection/ActionsModal";
import styles from "../styles/HomeScreen.styles";
import AlertModal from "../../../components/modals/output/AlertModal";
import PortalPreview from "../components/PortalPreview";
import ProfileCard from "../components/ProfileCard";
import LoadingSpinner from "../../../components/loading/LoadingSpinner";

// types
type Props = NativeStackScreenProps<any>;

const HomeScreen: React.FC<Props> = ({ navigation }) => {
  // variables
  const insets = useSafeAreaInsets();
  const HEADER_HEIGHT = 60;
  const queryClient = useQueryClient();

  // use states
  const [error, setError] = useState<string | null>(null);
  const [avatarUri, setAvatarUri] = useState<string | null>(null);
  const [profilePicUpdatedAt, setProfilePicUpdatedAt] = useState<Date | null>(
    null
  );
  const [showError, setShowError] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [isOnline, setIsOnline] = useState(true);
  const [interactionLoading, setInteractionLoading] = useState(false);

  // use states (modals)
  const [alertVisible, setAlertVisible] = useState(false);
  const [actionsModalVisible, setActionsModalVisible] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");

  // handlers
  const handleInteraction = async (action: string) => {
    setActionsModalVisible(false);
    setInteractionLoading(true);
    try {
      const token = await AsyncStorage.getItem("token");
      if (!token) {
        setError("Session expired, please log in again");
        return;
      }

      await interactWithPartner(token, action);
      await queryClient.invalidateQueries({
        queryKey: ["recentActivities"],
      });

      setAlertMessage(
        getInteractionFeedback(action, partner?.name || "your partner")
      );
      setAlertVisible(true);
      refetchUnseen();
      refetchActivities();
    } catch (err: any) {
      setError(err.response?.data?.error || "Failed to interact");
    } finally {
      setInteractionLoading(false);
    }
  };

  const checkAndUpdateHomeStatus = async () => {
    try {
      const token = await AsyncStorage.getItem("token");

      if (!token) {
        setError("Session expired, please log in again");
        return;
      }

      const home = await getHomeLocation(token);

      if (!home) {
        return;
      }

      const { foreground } = await checkLocationPermissions();
      if (foreground !== "granted") {
        return;
      }

      const { coords } = await Location.getCurrentPositionAsync({});
      const distance = getDistance(
        coords.latitude,
        coords.longitude,
        home.latitude,
        home.longitude
      );
      const isAtHome = distance < 100;

      await updateUserStatus(token, isAtHome, isAtHome ? undefined : distance);
    } catch (err) {}
  };

  // fetch functions
  const {
    data: partner,
    isLoading: partnerLoading,
    refetch: refetchPartner,
  } = useQuery({
    queryKey: ["partnerData"],
    queryFn: async () => {
      const token = await AsyncStorage.getItem("token");

      if (!token) {
        setError("Session expired, please log in again");
        return;
      }

      return await getPartner(token);
    },
    staleTime: 1000 * 60 * 60 * 24,
  });

  const partnerId = partner?.id;

  const fetchPartnerProfilePicture = async () => {
    try {
      const token = await AsyncStorage.getItem("token");

      if (!token) {
        setError("Session expired, please log in again");
        return;
      }

      const pictureResponse = await axios.get(
        `${BASE_URL}/api/profile/get-profile-picture/${partnerId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
          responseType: "arraybuffer",
        }
      );

      const mime = pictureResponse.headers["content-type"] || "image/jpeg";
      const base64 = `data:${mime};base64,${encode(pictureResponse.data)}`;

      setAvatarUri(base64);

      const lastModified = pictureResponse.headers["last-modified"];
      setProfilePicUpdatedAt(
        lastModified ? new Date(lastModified) : new Date()
      );
    } catch (picErr: any) {
      if (![404, 500].includes(picErr.response?.status)) {
      }
    }
  };

  const {
    data: partnerStatus,
    isLoading: partnerStatusLoading,
    refetch: refetchPartnerStatus,
  } = useQuery({
    queryKey: ["partnerStatus"],
    queryFn: async () => {
      if (!partnerId) {
        return null;
      }

      const token = await AsyncStorage.getItem("token");

      if (!token) {
        setError("Session expired, please log in again");
        return;
      }

      return await fetchUserStatus(token, partnerId);
    },
    enabled: !!partnerId,
    staleTime: 1000 * 60 * 2,
  });

  const {
    data: partnerMood,
    isLoading: partnerMoodLoading,
    refetch: refetchPartnerMood,
  } = useQuery({
    queryKey: ["partnerMood"],
    queryFn: async () => {
      if (!partnerId) {
        return null;
      }

      const token = await AsyncStorage.getItem("token");

      if (!token) {
        setError("Session expired, please log in again");
        return;
      }

      return await getUserMood(token, partnerId);
    },
    enabled: !!partnerId,
    staleTime: 1000 * 60 * 2,
  });

  const {
    data: upcomingDate,
    isLoading: upcomingDateLoading,
    refetch: refetchUpcomingDate,
  } = useQuery({
    queryKey: ["upcomingSpecialDate"],
    queryFn: async () => {
      const token = await AsyncStorage.getItem("token");

      if (!token) {
        setError("Session expired, please log in again");
        return;
      }

      return await getUpcomingSpecialDate(token);
    },
    staleTime: 1000 * 60 * 60 * 12,
  });

  const {
    data: activities = [],
    isLoading: activitiesLoading,
    refetch: refetchActivities,
  } = useQuery({
    queryKey: ["recentActivities"],
    queryFn: async () => {
      const token = await AsyncStorage.getItem("token");

      if (!token) {
        setError("Session expired, please log in again");
        return;
      }

      const activitiesData = await getRecentActivities(token);

      return activitiesData.map((activity: any) => ({
        id: activity.id,
        description: activity.activity,
        date: formatDateDMY(activity.createdAt),
        time: formatTime(activity.createdAt),
      }));
    },
    staleTime: 1000 * 60 * 5,
  });

  const {
    data: unseenInteractions = [],
    isLoading: unseenLoading,
    refetch: refetchUnseen,
  } = useQuery({
    queryKey: ["unseenInteractions"],
    queryFn: async () => {
      const token = await AsyncStorage.getItem("token");

      if (!token) {
        setError("Session expired, please log in again");
        return;
      }

      return await getUnseenInteractions(token);
    },
    enabled: !!partnerId,
    staleTime: 1000 * 60 * 5,
  });

  // helpers
  const renderPartnerImage = () => {
    if (avatarUri && profilePicUpdatedAt && partner) {
      const cachedImageUrl = buildCachedImageUrl(
        partner.id,
        profilePicUpdatedAt
      );
      return (
        <Image
          source={cachedImageUrl}
          style={styles.avatar}
          contentFit="cover"
          transition={200}
        />
      );
    }

    return (
      <Image
        source={
          avatarUri ? avatarUri : require("../../../assets/default-avatar-two.png")
        }
        style={styles.avatar}
        contentFit="cover"
      />
    );
  };

  function getInteractionMessage(action: string) {
    switch (action) {
      case "kiss":
        return "just gave you a kiss";
      case "hug":
        return "gave you a hug";
      case "cuddle":
        return "cuddled you";
      case "hold":
        return "held your hand";
      case "nudge":
        return "nudged you";
      case "caress":
        return "caressed you";
      case "embrace":
        return "embraced you";
      case "wink":
        return "winked at you";
      case "roll":
        return "rolled their eyes at you";
      default:
        return `interacted with you`;
    }
  }

  function getInteractionFeedback(action: string, partnerName: string) {
    switch (action) {
      case "kiss":
        return `Mwah! You just gave ${partnerName} a kiss! Aww 🤍`;
      case "hug":
        return `You just gave ${partnerName} a hug! So sweet`;
      case "cuddle":
        return `You just cuddled with ${partnerName}. So cozy 🤍`;
      case "hold":
        return `You just held hands with ${partnerName}. Aww, cuties!`;
      case "nudge":
        return `You just nudged ${partnerName}`;
      case "caress":
        return `You just caressed ${partnerName} 🤍`;
      case "embrace":
        return `You just embraced ${partnerName}. Aww, lovebirds 🤍`;
      case "wink":
        return `You just winked at ${partnerName}`;
      case "roll":
        return `You just rolled your eyes at ${partnerName} 🙄`;
      default:
        return `You just interacted with ${partnerName}`;
    }
  }

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
      ? "#db8a47ff"
      : "#b0b3c6";

  const mood = partnerMood?.mood || "No mood";

  // use effects
  useEffect(() => {
    checkAndUpdateHomeStatus();
  }, []);

  useEffect(() => {
    if (partnerId) {
      fetchPartnerProfilePicture();
    }
  }, [partnerId]);

  useFocusEffect(
    useCallback(() => {
      checkAndUpdateHomeStatus();
      const interval = setInterval(checkAndUpdateHomeStatus, 5 * 60 * 1000);
      return () => clearInterval(interval);
    }, [])
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

  // refresh screen
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await Promise.all([
        refetchPartner(),
        refetchUpcomingDate(),
        refetchActivities(),
        refetchPartnerMood(),
        refetchPartnerStatus(),
        fetchPartnerProfilePicture(),
      ]);
    } catch (e) {
    } finally {
      setRefreshing(false);
    }
  }, [
    refetchPartner,
    refetchUpcomingDate,
    refetchActivities,
    refetchPartnerMood,
    refetchPartnerStatus,
    fetchPartnerProfilePicture,
  ]);

  if (partnerLoading) {
    return (
      <View style={styles.centered}>
        <LoadingSpinner showMessage={false} size="medium" />
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: "#23243a" }}>
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
          <Text style={{ color: "white", textAlign: "center" }}>
            You are offline
          </Text>
        </View>
      )}
      <View
        style={{
          backgroundColor: "#23243a",
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
            color: "#fff",
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
            backgroundColor: "#23243a",
            borderRadius: 20,
            padding: 8,
            shadowColor: "#000",
            shadowOpacity: 0.1,
            shadowRadius: 4,
          }}
          onPress={() => navigation.navigate("Search")}
        >
          <Feather name="search" size={22} color="#fff" />
        </TouchableOpacity>
        <TouchableOpacity
          style={{
            position: "absolute",
            top: insets.top + (HEADER_HEIGHT - 36) / 2,
            right: 18,
            zIndex: 10,
            backgroundColor: "#23243a",
            borderRadius: 20,
            padding: 8,
            shadowColor: "#000",
            shadowOpacity: 0.1,
            shadowRadius: 4,
          }}
          onPress={() => navigation.navigate("Settings")}
        >
          <Feather name="settings" size={22} color="#fff" />
        </TouchableOpacity>
      </View>
      <ScrollView
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#e03487"
            colors={["#e03487"]}
            progressBackgroundColor="#23243a"
          />
        }
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.partnerLabel}>PARTNER</Text>
        {partnerLoading ? (
          <View style={styles.centered}>
            <ActivityIndicator color="#e03487" size="large" />
          </View>
        ) : (
          <ProfileCard
            partner={partner}
            avatarUri={avatarUri}
            status={status}
            statusColor={statusColor}
            mood={mood}
            isActive={isActive}
            onPress={() => navigation.navigate("PartnerProfile")}
            renderPartnerImage={renderPartnerImage}
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
        {unseenInteractions.length > 0 && (
          <>
            <Text style={styles.interactionCardTitle}>
              LOOK WHAT YOUR BABY JUST DID
            </Text>
            <View style={styles.interactionCard}>
              <Feather
                name="bell"
                size={22}
                color="#e03487"
                style={{
                  position: "absolute",
                  top: 14,
                  right: 16,
                }}
              />
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
                      color: "#fff",
                      fontSize: 16,
                      fontWeight: "bold",
                      marginTop: 8,
                    }}
                  >
                    {partner?.name || "Your partner"}{" "}
                    {getInteractionMessage(interaction.action)}
                  </Text>
                  <Text
                    style={{
                      color: "#b0b3c6",
                      fontSize: 12,
                      marginTop: 6,
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

        {upcomingDate && (
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
                  {formatTimeLeft(upcomingDate.daysUntil)}
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
        )}

        <PortalPreview partner={partner} navigation={navigation} />

        <RecentActivity activities={activities} />
      </ScrollView>
      {showError && (
        <View style={styles.toast}>
          <Text style={styles.toastText}>{error}</Text>
        </View>
      )}

      {interactionLoading && (
        <View style={styles.absoluteFillObject}>
          <ActivityIndicator size="large" color="#e03487" />
        </View>
      )}

      <AlertModal
        visible={alertVisible}
        message={alertMessage}
        onClose={() => setAlertVisible(false)}
      />
    </View>
  );
};

export default HomeScreen;
