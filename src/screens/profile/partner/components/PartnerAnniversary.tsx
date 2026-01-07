// external
import { View, Text, StyleSheet } from "react-native";
import React, { useMemo, useEffect } from "react";
import { Feather } from "@expo/vector-icons";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withDelay,
  withTiming,
  interpolate,
  Easing,
  FadeIn,
} from "react-native-reanimated";

// internal (hooks)
import { SpecialDate } from "../../../../types/SpecialDate";
import { useTheme } from "../../../../theme/ThemeContext";

// screen content
import Shimmer from "../../../../components/skeletons/Shimmer";

// types
type PartnerAnniversaryProps = {
  specialDates: SpecialDate[];
  specialDatesLoading: boolean;
};

const PartnerAnniversary: React.FC<PartnerAnniversaryProps> = ({
  specialDates,
  specialDatesLoading,
}) => {
  // variables
  const { theme } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);

  // animation variables
  const anniversaryCardScale = useSharedValue(0.95);
  const dayMetCardScale = useSharedValue(0.95);
  const anniversaryGlow = useSharedValue(0);
  const dayMetGlow = useSharedValue(0);
  const cardFadeIn = useSharedValue(0);

  // use effects
  useEffect(() => {
    cardFadeIn.value = withTiming(1, {
      duration: 600,
      easing: Easing.out(Easing.cubic),
    });

    anniversaryCardScale.value = withSpring(1, {
      damping: 12,
      stiffness: 150,
    });

    dayMetCardScale.value = withDelay(
      100,
      withSpring(1, {
        damping: 12,
        stiffness: 150,
      })
    );

    // glow animations
    anniversaryGlow.value = withTiming(1, {
      duration: 2000,
      easing: Easing.inOut(Easing.sin),
    });

    dayMetGlow.value = withDelay(
      200,
      withTiming(1, {
        duration: 2000,
        easing: Easing.inOut(Easing.sin),
      })
    );
  }, []);

  // animated styles
  const anniversaryCardAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: anniversaryCardScale.value }],
    opacity: cardFadeIn.value,
  }));

  const dayMetCardAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: dayMetCardScale.value }],
    opacity: cardFadeIn.value,
  }));

  const anniversaryGlowStyle = useAnimatedStyle(() => ({
    shadowColor: "#ff6b9d",
    shadowOpacity: interpolate(anniversaryGlow.value, [0, 1], [0.1, 0.25]),
    shadowRadius: interpolate(anniversaryGlow.value, [0, 1], [8, 16]),
  }));

  const dayMetGlowStyle = useAnimatedStyle(() => ({
    shadowColor: theme.colors.primary,
    shadowOpacity: interpolate(dayMetGlow.value, [0, 1], [0.1, 0.25]),
    shadowRadius: interpolate(dayMetGlow.value, [0, 1], [8, 16]),
  }));

  // helpers
  const formatDisplayDate = (
    dateString: string,
    timeInfo?: string
  ): { date: string; timeInfo?: string } => {
    if (!dateString || dateString === "Not set") {
      return {
        date: "Not set",
      };
    }

    try {
      const date = new Date(dateString);
      const day = date.getDate();
      const month = date.toLocaleDateString("en-US", { month: "short" });
      const year = date.getFullYear();
      const formattedDate = `${day} ${month} ${year}`;

      return {
        date: formattedDate,
        timeInfo,
      };
    } catch (error) {
      return { date: dateString };
    }
  };

  const getAnniversaryDisplay = (): {
    date: string;
    timeInfo?: string;
    nextAnniversary?: string;
    description?: string;
  } => {
    const anniversary = specialDates.find((date: SpecialDate) =>
      date.title.toLowerCase().includes("anniversary")
    );

    if (anniversary) {
      const formatted = formatDisplayDate(
        anniversary.date,
        anniversary.togetherFor
      );
      return {
        date: formatted.date,
        timeInfo: formatted.timeInfo,
        nextAnniversary: anniversary.nextAnniversaryIn,
        description: anniversary.description,
      };
    }
    return {
      date: "Not set",
    };
  };

  const getDayMetDisplay = (): {
    date: string;
    timeInfo?: string;
    nextMetDay?: string;
    description?: string;
  } => {
    const dayMet = specialDates.find((date: SpecialDate) =>
      date.title.toLowerCase().includes("met")
    );

    if (dayMet) {
      const formatted = formatDisplayDate(dayMet.date, dayMet.knownFor);
      return {
        date: formatted.date,
        timeInfo: formatted.timeInfo,
        nextMetDay: dayMet.nextMetDayIn,
        description: dayMet.description,
      };
    }
    return {
      date: "Not set",
    };
  };

  // declarations
  const anniversaryDisplay = getAnniversaryDisplay();
  const dayMetDisplay = getDayMetDisplay();

  if (specialDatesLoading) {
    return (
      <View style={styles.wrapper}>
        <Shimmer radius={20} height={140} style={{ width: "100%" }} />
        <Shimmer
          radius={20}
          height={140}
          style={{ width: "100%", marginTop: 16 }}
        />
      </View>
    );
  }

  return (
    <View style={styles.wrapper}>
      <Animated.View
        entering={FadeIn.duration(400)}
        style={styles.anniversaryCard}
      >
        <Animated.View
          style={[anniversaryCardAnimatedStyle, anniversaryGlowStyle]}
        >
          <View style={styles.cardHeader}>
            <View style={styles.cardHeaderLeft}>
              <View style={styles.iconContainer}>
                <Feather name="heart" size={20} color="#ff6b9d" />
              </View>
              <Text style={styles.cardTitle}>Anniversary</Text>
            </View>
            <Text style={styles.heartEmoji}>💕</Text>
          </View>

          <View style={styles.cardContent}>
            {anniversaryDisplay.date !== "Not set" ? (
              <>
                <Text style={styles.dateText}>{anniversaryDisplay.date}</Text>
                {anniversaryDisplay.timeInfo && (
                  <View style={styles.timeInfoContainer}>
                    <Feather
                      name="clock"
                      size={14}
                      color={theme.colors.primary}
                      style={styles.timeIcon}
                    />
                    <Text style={styles.timeInfo}>
                      {anniversaryDisplay.timeInfo}
                    </Text>
                  </View>
                )}
                {anniversaryDisplay.nextAnniversary && (
                  <View style={styles.nextEventContainer}>
                    <Feather
                      name="calendar"
                      size={12}
                      color={theme.colors.muted}
                    />
                    <Text style={styles.nextEventText}>
                      Next in {anniversaryDisplay.nextAnniversary}
                    </Text>
                  </View>
                )}
                {anniversaryDisplay.description && (
                  <Text style={styles.descriptionText}>
                    {anniversaryDisplay.description}
                  </Text>
                )}
              </>
            ) : (
              <View style={styles.emptyState}>
                <Text style={styles.emptyStateText}>
                  No anniversary date set
                </Text>
              </View>
            )}
          </View>
        </Animated.View>
      </Animated.View>

      <Animated.View
        entering={FadeIn.duration(400).delay(100)}
        style={styles.dayMetCard}
      >
        <Animated.View style={[dayMetCardAnimatedStyle, dayMetGlowStyle]}>
          <View style={styles.cardHeader}>
            <View style={styles.cardHeaderLeft}>
              <View style={[styles.iconContainer, styles.dayMetIconContainer]}>
                <Feather name="users" size={20} color={theme.colors.primary} />
              </View>
              <Text style={styles.cardTitle}>Day We Met</Text>
            </View>
            <Text style={styles.sparkleEmoji}>✨</Text>
          </View>

          <View style={styles.cardContent}>
            {dayMetDisplay.date !== "Not set" ? (
              <>
                <Text style={styles.dateText}>{dayMetDisplay.date}</Text>
                {dayMetDisplay.timeInfo && (
                  <View style={styles.timeInfoContainer}>
                    <Feather
                      name="clock"
                      size={14}
                      color={theme.colors.primary}
                      style={styles.timeIcon}
                    />
                    <Text style={styles.timeInfo}>
                      {dayMetDisplay.timeInfo}
                    </Text>
                  </View>
                )}
                {dayMetDisplay.nextMetDay && (
                  <View style={styles.nextEventContainer}>
                    <Feather
                      name="calendar"
                      size={12}
                      color={theme.colors.muted}
                    />
                    <Text style={styles.nextEventText}>
                      Next in {dayMetDisplay.nextMetDay}
                    </Text>
                  </View>
                )}
                {dayMetDisplay.description && (
                  <Text style={styles.descriptionText}>
                    {dayMetDisplay.description}
                  </Text>
                )}
              </>
            ) : (
              <View style={styles.emptyState}>
                <Text style={styles.emptyStateText}>No date set</Text>
              </View>
            )}
          </View>
        </Animated.View>
      </Animated.View>
    </View>
  );
};

