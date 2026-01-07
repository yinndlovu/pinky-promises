// external
import React, { useMemo, useEffect } from "react";
import { View, Text, StyleSheet } from "react-native";
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

// internal
import { PartnerFavoritesProps } from "../../../../types/Favorites";
import { useTheme } from "../../../../theme/ThemeContext";

const PartnerFavorites: React.FC<PartnerFavoritesProps> = ({ favorites }) => {
  // variables
  const { theme } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);

  // animation variables
  const cardFadeIn = useSharedValue(0);

  // use effects
  useEffect(() => {
    cardFadeIn.value = withTiming(1, {
      duration: 600,
      easing: Easing.out(Easing.cubic),
    });
  }, []);

  // animated styles
  const fadeInStyle = useAnimatedStyle(() => ({
    opacity: cardFadeIn.value,
  }));

  // Helper to get icon for favorite type
  const getFavoriteIcon = (label: string): string => {
    const lowerLabel = label.toLowerCase();
    if (lowerLabel.includes("color")) return "image";
    if (lowerLabel.includes("food")) return "coffee";
    if (lowerLabel.includes("snack")) return "circle";
    if (lowerLabel.includes("activity")) return "activity";
    if (lowerLabel.includes("holiday")) return "calendar";
    if (lowerLabel.includes("time")) return "clock";
    if (lowerLabel.includes("season")) return "sun";
    if (lowerLabel.includes("animal")) return "heart";
    if (lowerLabel.includes("drink")) return "droplet";
    if (lowerLabel.includes("pet")) return "heart";
    if (lowerLabel.includes("show")) return "tv";
    return "star";
  };

  // Helper to get emoji for favorite type
  const getFavoriteEmoji = (label: string): string => {
    const lowerLabel = label.toLowerCase();
    if (lowerLabel.includes("color")) return "🎨";
    if (lowerLabel.includes("food")) return "🍽️";
    if (lowerLabel.includes("snack")) return "🍪";
    if (lowerLabel.includes("activity")) return "⚽";
    if (lowerLabel.includes("holiday")) return "🎉";
    if (lowerLabel.includes("time")) return "⏰";
    if (lowerLabel.includes("season")) return "🍂";
    if (lowerLabel.includes("animal")) return "🐾";
    if (lowerLabel.includes("drink")) return "🥤";
    if (lowerLabel.includes("pet")) return "🐕";
    if (lowerLabel.includes("show")) return "📺";
    return "⭐";
  };

  if (favorites.length === 0) {
    return (
      <Animated.View entering={FadeIn.duration(400)} style={styles.wrapper}>
        <Animated.View style={fadeInStyle}>
          <View style={styles.headerContainer}>
            <View style={styles.headerLeft}>
              <View style={styles.iconContainer}>
                <Feather name="star" size={20} color={theme.colors.primary} />
              </View>
              <Text style={styles.title}>Favorites</Text>
            </View>
          </View>
          <View style={styles.emptyCard}>
            <Feather
              name="star"
              size={32}
              color={theme.colors.mutedAlt}
              style={styles.emptyIcon}
            />
            <Text style={styles.emptyText}>No favorites added yet</Text>
          </View>
        </Animated.View>
      </Animated.View>
    );
  }

  // Group favorites into rows of 2
  const rows = [];
  for (let i = 0; i < favorites.length; i += 2) {
    rows.push(favorites.slice(i, i + 2));
  }

  return (
    <Animated.View entering={FadeIn.duration(400)} style={styles.wrapper}>
      <Animated.View style={fadeInStyle}>
        <View style={styles.headerContainer}>
          <View style={styles.headerLeft}>
            <View style={styles.iconContainer}>
              <Feather name="star" size={20} color={theme.colors.primary} />
            </View>
            <Text style={styles.title}>Favorites</Text>
          </View>
          <Text style={styles.countBadge}>{favorites.length}</Text>
        </View>

        <View style={styles.cardsContainer}>
          {rows.map((row, rowIdx) => (
            <View style={styles.row} key={rowIdx}>
              {row.map((item, itemIdx) => {
                const globalIdx = rowIdx * 2 + itemIdx;
                return (
                  <Animated.View
                    entering={FadeIn.duration(300).delay(globalIdx * 50)}
                    key={itemIdx}
                    style={[
                      styles.favoriteCard,
                      row.length === 1 && styles.singleCard,
                    ]}
                  >
                    <View style={styles.cardHeader}>
                      <View style={styles.cardIconContainer}>
                        <Feather
                          name={getFavoriteIcon(item.label) as any}
                          size={16}
                          color={theme.colors.primary}
                        />
                      </View>
                      <Text style={styles.emoji}>{getFavoriteEmoji(item.label)}</Text>
                    </View>
                    <View style={styles.cardContent}>
                      <Text style={styles.label} numberOfLines={1}>
                        {item.label}
                      </Text>
                      <Text style={styles.value} numberOfLines={2}>
                        {item.value}
                      </Text>
                    </View>
                  </Animated.View>
                );
              })}
              {row.length === 1 && <View style={styles.placeholderCard} />}
            </View>
          ))}
        </View>
      </Animated.View>
    </Animated.View>
  );
};

