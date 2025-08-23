// external
import React, { useRef, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Image,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";

// internal
import { formatRelativeTime } from "../../../utils/formatters/formatRelativeTime";
import { formatDistance } from "../../../utils/formatters/formatDistance";
import { getBatteryIcon } from "../../../utils/getBatteryIcon";
import { weatherIcons } from "../../../utils/weatherIcons";

const getWeatherIcon = (
  weatherType?: string | null,
  isDaytime: boolean = true
) => {
  if (!weatherType) {
    return isDaytime ? weatherIcons["clear"] : weatherIcons["clear_night"];
  }

  const normalized = weatherType.trim().toLowerCase().replace(/ /g, "_");

  const key = isDaytime ? normalized : `${normalized}_night`;

  return weatherIcons[key] || weatherIcons["clear"];
};

// types
type ProfileCardProps = {
  partner: any;
  avatarUri: string | null;
  status: string;
  statusColor: string;
  mood: string;
  isActive: boolean;
  lastSeen?: string;
  batteryLevel?: number;
  distanceFromHome: number;
  onPress: () => void;
  renderPartnerImage: () => React.ReactNode;
  currentWeather?: number | null;
  weatherType?: string | null;
  weatherDescription?: string | null;
  userLocation?: string | null;
  userTimezone?: string | null;
  isDaytime?: boolean;
};

const ProfileCard: React.FC<ProfileCardProps> = ({
  partner,
  status,
  statusColor,
  mood,
  isActive,
  lastSeen,
  batteryLevel = 0,
  distanceFromHome,
  onPress,
  renderPartnerImage,
  currentWeather,
  weatherType,
  weatherDescription,
  userLocation,
  userTimezone,
  isDaytime = true,
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

  /// dynamic variables
  const iconSource = getWeatherIcon(weatherType, isDaytime);

  let currentTime = "Unknown";
  if (userTimezone) {
    try {
      const date = new Date();
      const formatter = new Intl.DateTimeFormat("en-US", {
        timeZone: userTimezone,
        hour: "numeric",
        minute: "numeric",
        hour12: true,
      });
      currentTime = formatter.format(date);
    } catch (e) {
      currentTime = "Unknown";
    }
  }

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

  if (!partner) {
    return (
      <View style={styles.noPartnerContainer}>
        <Text style={styles.noPartnerText}>
          You have no partner. Add one to unlock features.
        </Text>
      </View>
    );
  }

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
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

        <View
          style={[
            styles.profileContainer,
            {
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
            },
          ]}
        >
          <View style={{ alignItems: "center" }}>
            <Animated.View
              style={[
                styles.avatarWrapper,
                { transform: [{ scale: heartBeatAnim }] },
              ]}
            >
              {renderPartnerImage()}
            </Animated.View>
            <Text style={[styles.name, { marginBottom: 0 }]}>
              {partner?.name || "No partner"}
            </Text>
          </View>

          <View style={{ flexDirection: "column", alignItems: "flex-start" }}>
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <Image
                source={iconSource}
                style={{ width: 70, height: 70, marginRight: 12 }}
              />

              <View style={{ flexDirection: "column" }}>
                <Text
                  style={{
                    fontSize: 16,
                    color: "#fff",
                    fontWeight: "500",
                    marginBottom: 2,
                  }}
                >
                  {currentWeather !== null ? `${currentWeather}°C` : "Unknown"}
                </Text>
                <Text
                  style={{ fontSize: 14, color: "#b0b3c6", fontWeight: "500" }}
                >
                  {userLocation || "Unknown"}
                </Text>
                <Text style={{ fontSize: 12, color: "#b0b3c6" }}>
                  {currentTime}
                </Text>
              </View>
            </View>

            <View style={{ width: "100%", marginTop: 4, marginLeft: 12 }}>
              <Text style={{ fontSize: 15, color: "#fff", fontWeight: "300" }}>
                {weatherDescription || "Unknown"}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.statusContainer}>
          <View style={styles.statusGroup}>
            <Animated.View
              style={{
                transform: [{ scale: statusPulseAnim }],
              }}
            >
              <Text style={[styles.statusText, { color: statusColor }]}>
                {status}
              </Text>
            </Animated.View>
            <Text style={styles.lastSeenText}>
              {formatRelativeTime(lastSeen ? new Date(lastSeen) : null)}
            </Text>
            {status === "Away" &&
              typeof distanceFromHome === "number" &&
              !isNaN(distanceFromHome) && (
                <Text style={styles.distanceText}>
                  {formatDistance(distanceFromHome)} from home
                </Text>
              )}
          </View>
          <View style={styles.moodGroup}>
            <Text style={styles.moodText}>
              {mood ? `${partner?.name} is ${mood}` : "No mood"}
            </Text>
            {batteryLevel !== undefined && batteryLevel !== null && (
              <View style={styles.batteryContainer}>
                <MaterialCommunityIcons
                  name={getBatteryIcon(batteryLevel)}
                  size={18}
                  color="#b0b3c6"
                />
                <Text style={styles.batteryText}>{batteryLevel}%</Text>
              </View>
            )}
          </View>
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
    borderRadius: 24,
    paddingVertical: 20,
    paddingHorizontal: 32,
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 4,
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
    borderRadius: 24,
    borderWidth: 2,
    borderColor: "#e03487",
  },
  profileContainer: {
    alignItems: "center",
    width: "100%",
  },
  avatarWrapper: {
    marginBottom: 8,
  },
  name: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 14,
    textAlign: "center",
  },
  statusContainer: {
    marginTop: 8,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    width: "100%",
  },
  statusGroup: {
    flexDirection: "column",
    alignItems: "flex-start",
  },
  moodGroup: {
    flexDirection: "column",
    alignItems: "flex-end",
  },
  statusText: {
    fontSize: 14,
    color: "#b0b3c6",
  },
  lastSeenText: {
    fontSize: 12,
    color: "#8a8db0",
    marginTop: 2,
  },
  distanceText: {
    fontSize: 12,
    color: "#8a8db0",
    marginTop: 2,
  },
  moodText: {
    fontSize: 14,
    color: "#b0b3c6",
  },
  batteryContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
  },
  batteryText: {
    fontSize: 12,
    color: "#b0b3c6",
    marginLeft: 4,
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
  noPartnerContainer: {
    backgroundColor: "#1b1c2e",
    borderRadius: 24,
    paddingVertical: 40,
    paddingHorizontal: 32,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 4,
    width: "100%",
    minHeight: 120,
  },
  noPartnerText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#b0b3c6",
    textAlign: "center",
  },
});

export default ProfileCard;
