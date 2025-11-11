// external
import React, { useEffect, useMemo } from "react";
import { View, Text, StyleSheet } from "react-native";
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
import { PartnerStatusMoodProps } from "../../../../types/StatusMood";
import { formatDistance } from "../../../../utils/formatters/formatDistance";
import { useTheme } from "../../../../theme/ThemeContext";

const PartnerStatusMood: React.FC<PartnerStatusMoodProps> = ({
  mood,
  moodDescription,
  status = "unavailable",
  statusDescription,
  statusDistance,
}) => {
  // variables
  const { theme } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);

  // use effects
  useEffect(() => {
    floatAnimation.value = withRepeat(
      withTiming(1, { duration: 3000, easing: Easing.inOut(Easing.sin) }),
      -1,
      true
    );

    fadeInAnimation.value = withTiming(1, {
      duration: 800,
      easing: Easing.out(Easing.cubic),
    });
  }, []);

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

  // animation variables
  const pulseAnimation = useSharedValue(1);
  const floatAnimation = useSharedValue(0);
  const statusColorAnimation = useSharedValue(0);
  const moodBounceAnimation = useSharedValue(0);
  const fadeInAnimation = useSharedValue(0);

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
    const colors = [
      "#4caf50",
      theme.colors.accent,
      "#db8a47",
      theme.colors.muted,
    ];
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
                ? { color: theme.colors.accent }
                : status === "unreachable"
                ? { color: "#db8a47ff" }
                : { color: theme.colors.muted },
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

      {status === "away" && statusDistance && (
        <Text style={styles.statusDistance}>
          {`${formatDistance(statusDistance)} away from home`}
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

const createStyles = (theme: ReturnType<typeof useTheme>["theme"]) =>
  StyleSheet.create({
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
      shadowColor: theme.colors.shadow,
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
      color: theme.colors.text,
      fontSize: 16,
      fontWeight: "bold",
      marginRight: 8,
      marginTop: 5,
    },
    statusDescription: {
      color: theme.colors.muted,
      fontSize: 14,
      marginBottom: 8,
      marginLeft: 2,
      marginTop: 6,
    },
    statusLabel: {
      fontSize: 18,
      color: theme.colors.muted,
      fontWeight: "bold",
      marginBottom: 2,
    },
    statusDistance: {
      color: theme.colors.primary,
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
      color: theme.colors.muted,
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
      color: theme.colors.text,
      fontWeight: "bold",
    },
    moodDescription: {
      fontSize: 14,
      color: theme.colors.muted,
      marginLeft: 4,
    },
  });

export default PartnerStatusMood;
