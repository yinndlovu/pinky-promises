// external
import React, { useState, useEffect, useCallback } from "react";
import {
  ScrollView,
  View,
  Text,
  StyleSheet,
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
import { useQuery } from "@tanstack/react-query";
import NetInfo from "@react-native-community/netinfo";

// internal
import { BASE_URL } from "../../configuration/config";
import { getHomeLocation } from "../../services/homeLocationService";
import { updateUserStatus } from "../../services/userStatusService";
import { getDistance } from "../../utils/locationUtils";
import { fetchUserStatus } from "../../services/userStatusService";
import { getUserMood } from "../../services/moodService";
import { getUpcomingSpecialDate } from "../../services/specialDateService";
import { getRecentActivities } from "../../services/recentActivityService";
import { buildCachedImageUrl } from "../../utils/imageCacheUtils";

// screen content
import RecentActivity from "./RecentActivity";
import ActionsModal from "../../components/modals/ActionsModal";
import { getPartner } from "../../services/partnerService";

// types
type Props = NativeStackScreenProps<any>;

const HomeScreen: React.FC<Props> = ({ navigation }) => {
  // variables
  const insets = useSafeAreaInsets();
  const HEADER_HEIGHT = 60;

  // use states
  const [error, setError] = useState<string | null>(null);
  const [avatarUri, setAvatarUri] = useState<string | null>(null);
  const [profilePicUpdatedAt, setProfilePicUpdatedAt] = useState<Date | null>(
    null
  );
  const [showError, setShowError] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [actionsModalVisible, setActionsModalVisible] = useState(false);
  const [isOnline, setIsOnline] = useState(true);

  // handlers
  const handleAction = () => {
    setActionsModalVisible(false);
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

      const { coords } = await Location.getCurrentPositionAsync({});
      const distance = getDistance(
        coords.latitude,
        coords.longitude,
        home.latitude,
        home.longitude
      );
      const isAtHome = distance < 100;

      await updateUserStatus(token, isAtHome);
    } catch (err) {}
  };

  // fetch functions
  const {
    data: partner,
    isLoading: partnerLoading,
    refetch: refetchPartner,
  } = useQuery({
    queryKey: ["partner"],
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
        setError(picErr.response?.data?.error || picErr.message);
      }
    }
  };

  const {
    data: partnerStatus,
    isLoading: partnerStatusLoading,
    refetch: refetchPartnerStatus,
  } = useQuery({
    queryKey: ["partnerStatus", partnerId],
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
    staleTime: 1000 * 60 * 5,
  });

  const {
    data: partnerMood,
    isLoading: partnerMoodLoading,
    refetch: refetchPartnerMood,
  } = useQuery({
    queryKey: ["partnerMood", partnerId],
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
    staleTime: 1000 * 60 * 5,
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
        date: formatActivityDate(activity.createdAt),
        time: formatActivityTime(activity.createdAt),
      }));
    },
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
          avatarUri ? avatarUri : require("../../assets/default-avatar-two.png")
        }
        style={styles.avatar}
        contentFit="cover"
      />
    );
  };

  const formatTimeLeft = (daysUntil: number): string => {
    if (daysUntil === 0) {
      return "Today";
    }

    if (daysUntil === 1) {
      return "1 day left";
    }

    if (daysUntil < 30) {
      return `${daysUntil} days left`;
    }

    const months = Math.floor(daysUntil / 30);
    const remainingDays = daysUntil % 30;

    if (months === 1 && remainingDays === 0) {
      return "1 month left";
    }

    if (months === 1) {
      return `1 month ${remainingDays} days left`;
    }

    if (remainingDays === 0) {
      return `${months} months left`;
    }

    return `${months} months ${remainingDays} days left`;
  };

  const formatDate = (dateString: string): string => {
    try {
      const date = new Date(dateString);
      const day = date.getDate();
      const month = date.toLocaleDateString("en-US", { month: "short" });
      const year = date.getFullYear();

      return `${day} ${month} ${year}`;
    } catch (error) {
      return dateString;
    }
  };

  const formatActivityDate = (dateString: string): string => {
    try {
      const date = new Date(dateString);
      const day = date.getDate();
      const month = date.toLocaleDateString("en-US", { month: "short" });
      const year = date.getFullYear();

      return `${day} ${month} ${year}`;
    } catch (error) {
      return "Unknown date";
    }
  };

  const formatActivityTime = (dateString: string): string => {
    try {
      const date = new Date(dateString);

      return date.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      });
    } catch (error) {
      return "Unknown time";
    }
  };

  // handle status
  const status = partnerStatus?.unreachable
    ? "Unreachable"
    : partnerStatus?.dataValues.isAtHome
    ? "Home"
    : partnerStatus?.dataValues.isAtHome === false
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

  useFocusEffect(
    useCallback(() => {
      checkAndUpdateHomeStatus();
      const interval = setInterval(checkAndUpdateHomeStatus, 15 * 60 * 1000);
      return () => clearInterval(interval);
    }, [])
  );

  useEffect(() => {
    if (error) {
      setShowError(true);
      const timer = setTimeout(() => {
        setShowError(false);
        setError(null);
      }, 3000);
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
        checkAndUpdateHomeStatus(),
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
    checkAndUpdateHomeStatus,
  ]);

  if (
    partnerLoading ||
    partnerStatusLoading ||
    partnerMoodLoading ||
    upcomingDateLoading ||
    activitiesLoading
  ) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator color="#e03487" size="large" />
      </View>
    );
  }
  {
    !isOnline && (
      <View style={{ backgroundColor: "red", padding: 8 }}>
        <Text style={{ color: "white", textAlign: "center" }}>
          You are offline
        </Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: "#23243a" }}>
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
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => navigation.navigate("PartnerProfile")}
          disabled={!partner}
        >
          {partnerLoading ? (
            <View style={styles.centered}>
              <ActivityIndicator color="#e03487" size="large" />
            </View>
          ) : (
            <View
              style={[
                styles.profileCard,
                !isActive && styles.profileCardInactive,
              ]}
            >
              <View style={styles.profileRow}>
                <View style={styles.avatarWrapper}>{renderPartnerImage()}</View>
                <View style={styles.infoWrapper}>
                  <Text style={styles.name}>
                    {partner?.name || "No partner"}
                  </Text>
                  <Text style={styles.username}>
                    @{partner?.username || "nopartner"}
                  </Text>
                  <Text style={styles.bio}>{partner?.bio || ""}</Text>
                </View>
              </View>
              <View style={styles.statusRow}>
                <Text style={[styles.statusText, { color: statusColor }]}>
                  Status: {status}
                </Text>
                <Text style={styles.statusText}>Mood: {mood}</Text>
              </View>
            </View>
          )}
        </TouchableOpacity>
        <View style={styles.buttonRow}>
          <BlurView intensity={50} tint="dark" style={styles.blurButton}>
            <TouchableOpacity style={styles.actionButton}>
              <Text style={styles.buttonText}>HOLD</Text>
            </TouchableOpacity>
          </BlurView>
          <BlurView intensity={50} tint="dark" style={styles.blurButton}>
            <TouchableOpacity style={styles.actionButton}>
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
            onAction={handleAction}
          />
        </View>
        {upcomingDateLoading ? (
          <View style={styles.centered}>
            <ActivityIndicator color="#e03487" size="large" />
          </View>
        ) : (
          upcomingDate && (
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
                    `${upcomingDate.title} on ${formatDate(
                      upcomingDate.nextOccurrence
                    )}`}
                </Text>
              </View>
            </View>
          )
        )}
        <RecentActivity activities={activities} />
        {activitiesLoading && (
          <View style={styles.centered}>
            <ActivityIndicator color="#e03487" size="large" />
          </View>
        )}
      </ScrollView>
      {showError && (
        <View style={styles.toast}>
          <Text style={styles.toastText}>{error}</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#23243a",
    alignItems: "stretch",
    paddingHorizontal: 16,
  },
  centered: {
    flex: 1,
    backgroundColor: "#23243a",
    alignItems: "center",
    justifyContent: "center",
  },
  partnerLabel: {
    fontSize: 14,
    color: "#b0b3c6",
    letterSpacing: 1,
    textTransform: "uppercase",
    marginLeft: 16,
    marginTop: 20,
    marginBottom: 10,
    alignSelf: "flex-start",
  },
  profileCard: {
    backgroundColor: "#1b1c2e",
    borderRadius: 20,
    paddingVertical: 20,
    paddingHorizontal: 32,
    alignItems: "flex-start",
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 2,
    width: "100%",
  },
  profileCardInactive: {
    opacity: 0.6,
  },
  profileRow: {
    flexDirection: "row",
    alignItems: "flex-start",
  },
  avatarWrapper: {
    alignSelf: "flex-start",
    marginBottom: 16,
    marginRight: 16,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 2,
    borderColor: "#e03487",
  },
  infoWrapper: {
    flex: 1,
    justifyContent: "center",
  },
  name: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 0,
  },
  username: {
    fontSize: 16,
    color: "#e03487",
    marginBottom: 8,
    marginLeft: 4,
  },
  bio: {
    fontSize: 15,
    color: "#fff",
    textAlign: "left",
  },
  statusRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    width: "100%",
    marginTop: 10,
  },
  statusText: {
    fontSize: 13,
    color: "#b0b3c6",
    letterSpacing: 0.5,
  },
  buttonRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    paddingHorizontal: 8,
    marginTop: 16,
  },
  actionButton: {
    backgroundColor: "rgba(194, 58, 124, 0.3)",
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: "center",
    width: "100%",
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
    letterSpacing: 1,
    textTransform: "uppercase",
  },
  blurButton: {
    flex: 1,
    marginHorizontal: 4,
    borderRadius: 12,
    overflow: "hidden",
  },
  upcomingContainer: {
    marginTop: 24,
    width: "100%",
  },
  upcomingLabel: {
    fontSize: 14,
    color: "#b0b3c6",
    letterSpacing: 1,
    textTransform: "uppercase",
    marginBottom: 8,
    marginLeft: 16,
  },
  eventCard: {
    backgroundColor: "#23243a",
    borderRadius: 14,
    padding: 18,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 1.5,
  },
  eventName: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#fff",
  },
  eventTimeLeft: {
    fontSize: 14,
    color: "#b0b3c6",
    marginLeft: 8,
    fontWeight: "600",
    opacity: 0.7,
  },
  eventDescription: {
    fontSize: 15,
    color: "#b0b3c6",
    marginTop: 2,
    opacity: 0.85,
  },
  toast: {
    position: "absolute",
    top: 50,
    // bottom: 40,
    left: 20,
    right: 20,
    backgroundColor: "#e03487",
    padding: 14,
    borderRadius: 10,
    alignItems: "center",
    zIndex: 100,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
  },
  toastText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
});

export default HomeScreen;
