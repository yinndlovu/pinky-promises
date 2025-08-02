// external
import React, { useEffect } from "react";
import { View, Text, StyleSheet } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useQuery } from "@tanstack/react-query";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withRepeat,
  withTiming,
  interpolate,
  Easing,
} from "react-native-reanimated";

// internal
import { fetchUserStatus } from "../../../services/userStatusService";
import { getUserMood } from "../../../services/moodService";
import { PartnerStatusMoodProps } from "../../../types/StatusMood";

const PartnerStatusMood: React.FC<PartnerStatusMoodProps> = ({
  partnerId,
  partnerName,
  refreshKey,
}) => {
  // use effects
  useEffect(() => {
    refetchPartnerMood();
    refetchPartnerStatus();
  }, [partnerId, partnerName, refreshKey]);
  // animation variables
  const pulseAnimation = useSharedValue(1);
  const floatAnimation = useSharedValue(0);
  const statusColorAnimation = useSharedValue(0);
  const moodBounceAnimation = useSharedValue(0);
  const fadeInAnimation = useSharedValue(0);

  // fetch functions
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
        return;
      }

      return await getUserMood(token, partnerId);
    },
    enabled: !!partnerId,
    staleTime: 1000 * 60 * 2,
  });

  const mood = partnerMood?.mood || "No mood";
  const moodDescription =
    partnerMood?.description || `${partnerName} hasn't set a mood yet`;

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
        return;
      }

      return await fetchUserStatus(token, partnerId);
    },
    enabled: !!partnerId,
    staleTime: 1000 * 60 * 2,
  });

  const status = partnerStatus?.unreachable
    ? "unreachable"
    : partnerStatus?.isAtHome
    ? "home"
    : partnerStatus?.isAtHome === false
    ? "away"
    : "unavailable";

  const statusDescription = partnerStatus?.unreachable
    ? `Can't find ${partnerName}'s current location`
    : partnerStatus?.isAtHome
    ? `${partnerName} is currently at home`
    : partnerStatus?.isAtHome === false
    ? `${partnerName} is currently not home`
    : `${partnerName} hasn't set a home location`;

  // use effects
  useEffect(() => {
    refetchPartnerMood();
    refetchPartnerStatus();

    floatAnimation.value = withRepeat(
      withTiming(1, { duration: 3000, easing: Easing.inOut(Easing.sin) }),
      -1,
      true
    );

    fadeInAnimation.value = withTiming(1, {
      duration: 800,
      easing: Easing.out(Easing.cubic),
    });
  }, [partnerId, partnerName, refreshKey]);

  useEffect(() => {
    const statusValues = { home: 0, away: 1, unreachable: 2, unavailable: 3 };
    const targetValue = statusValues[status as keyof typeof statusValues] || 3;

    statusColorAnimation.value = withSpring(targetValue, {
      damping: 15,
      stiffness: 150,
    });

    pulseAnimation.value = withRepeat(
      withTiming(1.2, { duration: 600, easing: Easing.out(Easing.cubic) }),
      2,
      true
    );
  }, [status]);

  useEffect(() => {
    if (mood && mood !== "No mood") {
      moodBounceAnimation.value = withSpring(1, {
        damping: 8,
        stiffness: 200,
      });
    }
  }, [mood]);

  // animated styles
  const pulseStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulseAnimation.value }],
  }));

  const floatStyle = useAnimatedStyle(() => ({
    transform: [
      {
        translateY: interpolate(floatAnimation.value, [0, 1], [0, -3]),
      },
    ],
  }));

  const statusColorStyle = useAnimatedStyle(() => {
    const colors = ["#4caf50", "#e03487", "#db8a47", "#b0b3c6"];
    const currentColor =
      colors[Math.round(statusColorAnimation.value)] || colors[3];

    return {
      backgroundColor: currentColor,
    };
  });

  const moodBounceStyle = useAnimatedStyle(() => ({
    transform: [
      {
        scale: withSpring(moodBounceAnimation.value, {
          damping: 8,
          stiffness: 200,
        }),
      },
    ],
  }));

  const fadeInStyle = useAnimatedStyle(() => ({
    opacity: fadeInAnimation.value,
    transform: [
      {
        translateY: interpolate(fadeInAnimation.value, [0, 1], [20, 0]),
      },
    ],
  }));

  const getStatusEmoji = (status: string) => {
    switch (status) {
      case "home":
        return "🏠";
      case "away":
        return "🚶";
      case "unreachable":
        return "❓";
      default:
        return "⏸️";
    }
  };

  const getMoodEmoji = (mood: string) => {
    if (!mood || mood === "No mood") {
      return "😐";
    }

    const moodEmojis: { [key: string]: string } = {
      happy: "😊",
      sad: "😢",
      excited: "🤩",
      irritated: "😠",
      content: "😌",
      annoyed: "🙄",
      "very happy": "😍",
      crying: "😭",
      neutral: "😐",
      angry: "😠",
      default: "😐",
    };
    return moodEmojis[mood.toLowerCase()] || moodEmojis.default;
  };

  return (
    <Animated.View style={[styles.wrapper, fadeInStyle]}>
      <View style={styles.headerRow}>
        <Text style={styles.statusLabel}>Status</Text>
      </View>

      <Animated.View style={[styles.statusRow, floatStyle]}>
        <Animated.View style={[styles.statusIndicator, pulseStyle]}>
          <Animated.View style={[styles.statusDot, statusColorStyle]} />
        </Animated.View>

        <View style={styles.statusContent}>
          <Text style={styles.statusEmoji}>{getStatusEmoji(status)}</Text>
          <Text
            style={[
              styles.statusValue,
              status === "home"
                ? { color: "#4caf50" }
                : status === "away"
                ? { color: "#e03487" }
                : status === "unreachable"
                ? { color: "#db8a47ff" }
                : { color: "#b0b3c6" },
            ]}
          >
            {status === "home"
              ? "Home"
              : status === "away"
              ? "Away"
              : status === "unreachable"
              ? "Unreachable"
              : "Unavailable"}
          </Text>
        </View>
      </Animated.View>

      <Text style={styles.statusDescription}>{statusDescription}</Text>

      {partnerStatus?.isAtHome === false && partnerStatus?.distance && (
        <Text style={styles.statusDistance}>
          {`${partnerStatus.distance} meters away from home`}
        </Text>
      )}

      <View style={styles.moodRow}>
        <Text style={styles.moodLabel}>Mood</Text>
      </View>

      <Animated.View style={[styles.moodContentRow, moodBounceStyle]}>
        <Text style={styles.moodEmoji}>{getMoodEmoji(mood)}</Text>
        <Text style={styles.moodValue}>{mood}</Text>
        <Text style={styles.moodDescription}> - {moodDescription}</Text>
      </Animated.View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    width: "100%",
    marginBottom: 14,
  },
  loadingContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 20,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 0,
  },
  statusRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 0,
  },
  statusIndicator: {
    marginRight: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  statusDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  statusContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  statusEmoji: {
    fontSize: 20,
    marginRight: 8,
  },
  statusValue: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
    marginRight: 8,
    marginTop: 5,
  },
  statusDescription: {
    color: "#b0b3c6",
    fontSize: 14,
    marginBottom: 8,
    marginLeft: 2,
    marginTop: 6,
  },
  statusLabel: {
    fontSize: 18,
    color: "#b0b3c6",
    fontWeight: "bold",
    marginBottom: 2,
  },
  statusDistance: {
    color: "#e03487",
    fontSize: 12,
    marginBottom: 12,
    marginLeft: 2,
    opacity: 0.8,
  },
  moodRow: {
    marginTop: 10,
    marginBottom: 4,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  moodLabel: {
    fontSize: 18,
    color: "#b0b3c6",
    fontWeight: "bold",
    marginBottom: 2,
  },
  moodContentRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  moodEmoji: {
    fontSize: 20,
    marginRight: 8,
  },
  moodValue: {
    fontSize: 16,
    color: "#fff",
    fontWeight: "bold",
  },
  moodDescription: {
    fontSize: 14,
    color: "#b0b3c6",
    marginLeft: 4,
  },
});

export default PartnerStatusMood;