const createStyles = (theme: ReturnType<typeof useTheme>["theme"]) =>
  StyleSheet.create({
    wrapper: {
      width: "100%",
      marginBottom: 24,
      gap: 16,
    },
    anniversaryCard: {
      backgroundColor: theme.colors.surfaceAlt,
      borderRadius: 20,
      padding: 20,
      shadowColor: theme.colors.shadow,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.1,
      shadowRadius: 12,
      elevation: 4,
      borderWidth: 1,
      borderColor: "#ff6b9d" + "30",
    },
    dayMetCard: {
      backgroundColor: theme.colors.surfaceAlt,
      borderRadius: 20,
      padding: 20,
      shadowColor: theme.colors.shadow,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.1,
      shadowRadius: 12,
      elevation: 4,
      borderWidth: 1,
      borderColor: theme.colors.primary + "30",
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
    iconContainer: {
      width: 36,
      height: 36,
      borderRadius: 18,
      backgroundColor: "#ff6b9d" + "20",
      alignItems: "center",
      justifyContent: "center",
    },
    dayMetIconContainer: {
      backgroundColor: theme.colors.primary + "20",
    },
    cardTitle: {
      fontSize: 16,
      fontWeight: "700",
      color: theme.colors.muted,
      letterSpacing: 0.5,
    },
    heartEmoji: {
      fontSize: 24,
    },
    sparkleEmoji: {
      fontSize: 24,
    },
    cardContent: {
      gap: 10,
    },
    dateText: {
      fontSize: 22,
      fontWeight: "800",
      color: theme.colors.text,
      letterSpacing: 0.3,
    },
    timeInfoContainer: {
      flexDirection: "row",
      alignItems: "center",
      marginTop: 4,
    },
    timeIcon: {
      marginRight: 6,
    },
    timeInfo: {
      fontSize: 14,
      color: theme.colors.primary,
      fontWeight: "600",
    },
    nextEventContainer: {
      flexDirection: "row",
      alignItems: "center",
      marginTop: 8,
      gap: 6,
      paddingTop: 8,
      borderTopWidth: 1,
      borderTopColor: theme.colors.separator + "30",
    },
    nextEventText: {
      fontSize: 12,
      color: theme.colors.muted,
      fontWeight: "500",
    },
    descriptionText: {
      fontSize: 13,
      color: theme.colors.mutedAlt,
      marginTop: 6,
      lineHeight: 18,
      fontStyle: "italic",
    },
    emptyState: {
      paddingVertical: 8,
    },
    emptyStateText: {
      fontSize: 14,
      color: theme.colors.mutedAlt,
      fontStyle: "italic",
    },
  });

export default PartnerAnniversary;
