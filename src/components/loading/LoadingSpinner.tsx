import React, { useEffect, useRef } from "react";
import { View, StyleSheet, Animated } from "react-native";

interface LoadingSpinnerProps {
  message?: string;
  size?: "small" | "medium" | "large";
  showMessage?: boolean;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  message = "Loading...",
  size = "medium",
  showMessage = true,
}) => {
  const spinAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const heartBeatAnim = useRef(new Animated.Value(1)).current;
  const particle1Anim = useRef(new Animated.Value(0)).current;
  const particle2Anim = useRef(new Animated.Value(0)).current;
  const particle3Anim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const spinAnimation = Animated.loop(
      Animated.timing(spinAnim, {
        toValue: 1,
        duration: 2000,
        useNativeDriver: true,
      })
    );

    const pulseAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.1,
          duration: 1500,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1500,
          useNativeDriver: true,
        }),
      ])
    );

    const heartBeatAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(heartBeatAnim, {
          toValue: 1.05,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(heartBeatAnim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
      ])
    );

    const particle1Animation = Animated.loop(
      Animated.sequence([
        Animated.timing(particle1Anim, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: false,
        }),
        Animated.timing(particle1Anim, {
          toValue: 0,
          duration: 2000,
          useNativeDriver: false,
        }),
      ])
    );

    const particle2Animation = Animated.loop(
      Animated.sequence([
        Animated.timing(particle2Anim, {
          toValue: 1,
          duration: 2500,
          useNativeDriver: false,
        }),
        Animated.timing(particle2Anim, {
          toValue: 0,
          duration: 2500,
          useNativeDriver: false,
        }),
      ])
    );

    const particle3Animation = Animated.loop(
      Animated.sequence([
        Animated.timing(particle3Anim, {
          toValue: 1,
          duration: 3000,
          useNativeDriver: false,
        }),
        Animated.timing(particle3Anim, {
          toValue: 0,
          duration: 3000,
          useNativeDriver: false,
        }),
      ])
    );

    spinAnimation.start();
    pulseAnimation.start();
    heartBeatAnimation.start();
    particle1Animation.start();
    particle2Animation.start();
    particle3Animation.start();

    return () => {
      spinAnimation.stop();
      pulseAnimation.stop();
      heartBeatAnimation.stop();
      particle1Animation.stop();
      particle2Animation.stop();
      particle3Animation.stop();
    };
  }, []);

  const getSizeStyles = () => {
    switch (size) {
      case "small":
        return { containerSize: 80, spinnerSize: 40, fontSize: 14 };
      case "large":
        return { containerSize: 160, spinnerSize: 80, fontSize: 18 };
      default:
        return { containerSize: 120, spinnerSize: 60, fontSize: 16 };
    }
  };

  const { containerSize, spinnerSize, fontSize } = getSizeStyles();

  const spin = spinAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],
  });

  return (
    <View style={styles.container}>
      <View
        style={[
          styles.spinnerContainer,
          { width: containerSize, height: containerSize },
        ]}
      >
        <Animated.View
          style={[
            styles.glowBackground,
            {
              width: containerSize,
              height: containerSize,
              borderRadius: containerSize / 2,
              transform: [{ scale: pulseAnim }],
            },
          ]}
        />

        <Animated.View
          style={[
            styles.spinner,
            {
              width: spinnerSize,
              height: spinnerSize,
              borderRadius: spinnerSize / 2,
              transform: [{ rotate: spin }, { scale: heartBeatAnim }],
            },
          ]}
        >
          <View style={styles.heartContainer}>
            <View style={[styles.heartLeft, { backgroundColor: "#e03487" }]} />
            <View style={[styles.heartRight, { backgroundColor: "#e03487" }]} />
            <View
              style={[styles.heartBottom, { backgroundColor: "#e03487" }]}
            />
          </View>
        </Animated.View>

        <Animated.View
          style={[
            styles.particle,
            styles.particle1,
            {
              opacity: particle1Anim,
              transform: [
                {
                  translateY: particle1Anim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0, -30],
                  }),
                },
                {
                  translateX: particle1Anim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0, 15],
                  }),
                },
              ],
            },
          ]}
        />
        <Animated.View
          style={[
            styles.particle,
            styles.particle2,
            {
              opacity: particle2Anim,
              transform: [
                {
                  translateY: particle2Anim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0, -25],
                  }),
                },
                {
                  translateX: particle2Anim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0, -12],
                  }),
                },
              ],
            },
          ]}
        />
        <Animated.View
          style={[
            styles.particle,
            styles.particle3,
            {
              opacity: particle3Anim,
              transform: [
                {
                  translateY: particle3Anim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0, -35],
                  }),
                },
              ],
            },
          ]}
        />
      </View>

      {showMessage && (
        <Animated.Text
          style={[
            styles.message,
            {
              fontSize,
              transform: [{ scale: pulseAnim }],
            },
          ]}
        >
          {message}
        </Animated.Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  spinnerContainer: {
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },
  glowBackground: {
    position: "absolute",
    backgroundColor: "rgba(224, 52, 135, 0.1)",
    shadowColor: "#e03487",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 8,
  },
  spinner: {
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#1b1c2e",
    borderWidth: 3,
    borderColor: "#e03487",
    shadowColor: "#e03487",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
    elevation: 5,
  },
  heartContainer: {
    position: "relative",
    width: 20,
    height: 18,
  },
  heartLeft: {
    position: "absolute",
    width: 10,
    height: 10,
    borderRadius: 5,
    top: 0,
    left: 0,
  },
  heartRight: {
    position: "absolute",
    width: 10,
    height: 10,
    borderRadius: 5,
    top: 0,
    right: 0,
  },
  heartBottom: {
    position: "absolute",
    width: 10,
    height: 10,
    borderRadius: 5,
    bottom: 0,
    left: 5,
    transform: [{ rotate: "45deg" }],
  },
  particle: {
    position: "absolute",
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#e03487",
  },
  particle1: {
    top: 20,
    right: 20,
  },
  particle2: {
    top: 35,
    right: 35,
  },
  particle3: {
    top: 15,
    right: 50,
  },
  message: {
    color: "#e03487",
    textAlign: "center",
    marginTop: 16,
    fontWeight: "bold",
    fontSize: 10,
  },
});

export default LoadingSpinner;
