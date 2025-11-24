// external
import React, { useEffect, useMemo } from "react";
import { View, StyleSheet } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
} from "react-native-reanimated";
import { LinearGradient } from "expo-linear-gradient";

// internal
import { useTheme } from "../../theme/ThemeContext";

// types
type ShimmerProps = {
  height: number;
  radius?: number;
  style?: any;
};

export default function Shimmer({ height, radius = 8, style }: ShimmerProps) {
  // variables
  const { theme } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const translateX = useSharedValue<number>(-200);

  // use effects
  useEffect(() => {
    translateX.value = withRepeat(
      withTiming(200, { duration: 1200 }),
      -1,
      false
    );
  }, []);

  // animations
  const animStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  return (
    <View style={[styles.container, { height, borderRadius: radius }, style]}>
      <Animated.View style={[styles.shimmerOverlay, animStyle]}>
        <LinearGradient
          colors={[
            "transparent",
            theme.colors.skeletonHighlight,
            "transparent",
          ]}
          start={{ x: 0, y: 0.5 }}
          end={{ x: 1, y: 0.5 }}
          style={StyleSheet.absoluteFill}
        />
      </Animated.View>
    </View>
  );
}

const createStyles = (theme: ReturnType<typeof useTheme>["theme"]) =>
  StyleSheet.create({
    container: {
      backgroundColor: theme.colors.skeletonDark,
      overflow: "hidden",
    },
    shimmerOverlay: {
      ...StyleSheet.absoluteFillObject,
    },
  });
