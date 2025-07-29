// external
import React, { useRef, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { useQuery } from "@tanstack/react-query";
import AsyncStorage from "@react-native-async-storage/async-storage";

// internal
import { getPortalActivityCount } from "../../../services/countService";

// types
type PortalPreviewProps = {
  partner: any;
  navigation: any;
};

const PortalPreview: React.FC<PortalPreviewProps> = ({
  partner,
  navigation,
}) => {
  // animations
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const glowAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const shadowAnim = useRef(new Animated.Value(0.1)).current;

  // fetch functions
  const { data: portalActivityCount, isLoading: portalActivityCountLoading } =
    useQuery({
      queryKey: ["portalActivityCount"],
      queryFn: async () => {
        const token = await AsyncStorage.getItem("token");

        if (!token) {
          return null;
        }

        return getPortalActivityCount(token);
      },
      staleTime: 1000 * 60,
      enabled: !!partner,
    });

  const totalUnseen = portalActivityCount?.total || 0;
  const sweetTotal = portalActivityCount?.sweetTotal || 0;
  const ventTotal = portalActivityCount?.ventTotal || 0;

  // animations
  useEffect(() => {
    if (totalUnseen > 0) {
      const pulseAnimation = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.05,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          }),
        ])
      );

      const glowAnimation = Animated.loop(
        Animated.sequence([
          Animated.timing(glowAnim, {
            toValue: 1,
            duration: 2000,
            useNativeDriver: false,
          }),
          Animated.timing(glowAnim, {
            toValue: 0,
            duration: 2000,
            useNativeDriver: false,
          }),
        ])
      );

      const shadowAnimation = Animated.loop(
        Animated.sequence([
          Animated.timing(shadowAnim, {
            toValue: 0.3,
            duration: 2000,
            useNativeDriver: false,
          }),
          Animated.timing(shadowAnim, {
            toValue: 0.1,
            duration: 2000,
            useNativeDriver: false,
          }),
        ])
      );

      pulseAnimation.start();
      glowAnimation.start();
      shadowAnimation.start();

      return () => {
        pulseAnimation.stop();
        glowAnimation.stop();
        shadowAnimation.stop();
      };
    }
  }, [totalUnseen]);

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.95,
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
    return null;
  }

  const getActivityText = () => {
    if (totalUnseen === 0) {
      return "No new activities in your portal";
    } else if (totalUnseen === 1) {
      return "You have 1 new activity in your portal";
    } else {
      return `You have ${totalUnseen} new activities in your portal`;
    }
  };

  const getActivityIcon = () => {
    if (sweetTotal > 0 && ventTotal > 0) {
      return "message-circle";
    } else if (sweetTotal > 0) {
      return "heart";
    } else if (ventTotal > 0) {
      return "message-square";
    } else {
      return "inbox";
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>PORTAL</Text>
      <TouchableOpacity
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        onPress={() => navigation.navigate("PortalScreen")}
        activeOpacity={0.8}
      >
        <Animated.View
          style={[
            styles.portalCard,
            {
              shadowOpacity: shadowAnim,
            },
          ]}
        >
          <Animated.View
            style={[
              styles.glowBackground,
              {
                opacity: glowAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0, 0.1],
                }),
              },
            ]}
          />

          <Animated.View
            style={[
              styles.contentWrapper,
              {
                transform: [{ scale: Animated.multiply(pulseAnim, scaleAnim) }],
              },
            ]}
          >
            <View style={styles.iconContainer}>
              <Animated.View
                style={[
                  styles.iconWrapper,
                  {
                    transform: [
                      {
                        scale: pulseAnim.interpolate({
                          inputRange: [1, 1.05],
                          outputRange: [1, 1.1],
                        }),
                      },
                    ],
                  },
                ]}
              >
                <Feather
                  name={getActivityIcon()}
                  size={24}
                  color={totalUnseen > 0 ? "#e03487" : "#b0b3c6"}
                />
              </Animated.View>

              {totalUnseen > 0 && (
                <Animated.View
                  style={[
                    styles.notificationBadge,
                    {
                      transform: [
                        {
                          scale: pulseAnim.interpolate({
                            inputRange: [1, 1.05],
                            outputRange: [1, 1.2],
                          }),
                        },
                      ],
                    },
                  ]}
                >
                  <Text style={styles.badgeText}>
                    {totalUnseen > 99 ? "99+" : totalUnseen}
                  </Text>
                </Animated.View>
              )}
            </View>

            <View style={styles.contentContainer}>
              <Text style={styles.activityText}>{getActivityText()}</Text>
              <Text style={styles.portalText}>Tap to view your portal</Text>
            </View>

            <View style={styles.arrowContainer}>
              <Feather name="chevron-right" size={20} color="#b0b3c6" />
            </View>
          </Animated.View>

          {totalUnseen > 0 && (
            <>
              <Animated.View
                style={[
                  styles.particle,
                  styles.particle1,
                  {
                    opacity: glowAnim,
                    transform: [
                      {
                        translateY: glowAnim.interpolate({
                          inputRange: [0, 1],
                          outputRange: [0, -10],
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
                    opacity: glowAnim.interpolate({
                      inputRange: [0, 0.5, 1],
                      outputRange: [0, 1, 0],
                    }),
                    transform: [
                      {
                        translateY: glowAnim.interpolate({
                          inputRange: [0, 1],
                          outputRange: [0, -15],
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
                    opacity: glowAnim.interpolate({
                      inputRange: [0, 0.3, 0.7, 1],
                      outputRange: [0, 1, 0.5, 0],
                    }),
                    transform: [
                      {
                        translateY: glowAnim.interpolate({
                          inputRange: [0, 1],
                          outputRange: [0, -8],
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
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: "100%",
    marginTop: 24,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 14,
    color: "#b0b3c6",
    letterSpacing: 1,
    textTransform: "uppercase",
    marginLeft: 16,
    marginBottom: 10,
    alignSelf: "flex-start",
  },
  portalCard: {
    backgroundColor: "#1b1c2e",
    borderRadius: 16,
    padding: 20,
    shadowColor: "#e03487",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowRadius: 8,
    elevation: 4,
    position: "relative",
    overflow: "hidden",
  },
  contentWrapper: {
    flexDirection: "row",
    alignItems: "center",
  },
  glowBackground: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "#e03487",
    borderRadius: 16,
  },
  iconContainer: {
    position: "relative",
    marginRight: 16,
  },
  iconWrapper: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#23243a",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  notificationBadge: {
    position: "absolute",
    top: -4,
    right: -4,
    backgroundColor: "#e03487",
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#e03487",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  badgeText: {
    color: "#fff",
    fontSize: 10,
    fontWeight: "bold",
  },
  contentContainer: {
    flex: 1,
  },
  activityText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 4,
  },
  portalText: {
    color: "#b0b3c6",
    fontSize: 14,
  },
  arrowContainer: {
    marginLeft: 12,
  },
  particle: {
    position: "absolute",
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: "#e03487",
  },
  particle1: {
    top: 20,
    right: 60,
  },
  particle2: {
    top: 35,
    right: 45,
  },
  particle3: {
    top: 15,
    right: 75,
  },
});

export default PortalPreview;
