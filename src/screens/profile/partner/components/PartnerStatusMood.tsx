// external
import React, { useEffect, useMemo } from "react";
import { View, Text, StyleSheet } from "react-native";
import { Feather } from "@expo/vector-icons";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withRepeat,
  withTiming,
  withDelay,
  interpolate,
  Easing,
  FadeIn,
  FadeOut,
} from "react-native-reanimated";

// internal
import { PartnerStatusMoodProps } from "../../../../types/StatusMood";
import { formatDistance } from "../../../../utils/formatters/formatDistance";
import { useTheme } from "../../../../theme/ThemeContext";

const PartnerStatusMood: React.FC<PartnerStatusMoodProps> = ({
  mood,
  moodDescription,
  status = "unavailable",
  statusDescription,
  statusDistance,
  userSuburb,
  userLocation,
}) => {
  // variables
  const { theme } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);

  // animation variables
  const statusCardScale = useSharedValue(0.95);
  const moodCardScale = useSharedValue(0.95);
  const statusPulse = useSharedValue(1);
  const moodFloat = useSharedValue(0);
  const statusGlow = useSharedValue(0);
  const moodGlow = useSharedValue(0);
  const cardFadeIn = useSharedValue(0);

  // Format location display
  const formatLocation = () => {
    if (!userLocation) return null;
    if (userSuburb && userSuburb.trim() !== "") {
      return `${userSuburb}, ${userLocation}`;
    }
    return userLocation;
  };

  const displayLocation = formatLocation();

  // use effects
  useEffect(() => {
    // Card entrance animations
    cardFadeIn.value = withTiming(1, {
      duration: 600,
      easing: Easing.out(Easing.cubic),
    });

    statusCardScale.value = withSpring(1, {
      damping: 12,
      stiffness: 150,
    });

    moodCardScale.value = withDelay(
      100,
      withSpring(1, {
        damping: 12,
        stiffness: 150,
      })
    );
  }, []);

  useEffect(() => {
    // Status pulse animation
    statusPulse.value = withRepeat(
      withTiming(1.15, {
        duration: 2000,
        easing: Easing.inOut(Easing.sin),
      }),
      -1,
      true
    );

    // Status glow animation
    statusGlow.value = withRepeat(
      withTiming(1, {
        duration: 3000,
        easing: Easing.inOut(Easing.sin),
      }),
      -1,
      true
    );
  }, [status]);

  useEffect(() => {
    // Mood float animation
    moodFloat.value = withRepeat(
      withTiming(1, {
        duration: 4000,
        easing: Easing.inOut(Easing.sin),
      }),
      -1,
      true
    );

    // Mood glow animation
    moodGlow.value = withRepeat(
      withTiming(1, {
        duration: 2500,
        easing: Easing.inOut(Easing.sin),
      }),
      -1,
      true
    );
  }, [mood]);

  // animated styles
  const statusCardAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: statusCardScale.value }],
    opacity: cardFadeIn.value,
  }));

  const moodCardAnimatedStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: moodCardScale.value },
      {
        translateY: interpolate(moodFloat.value, [0, 1], [0, -4]),
      },
    ],
    opacity: cardFadeIn.value,
  }));

  const statusPulseStyle = useAnimatedStyle(() => ({
    transform: [{ scale: statusPulse.value }],
  }));

  const statusGlowStyle = useAnimatedStyle(() => {
    const getStatusColor = () => {
      switch (status) {
        case "home":
          return "#4caf50";
        case "away":
          return theme.colors.accent;
        case "unreachable":
          return "#db8a47";
        default:
          return theme.colors.muted;
      }
    };

    return {
      shadowColor: getStatusColor(),
      shadowOpacity: interpolate(statusGlow.value, [0, 1], [0.2, 0.4]),
      shadowRadius: interpolate(statusGlow.value, [0, 1], [8, 16]),
    };
  });

  const moodGlowStyle = useAnimatedStyle(() => ({
    shadowColor: theme.colors.primary,
    shadowOpacity: interpolate(moodGlow.value, [0, 1], [0.15, 0.3]),
    shadowRadius: interpolate(moodGlow.value, [0, 1], [6, 12]),
  }));

  // helpers
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

  const getStatusColor = () => {
    switch (status) {
      case "home":
        return "#4caf50";
      case "away":
        return theme.colors.accent;
      case "unreachable":
        return "#db8a47";
      default:
        return theme.colors.muted;
    }
  };

  const getMoodEmoji = (mood: string | undefined) => {
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

  const getStatusText = () => {
    switch (status) {
      case "home":
        return "Home";
      case "away":
        return "Away";
      case "unreachable":
        return "Unreachable";
      default:
        return "Unavailable";
    }
  };

  return (
    <View style={styles.wrapper}>
      {/* Status Card */}
      <Animated.View
        entering={FadeIn.duration(400)}
        style={[styles.statusCard, statusCardAnimatedStyle, statusGlowStyle]}
      >
        <View style={styles.cardHeader}>
          <View style={styles.cardHeaderLeft}>
            <Animated.View style={[styles.statusIndicator, statusPulseStyle]}>
              <View
                style={[
                  styles.statusDot,
                  { backgroundColor: getStatusColor() },
                ]}
              />
            </Animated.View>
            <Text style={styles.cardTitle}>Status</Text>
          </View>
          <Text style={styles.statusEmoji}>{getStatusEmoji(status)}</Text>
        </View>

        <View style={styles.cardContent}>
          <Text style={[styles.statusText, { color: getStatusColor() }]}>
            {getStatusText()}
          </Text>
          {displayLocation && (
            <View style={styles.locationContainer}>
              <Feather
                name="map-pin"
                size={14}
                color={theme.colors.muted}
                style={styles.locationIcon}
              />
              <Text style={styles.locationText}>{displayLocation}</Text>
            </View>
          )}
          {statusDescription && (
            <Text style={styles.statusDescription}>{statusDescription}</Text>
          )}
          {status === "away" && statusDistance && (
            <View style={styles.distanceContainer}>
              <Feather
                name="navigation"
                size={12}
                color={theme.colors.primary}
              />
              <Text style={styles.distanceText}>
                {formatDistance(statusDistance)} away
              </Text>
            </View>
          )}
        </View>
      </Animated.View>

      {/* Mood Card */}
      <Animated.View
        entering={FadeIn.duration(400).delay(100)}
        style={[styles.moodCard, moodCardAnimatedStyle, moodGlowStyle]}
      >
        <View style={styles.cardHeader}>
          <View style={styles.cardHeaderLeft}>
            <Text style={styles.moodEmoji}>{getMoodEmoji(mood)}</Text>
            <Text style={styles.cardTitle}>Mood</Text>
          </View>
        </View>

        <View style={styles.cardContent}>
          <Text style={styles.moodText}>
            {mood && mood !== "No mood" ? mood : "No mood"}
          </Text>
          {moodDescription && (
            <Text style={styles.moodDescription}>{moodDescription}</Text>
          )}
        </View>
      </Animated.View>
    </View>
  );
};

