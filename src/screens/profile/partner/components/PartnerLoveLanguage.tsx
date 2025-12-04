// external
import React, { useMemo, useEffect } from "react";
import { View, Text, StyleSheet } from "react-native";
import { Feather } from "@expo/vector-icons";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  withRepeat,
  interpolate,
  Easing,
  FadeIn,
} from "react-native-reanimated";

// internal
import { PartnerLoveLanguageProps } from "../../../../types/LoveLanguage";
import { useTheme } from "../../../../theme/ThemeContext";

const PartnerLoveLanguage: React.FC<PartnerLoveLanguageProps> = ({
  loveLanguage = "",
}) => {
  // variables
  const { theme } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);

  // animation variables
  const cardScale = useSharedValue(0.95);
  const cardFadeIn = useSharedValue(0);
  const heartPulse = useSharedValue(1);
  const glowAnimation = useSharedValue(0);

  // use effects
  useEffect(() => {
    cardFadeIn.value = withTiming(1, {
      duration: 600,
      easing: Easing.out(Easing.cubic),
    });

    cardScale.value = withSpring(1, {
      damping: 12,
      stiffness: 150,
    });

    // Heart pulse animation
    heartPulse.value = withRepeat(
      withTiming(1.1, {
        duration: 1500,
        easing: Easing.inOut(Easing.sin),
      }),
      -1,
      true
    );

    // Glow animation
    glowAnimation.value = withRepeat(
      withTiming(1, {
        duration: 3000,
        easing: Easing.inOut(Easing.sin),
      }),
      -1,
      true
    );
  }, []);

  // animated styles
  const cardAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: cardScale.value }],
    opacity: cardFadeIn.value,
  }));

  const heartPulseStyle = useAnimatedStyle(() => ({
    transform: [{ scale: heartPulse.value }],
  }));

  const glowStyle = useAnimatedStyle(() => ({
    shadowColor: "#ff6b9d",
    shadowOpacity: interpolate(glowAnimation.value, [0, 1], [0.15, 0.3]),
    shadowRadius: interpolate(glowAnimation.value, [0, 1], [8, 16]),
  }));

  // Helper to get love language emoji
  const getLoveLanguageEmoji = (lang: string): string => {
    const lowerLang = lang.toLowerCase();
    if (lowerLang.includes("words")) return "💬";
    if (lowerLang.includes("quality")) return "⏰";
    if (lowerLang.includes("gifts")) return "🎁";
    if (lowerLang.includes("acts")) return "🤝";
    if (lowerLang.includes("touch")) return "🤗";
    return "💕";
  };

  // Helper to get love language description
  const getLoveLanguageDescription = (lang: string): string => {
    const lowerLang = lang.toLowerCase();
    if (lowerLang.includes("words")) return "Words of Affirmation";
    if (lowerLang.includes("quality")) return "Quality Time";
    if (lowerLang.includes("gifts")) return "Receiving Gifts";
    if (lowerLang.includes("acts")) return "Acts of Service";
    if (lowerLang.includes("touch")) return "Physical Touch";
    return lang;
  };

  if (!loveLanguage) {
    return (
      <Animated.View
        entering={FadeIn.duration(400)}
        style={[styles.wrapper, cardAnimatedStyle]}
      >
        <View style={styles.emptyCard}>
          <View style={styles.emptyIconContainer}>
            <Feather name="heart" size={32} color={theme.colors.mutedAlt} />
          </View>
          <Text style={styles.emptyText}>No love language added yet</Text>
        </View>
      </Animated.View>
    );
  }

  return (
    <Animated.View
      entering={FadeIn.duration(400)}
      style={[styles.card, cardAnimatedStyle, glowStyle]}
    >
      <View style={styles.cardHeader}>
        <View style={styles.cardHeaderLeft}>
          <View style={styles.iconContainer}>
            <Animated.View style={heartPulseStyle}>
              <Feather name="heart" size={20} color="#ff6b9d" />
            </Animated.View>
          </View>
          <Text style={styles.cardTitle}>Love Language</Text>
        </View>
        <Text style={styles.emoji}>{getLoveLanguageEmoji(loveLanguage)}</Text>
      </View>

      <View style={styles.cardContent}>
        <Text style={styles.loveLanguageText}>
          {getLoveLanguageDescription(loveLanguage)}
        </Text>
        <View style={styles.descriptionContainer}>
          <Feather
            name="info"
            size={14}
            color={theme.colors.muted}
            style={styles.infoIcon}
          />
          <Text style={styles.descriptionText}>
            This is how your partner feels most loved
          </Text>
        </View>
      </View>
    </Animated.View>
  );
};

const createStyles = (theme: ReturnType<typeof useTheme>["theme"]) =>
  StyleSheet.create({
    wrapper: {
      width: "100%",
      marginBottom: 24,
      marginTop: 20,
    },
    card: {
      backgroundColor: theme.colors.surfaceAlt,
      borderRadius: 20,
      padding: 20,
      marginTop: 20,
      shadowColor: theme.colors.shadow,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.1,
      shadowRadius: 12,
      elevation: 4,
      borderWidth: 1,
      borderColor: "#ff6b9d" + "30",
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
    emptyIconContainer: {
      width: 64,
      height: 64,
      borderRadius: 32,
      backgroundColor: theme.colors.mutedAlt + "15",
      alignItems: "center",
      justifyContent: "center",
      marginBottom: 16,
    },
    emptyText: {
      fontSize: 14,
      color: theme.colors.mutedAlt,
      fontStyle: "italic",
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
    cardTitle: {
      fontSize: 16,
      fontWeight: "700",
      color: theme.colors.muted,
      letterSpacing: 0.5,
    },
    emoji: {
      fontSize: 28,
    },
    cardContent: {
      gap: 10,
    },
    loveLanguageText: {
      fontSize: 24,
      fontWeight: "800",
      color: theme.colors.text,
      letterSpacing: 0.3,
    },
    descriptionContainer: {
      flexDirection: "row",
      alignItems: "center",
      marginTop: 4,
    },
    infoIcon: {
      marginRight: 6,
    },
    descriptionText: {
      fontSize: 13,
      color: theme.colors.mutedAlt,
      lineHeight: 18,
      flex: 1,
    },
  });

export default PartnerLoveLanguage;
