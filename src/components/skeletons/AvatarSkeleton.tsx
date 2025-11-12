// external
import { useEffect, useRef } from "react";
import { View, StyleSheet, Animated, ViewStyle } from "react-native";

type Props = {
  style?: ViewStyle;
  darkColor?: string;
  highlightColor?: string;
  duration?: number;
};

export default function AvatarSkeleton({
  style,
  darkColor = "#1e2035",
  highlightColor = "rgba(255,255,255,0.10)",
  duration = 1200,
}: Props) {
  const translate = useRef(new Animated.Value(-1)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(translate, {
          toValue: 1,
          duration,
          useNativeDriver: true,
        }),
        Animated.timing(translate, {
          toValue: -1,
          duration: 0,
          useNativeDriver: true,
        }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [translate, duration]);

  return (
    <View style={[styles.container, { backgroundColor: darkColor }, style]}>
      <Animated.View
        style={[
          styles.shimmer,
          {
            backgroundColor: highlightColor,
            transform: [
              {
                translateX: translate.interpolate({
                  inputRange: [-1, 1],
                  outputRange: [-80, 80],
                }),
              },
            ],
          },
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    overflow: "hidden",
  },
  shimmer: {
    position: "absolute",
    top: 0,
    bottom: 0,
    width: 80,
    opacity: 0.7,
  },
});