const createStyles = (theme: ReturnType<typeof useTheme>["theme"]) =>
  StyleSheet.create({
    wrapper: {
      width: "100%",
      marginBottom: 24,
    },
    headerContainer: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      marginBottom: 16,
    },
    headerLeft: {
      flexDirection: "row",
      alignItems: "center",
      gap: 10,
    },
    iconContainer: {
      width: 36,
      height: 36,
      borderRadius: 18,
      backgroundColor: theme.colors.primary + "20",
      alignItems: "center",
      justifyContent: "center",
    },
    title: {
      fontSize: 18,
      fontWeight: "700",
      color: theme.colors.muted,
      letterSpacing: 0.5,
    },
    countBadge: {
      fontSize: 12,
      fontWeight: "600",
      color: theme.colors.primary,
      backgroundColor: theme.colors.primary + "15",
      paddingHorizontal: 10,
      paddingVertical: 4,
      borderRadius: 12,
      overflow: "hidden",
    },
    cardsContainer: {
      gap: 12,
    },
    row: {
      flexDirection: "row",
      gap: 12,
    },
    favoriteCard: {
      flex: 1,
      backgroundColor: theme.colors.surfaceAlt,
      borderRadius: 16,
      padding: 16,
      shadowColor: theme.colors.shadow,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.08,
      shadowRadius: 8,
      elevation: 2,
      borderWidth: 1,
      borderColor: theme.colors.separator + "30",
      minHeight: 100,
    },
    singleCard: {
      flex: 1,
    },
    placeholderCard: {
      flex: 1,
    },
    cardHeader: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      marginBottom: 12,
    },
    cardIconContainer: {
      width: 28,
      height: 28,
      borderRadius: 14,
      backgroundColor: theme.colors.primary + "15",
      alignItems: "center",
      justifyContent: "center",
    },
    emoji: {
      fontSize: 20,
    },
    cardContent: {
      gap: 6,
    },
    label: {
      fontSize: 11,
      fontWeight: "600",
      color: theme.colors.muted,
      textTransform: "uppercase",
      letterSpacing: 0.5,
    },
    value: {
      fontSize: 15,
      fontWeight: "700",
      color: theme.colors.text,
      lineHeight: 20,
    },
    emptyCard: {
      backgroundColor: theme.colors.surfaceAlt,
      borderRadius: 20,
      padding: 40,
      alignItems: "center",
      justifyContent: "center",
      borderWidth: 1,
      borderColor: theme.colors.separator + "30",
      borderStyle: "dashed",
    },
    emptyIcon: {
      marginBottom: 12,
      opacity: 0.5,
    },
    emptyText: {
      fontSize: 14,
      color: theme.colors.mutedAlt,
      fontStyle: "italic",
    },
  });

export default PartnerFavorites;
