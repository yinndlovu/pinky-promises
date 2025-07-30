// external
import React, { useRef, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
} from "react-native";

// types
type ProfileCardProps = {
  partner: any;
  avatarUri: string | null;
  status: string;
  statusColor: string;
  mood: string;
  isActive: boolean;
  onPress: () => void;
  renderPartnerImage: () => React.ReactNode;
};

const ProfileCard: React.FC<ProfileCardProps> = ({
  partner,
  status,
  statusColor,
  mood,
  isActive,
  onPress,
  renderPartnerImage,
}) => {
  // animation variables
  const breatheAnim = useRef(new Animated.Value(1)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const statusPulseAnim = useRef(new Animated.Value(1)).current;
  const heartBeatAnim = useRef(new Animated.Value(1)).current;

  const borderGlowAnim = useRef(new Animated.Value(0)).current;
  const particle1Anim = useRef(new Animated.Value(0)).current;
  const particle2Anim = useRef(new Animated.Value(0)).current;
  const particle3Anim = useRef(new Animated.Value(0)).current;

  // use effects
  useEffect(() => {
    if (isActive) {
      const breatheAnimation = Animated.loop(
        Animated.sequence([
          Animated.timing(breatheAnim, {
            toValue: 1.02,
            duration: 3000,
            useNativeDriver: true,
          }),
          Animated.timing(breatheAnim, {
            toValue: 1,
            duration: 3000,
            useNativeDriver: true,
          }),
        ])
      );

      // animations
      const borderGlowAnimation = Animated.loop(
        Animated.sequence([
          Animated.timing(borderGlowAnim, {
            toValue: 1,
            duration: 4000,
            useNativeDriver: false,
          }),
          Animated.timing(borderGlowAnim, {
            toValue: 0,
            duration: 4000,
            useNativeDriver: false,
          }),
        ])
      );

      const statusPulseAnimation = Animated.loop(
        Animated.sequence([
          Animated.timing(statusPulseAnim, {
            toValue: 1.1,
            duration: 2000,
            useNativeDriver: true,
          }),
          Animated.timing(statusPulseAnim, {
            toValue: 1,
            duration: 2000,
            useNativeDriver: true,
          }),
        ])
      );

      const heartBeatAnimation = Animated.loop(
        Animated.sequence([
          Animated.timing(heartBeatAnim, {
            toValue: 1.05,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(heartBeatAnim, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          }),
        ])
      );

      const particle1Animation = Animated.loop(
        Animated.sequence([
          Animated.timing(particle1Anim, {
            toValue: 1,
            duration: 3000,
            useNativeDriver: false,
          }),
          Animated.timing(particle1Anim, {
            toValue: 0,
            duration: 3000,
            useNativeDriver: false,
          }),
        ])
      );

      const particle2Animation = Animated.loop(
        Animated.sequence([
          Animated.timing(particle2Anim, {
            toValue: 1,
            duration: 4000,
            useNativeDriver: false,
          }),
          Animated.timing(particle2Anim, {
            toValue: 0,
            duration: 4000,
            useNativeDriver: false,
          }),
        ])
      );

      const particle3Animation = Animated.loop(
        Animated.sequence([
          Animated.timing(particle3Anim, {
            toValue: 1,
            duration: 5000,
            useNativeDriver: false,
          }),
          Animated.timing(particle3Anim, {
            toValue: 0,
            duration: 5000,
            useNativeDriver: false,
          }),
        ])
      );

      breatheAnimation.start();
      borderGlowAnimation.start();
      statusPulseAnimation.start();
      heartBeatAnimation.start();
      particle1Animation.start();
      particle2Animation.start();
      particle3Animation.start();

      return () => {
        breatheAnimation.stop();
        borderGlowAnimation.stop();
        statusPulseAnimation.stop();
        heartBeatAnimation.stop();
        particle1Animation.stop();
        particle2Animation.stop();
        particle3Animation.stop();
      };
    }
  }, [isActive]);

  // handlers
  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.98,
      useNativeDriver: true,
      speed: 50,
      bounciness: 10,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
      speed: 50,
      bounciness: 10,
    }).start();
  };

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={!partner}
    >
      <Animated.View
        style={[
          styles.profileCard,
          !isActive && styles.profileCardInactive,
          {
            transform: [{ scale: Animated.multiply(breatheAnim, scaleAnim) }],
          },
        ]}
      >
        {isActive && (
          <Animated.View
            style={[
              styles.glowBorder,
              {
                opacity: borderGlowAnim,
                shadowOpacity: borderGlowAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0.1, 0.3],
                }),
                shadowColor: "#e03487",
                shadowRadius: borderGlowAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [8, 12],
                }),
              },
            ]}
          />
        )}

        <View style={styles.profileRow}>
          <Animated.View
            style={[
              styles.avatarWrapper,
              {
                transform: [{ scale: heartBeatAnim }],
              },
            ]}
          >
            {renderPartnerImage()}
          </Animated.View>
          <View style={styles.infoWrapper}>
            <Text style={styles.name}>{partner?.name || "No partner"}</Text>
            <Text style={styles.username}>
              @{partner?.username || "nopartner"}
            </Text>
            <Text style={styles.bio}>{partner?.bio || ""}</Text>
          </View>
        </View>

        <View style={styles.statusRow}>
          <Animated.View
            style={{
              transform: [{ scale: statusPulseAnim }],
            }}
          >
            <Text style={[styles.statusText, { color: statusColor }]}>
              Status: {status}
            </Text>
          </Animated.View>
          <Text style={styles.statusText}>Mood: {mood}</Text>
        </View>

        {isActive && (
          <>
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
                        outputRange: [0, -20],
                      }),
                    },
                    {
                      translateX: particle1Anim.interpolate({
                        inputRange: [0, 1],
                        outputRange: [0, 10],
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
                        outputRange: [0, -15],
                      }),
                    },
                    {
                      translateX: particle2Anim.interpolate({
                        inputRange: [0, 1],
                        outputRange: [0, -8],
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
                        outputRange: [0, -25],
                      }),
                    },
                  ],
                },
              ]}
            />
          </>
        )}
      </Animated.View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  profileCard: {
    backgroundColor: "#1b1c2e",
    borderRadius: 20,
    paddingVertical: 20,
    paddingHorizontal: 32,
    alignItems: "flex-start",
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 2,
    width: "100%",
    position: "relative",
    overflow: "hidden",
  },
  profileCardInactive: {
    opacity: 0.6,
  },
  glowBorder: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: "#e03487",
  },
  profileRow: {
    flexDirection: "row",
    alignItems: "flex-start",
  },
  avatarWrapper: {
    alignSelf: "flex-start",
    marginBottom: 16,
    marginRight: 16,
  },
  infoWrapper: {
    flex: 1,
    justifyContent: "center",
  },
  name: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 0,
  },
  username: {
    fontSize: 16,
    color: "#e03487",
    marginBottom: 8,
    marginLeft: 4,
  },
  bio: {
    fontSize: 15,
    color: "#fff",
    textAlign: "left",
  },
  statusRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    width: "100%",
    marginTop: 10,
  },
  statusText: {
    fontSize: 13,
    color: "#b0b3c6",
    letterSpacing: 0.5,
  },
  particle: {
    position: "absolute",
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#e03487",
  },
  particle1: {
    top: 30,
    right: 40,
  },
  particle2: {
    top: 50,
    right: 60,
  },
  particle3: {
    top: 20,
    right: 80,
  },
});

export default ProfileCard;
