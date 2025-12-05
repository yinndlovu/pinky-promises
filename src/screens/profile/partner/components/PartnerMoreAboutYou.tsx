// external
import React, { useMemo, useEffect } from "react";
import { View, Text, StyleSheet } from "react-native";
import { Feather } from "@expo/vector-icons";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  withDelay,
  interpolate,
  Easing,
  FadeIn,
} from "react-native-reanimated";

// internal
import { PartnerAboutProps } from "../../../../types/About";
import { useTheme } from "../../../../theme/ThemeContext";

const PartnerMoreAboutYou: React.FC<PartnerAboutProps> = ({ about = "" }) => {
  // variables
  const { theme } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);

  // animation variables
  const cardScale = useSharedValue(0.95);
  const cardFadeIn = useSharedValue(0);
  const quoteMarkScale = useSharedValue(0);

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

    quoteMarkScale.value = withDelay(
      200,
      withSpring(1, {
        damping: 10,
        stiffness: 200,
      })
    );
  }, []);

  // animated styles
  const cardAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: cardScale.value }],
    opacity: cardFadeIn.value,
  }));

  const quoteMarkStyle = useAnimatedStyle(() => ({
    transform: [{ scale: quoteMarkScale.value }],
    opacity: cardFadeIn.value,
  }));

  if (!about) {
    return (
      <Animated.View
        entering={FadeIn.duration(400)}
        style={[styles.wrapper, cardAnimatedStyle]}
      >
        <View style={styles.emptyCard}>
          <View style={styles.emptyIconContainer}>
            <Feather name="file-text" size={32} color={theme.colors.mutedAlt} />
          </View>
          <Text style={styles.emptyText}>No information added yet</Text>
        </View>
      </Animated.View>
    );
  }

  return (
    <Animated.View
      entering={FadeIn.duration(400)}
      style={[styles.wrapper, cardAnimatedStyle]}
    >
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <View style={styles.cardHeaderLeft}>
            <View style={styles.iconContainer}>
              <Feather name="user" size={18} color={theme.colors.primary} />
            </View>
            <Text style={styles.cardTitle}>More About You</Text>
          </View>
        </View>

        <View style={styles.quoteContainer}>
          <Animated.View style={[styles.quoteMarkLeft, quoteMarkStyle]}>
            <Text style={styles.quoteMark}>"</Text>
          </Animated.View>
          <View style={styles.textContainer}>
            <Text style={styles.aboutText}>{about}</Text>
          </View>
          <View style={styles.quoteMarkRight}>
            <Text style={styles.quoteMarkRightText}>"</Text>
          </View>
        </View>

        <View style={styles.footer}>
          <Feather
            name="heart"
            size={12}
            color={theme.colors.mutedAlt}
            style={styles.footerIcon}
          />
          <Text style={styles.footerText}>A glimpse into their world</Text>
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
      shadowColor: theme.colors.shadow,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.1,
      shadowRadius: 12,
      elevation: 4,
      borderWidth: 1,
      borderColor: theme.colors.primary + "20",
      borderLeftWidth: 4,
      borderLeftColor: theme.colors.primary,
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
      backgroundColor: theme.colors.primary + "20",
      alignItems: "center",
      justifyContent: "center",
    },
    cardTitle: {
      fontSize: 16,
      fontWeight: "700",
      color: theme.colors.muted,
      letterSpacing: 0.5,
    },
    quoteContainer: {
      position: "relative",
      paddingVertical: 8,
      paddingHorizontal: 4,
      minHeight: 60,
    },
    quoteMarkLeft: {
      position: "absolute",
      top: -8,
      left: -4,
      zIndex: 0,
    },
    quoteMark: {
      fontSize: 48,
      color: theme.colors.primary + "40",
      fontFamily: "serif",
      lineHeight: 40,
    },
    quoteMarkRight: {
      alignItems: "flex-end",
      marginTop: -20,
      zIndex: 0,
    },
    quoteMarkRightText: {
      fontSize: 48,
      color: theme.colors.primary + "40",
      fontFamily: "serif",
      lineHeight: 40,
    },
    textContainer: {
      paddingLeft: 20,
      paddingRight: 8,
      paddingTop: 8,
      paddingBottom: 8,
      zIndex: 1,
      position: "relative",
    },
    aboutText: {
      fontSize: 16,
      color: theme.colors.text,
      lineHeight: 24,
      fontStyle: "italic",
    },
    footer: {
      flexDirection: "row",
      alignItems: "center",
      marginTop: 16,
      paddingTop: 16,
      borderTopWidth: 1,
      borderTopColor: theme.colors.separator + "30",
    },
    footerIcon: {
      marginRight: 6,
      opacity: 0.6,
    },
    footerText: {
      fontSize: 12,
      color: theme.colors.mutedAlt,
      fontStyle: "italic",
    },
  });

export default PartnerMoreAboutYou;