const createStyles = (theme: ReturnType<typeof useTheme>["theme"]) =>
  StyleSheet.create({
    wrapper: {
      width: "100%",
      marginBottom: 14,
      gap: 16,
    },
    statusCard: {
      backgroundColor: theme.colors.surfaceAlt,
      borderRadius: 20,
      padding: 20,
      shadowColor: theme.colors.shadow,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.1,
      shadowRadius: 12,
      elevation: 4,
      borderWidth: 1,
      borderColor: theme.colors.separator + "40",
    },
    moodCard: {
      backgroundColor: theme.colors.surfaceAlt,
      borderRadius: 20,
      padding: 20,
      shadowColor: theme.colors.shadow,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.1,
      shadowRadius: 12,
      elevation: 4,
      borderWidth: 1,
      borderColor: theme.colors.separator + "40",
    },
    cardHeader: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      marginBottom: 16,
    },
    cardHeaderLeft: {
      flexDirection: "row",
      alignItems: "center",
      gap: 10,
    },
    cardTitle: {
      fontSize: 16,
      fontWeight: "700",
      color: theme.colors.muted,
      letterSpacing: 0.5,
    },
    statusIndicator: {
      width: 16,
      height: 16,
      alignItems: "center",
      justifyContent: "center",
    },
    statusDot: {
      width: 12,
      height: 12,
      borderRadius: 6,
    },
    statusEmoji: {
      fontSize: 28,
    },
    moodEmoji: {
      fontSize: 24,
    },
    cardContent: {
      gap: 8,
    },
    statusText: {
      fontSize: 24,
      fontWeight: "800",
      color: theme.colors.text,
      letterSpacing: 0.3,
    },
    locationContainer: {
      flexDirection: "row",
      alignItems: "center",
      marginTop: 4,
    },
    locationIcon: {
      marginRight: 6,
    },
    locationText: {
      fontSize: 14,
      color: theme.colors.muted,
      fontWeight: "500",
    },
    statusDescription: {
      fontSize: 13,
      color: theme.colors.mutedAlt,
      marginTop: 4,
      lineHeight: 18,
    },
    distanceContainer: {
      flexDirection: "row",
      alignItems: "center",
      marginTop: 6,
      gap: 6,
    },
    distanceText: {
      fontSize: 12,
      color: theme.colors.primary,
      fontWeight: "600",
    },
    moodText: {
      fontSize: 22,
      fontWeight: "700",
      color: theme.colors.text,
      letterSpacing: 0.3,
    },
    moodDescription: {
      fontSize: 13,
      color: theme.colors.mutedAlt,
      marginTop: 4,
      lineHeight: 18,
    },
  });

export default PartnerStatusMood;
