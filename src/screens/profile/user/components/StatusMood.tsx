// external
import React, { useState, useEffect, useMemo } from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Feather } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useQueryClient } from "@tanstack/react-query";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withRepeat,
  withTiming,
  interpolate,
  Easing,
} from "react-native-reanimated";

// internal
import { useAuth } from "../../../../contexts/AuthContext";
import { StatusMoodProps } from "../../../../types/StatusMood";
import { updateMood } from "../../../../services/api/profiles/moodService";
import { addHomeLocation } from "../../../../services/api/profiles/homeLocationService";
import useToken from "../../../../hooks/useToken";
import { startBackgroundLocationTracking } from "../../../../services/location/locationPermissionService";
import { useTheme } from "../../../../theme/ThemeContext";

// screen content
import AddLocationModal from "../../../../components/modals/input/AddLocationModal";
import UpdateMoodModal from "../../../../components/modals/selection/UpdateMoodModal";
import AlertModal from "../../../../components/modals/output/AlertModal";

const StatusMood: React.FC<StatusMoodProps> = ({
  mood,
  moodDescription,
  status = "unavailable",
  statusDescription = "You must add your home location to use this feature",
  onEdit,
  onAddHome,
  statusDistance,
}) => {
  // variables
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const displayMood = mood || "No mood";
  const displayMoodDescription =
    moodDescription || "You haven't added a mood yet";
  const token = useToken();
  const { theme } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);

  // animation variables
  const pulseAnimation = useSharedValue(1);
  const floatAnimation = useSharedValue(0);
  const statusColorAnimation = useSharedValue(0);
  const moodBounceAnimation = useSharedValue(0);
  const fadeInAnimation = useSharedValue(0);

  // use states
  const [moodModalVisible, setMoodModalVisible] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [showSuccessAlert, setShowSuccessAlert] = useState(false);
  const [showErrorAlert, setShowErrorAlert] = useState(false);
  const [alertTitle, setAlertTitle] = useState("");
  const [alertMessage, setAlertMessage] = useState("");
  const [updatingMood, setUpdatingMood] = useState(false);
  const [saving, setSaving] = useState(false);

  // use effects
  useEffect(() => {
    floatAnimation.value = withRepeat(
      withTiming(1, { duration: 3000, easing: Easing.inOut(Easing.sin) }),
      -1,
      true
    );

    fadeInAnimation.value = withTiming(1, {
      duration: 800,
      easing: Easing.out(Easing.cubic),
    });
  }, []);

  useEffect(() => {
    const statusValues = { home: 0, away: 1, unreachable: 2, unavailable: 3 };
    const targetValue = statusValues[status as keyof typeof statusValues] || 3;

    statusColorAnimation.value = withSpring(targetValue, {
      damping: 15,
      stiffness: 150,
    });

    pulseAnimation.value = withRepeat(
      withTiming(1.2, { duration: 600, easing: Easing.out(Easing.cubic) }),
      2,
      true
    );
  }, [status]);

  useEffect(() => {
    if (displayMood && displayMood !== "No mood") {
      moodBounceAnimation.value = withSpring(1, {
        damping: 8,
        stiffness: 200,
      });
    }
  }, [displayMood]);

  // handlers
  const handleAddHome = async (location: {
    latitude: number;
    longitude: number;
  }) => {
    try {
      setSaving(true);

      if (!token) {
        setAlertTitle("Action Failed");
        setAlertMessage(
          "Couldn't add your home location. Your session may have expired. Log in again and retry"
        );
        setShowErrorAlert(true);
        return;
      }

      await AsyncStorage.setItem("homeLocation", JSON.stringify(location));
      await addHomeLocation(token, location.latitude, location.longitude);
      await startBackgroundLocationTracking();

      setAlertTitle("Home Location Added");
      setAlertMessage(
        "You have added your home location. Your partner can now see when you are home."
      );

      await queryClient.invalidateQueries({
        queryKey: ["profile", user?.id],
      });

      setShowSuccessAlert(true);
    } catch (err: any) {
      setAlertTitle("Failed");
      setAlertMessage(
        err.response?.data?.error || "Failed to add home location."
      );
      setShowErrorAlert(true);
    } finally {
      setModalVisible(false);
      setSaving(false);
    }
  };

  const handleSaveMood = async (newMood: string) => {
    try {
      setUpdatingMood(true);

      if (!token) {
        setAlertTitle("Action Failed");
        setAlertMessage(
          "Couldn't save your new mood. Your session may have expired. Log in again and retry"
        );
        setShowErrorAlert(true);
        return;
      }

      await updateMood(token, newMood);
      await queryClient.invalidateQueries({ queryKey: ["profile", user?.id] });
      setAlertTitle("Mood updated");
      setAlertMessage(`Your mood is now ${newMood}.`);
      setShowSuccessAlert(true);
      setMoodModalVisible(false);

      if (onEdit) {
        onEdit();
      }

      if (onAddHome) {
        onAddHome();
      }
    } catch (err: any) {
      setAlertTitle("Failed");
      setAlertMessage(err?.response?.data?.error || "Failed to update mood.");
      setShowErrorAlert(true);
    } finally {
      setUpdatingMood(false);
    }
  };

  // animated styles
  const pulseStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulseAnimation.value }],
  }));

  const floatStyle = useAnimatedStyle(() => ({
    transform: [
      {
        translateY: interpolate(floatAnimation.value, [0, 1], [0, -3]),
      },
    ],
  }));

  const statusColorStyle = useAnimatedStyle(() => {
    const colors = [
      "#4caf50",
      theme.colors.accent,
      "#db8a47",
      theme.colors.muted,
    ];
    const currentColor =
      colors[Math.round(statusColorAnimation.value)] || colors[3];

    return {
      backgroundColor: currentColor,
    };
  });

  const moodBounceStyle = useAnimatedStyle(() => ({
    transform: [
      {
        scale: withSpring(moodBounceAnimation.value, {
          damping: 8,
          stiffness: 200,
        }),
      },
    ],
  }));

  const fadeInStyle = useAnimatedStyle(() => ({
    opacity: fadeInAnimation.value,
    transform: [
      {
        translateY: interpolate(fadeInAnimation.value, [0, 1], [20, 0]),
      },
    ],
  }));

  const getStatusEmoji = (status: string) => {
    switch (status) {
      case "home":
        return "🏠";
      case "away":
        return "🚶";
      case "unreachable":
        return "❓";
      default:
        return "⏸️";
    }
  };

  const getMoodEmoji = (mood: string) => {
    if (!mood || mood === "No mood") {
      return "😐";
    }

    const moodEmojis: { [key: string]: string } = {
      happy: "😊",
      sad: "😢",
      excited: "🤩",
      irritated: "😠",
      content: "😌",
      annoyed: "🙄",
      "very happy": "😍",
      crying: "😭",
      neutral: "😐",
      angry: "😠",
      default: "😐",
    };
    return moodEmojis[mood.toLowerCase()] || moodEmojis.default;
  };

  return (
    <Animated.View style={[styles.wrapper, fadeInStyle]}>
      <View style={styles.headerRow}>
        <Text style={styles.statusLabel}>Status</Text>
      </View>

      <Animated.View style={[styles.statusRow, floatStyle]}>
        <Animated.View style={[styles.statusIndicator, pulseStyle]}>
          <Animated.View style={[styles.statusDot, statusColorStyle]} />
        </Animated.View>

        <View style={styles.statusContent}>
          <Text style={styles.statusEmoji}>{getStatusEmoji(status)}</Text>
          <Text
            style={[
              styles.statusValue,
              status === "home"
                ? { color: "#4caf50" }
                : status === "away"
                ? { color: theme.colors.accent }
                : status === "unreachable"
                ? { color: "#db8a47ff" }
                : { color: theme.colors.muted },
            ]}
          >
            {status === "home"
              ? "Home"
              : status === "away"
              ? "Away"
              : status === "unreachable"
              ? "Unreachable"
              : "Unavailable"}
          </Text>
        </View>

        <TouchableOpacity
          style={styles.addButton}
          onPress={() => setModalVisible(true)}
        >
          <Feather name="plus" size={18} color={theme.colors.text} />
        </TouchableOpacity>
      </Animated.View>

      <Text style={styles.statusDescription}>{statusDescription}</Text>

      {status === "away" && statusDistance && (
        <Text style={styles.statusDistance}>
          {`${statusDistance} meters away from home`}
        </Text>
      )}

      <View style={styles.moodRow}>
        <Text style={styles.moodLabel}>Mood</Text>
        <TouchableOpacity
          style={styles.editButton}
          onPress={() => setMoodModalVisible(true)}
        >
          <Feather name="edit-2" size={18} color={theme.colors.primary} />
        </TouchableOpacity>
      </View>

      <Animated.View style={[styles.moodContentRow, moodBounceStyle]}>
        <Text style={styles.moodEmoji}>{getMoodEmoji(displayMood)}</Text>
        <Text style={styles.moodValue}>{displayMood}</Text>
        <Text style={styles.moodDescription}> - {displayMoodDescription}</Text>
      </Animated.View>

      <View style={{ zIndex: 1000 }}>
        <AddLocationModal
          visible={modalVisible}
          onClose={() => setModalVisible(false)}
          onConfirm={handleAddHome}
          saving={saving}
        />

        <UpdateMoodModal
          visible={moodModalVisible}
          onClose={() => setMoodModalVisible(false)}
          onSave={handleSaveMood}
          initialMood={
            displayMood && displayMood !== "No mood" ? displayMood : "Happy"
          }
          saving={updatingMood}
        />

        <AlertModal
          visible={showSuccessAlert}
          type="success"
          title={alertTitle}
          message={alertMessage}
          buttonText="Great"
          onClose={() => setShowSuccessAlert(false)}
        />

        <AlertModal
          visible={showErrorAlert}
          type="error"
          title={alertTitle}
          message={alertMessage}
          buttonText="Close"
          onClose={() => setShowErrorAlert(false)}
        />
      </View>
    </Animated.View>
  );
};

const createStyles = (theme: ReturnType<typeof useTheme>["theme"]) =>
  StyleSheet.create({
    wrapper: {
      width: "100%",
      marginBottom: 14,
    },
    headerRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      marginBottom: 0,
    },
    statusRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      marginBottom: 0,
    },
    statusIndicator: {
      marginRight: 12,
      alignItems: "center",
      justifyContent: "center",
    },
    statusDot: {
      width: 12,
      height: 12,
      borderRadius: 6,
      shadowColor: theme.colors.shadow,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.3,
      shadowRadius: 4,
      elevation: 4,
    },
    statusContent: {
      flexDirection: "row",
      alignItems: "center",
      flex: 1,
    },
    statusEmoji: {
      fontSize: 20,
      marginRight: 8,
    },
    statusValue: {
      color: theme.colors.text,
      fontSize: 16,
      fontWeight: "bold",
      marginRight: 8,
    },
    statusDescription: {
      color: theme.colors.muted,
      fontSize: 14,
      marginBottom: 8,
      marginLeft: 2,
      marginTop: 6,
    },
    statusDistance: {
      color: theme.colors.accent,
      fontSize: 12,
      marginBottom: 12,
      marginLeft: 2,
      opacity: 0.8,
    },
    addButton: {
      backgroundColor: theme.colors.primary,
      borderRadius: 16,
      padding: 6,
      alignItems: "center",
      justifyContent: "center",
    },
    statusLabel: {
      fontSize: 18,
      color: theme.colors.muted,
      fontWeight: "bold",
      marginBottom: 2,
    },
    moodRow: {
      marginTop: 10,
      marginBottom: 4,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
    },
    moodLabel: {
      fontSize: 18,
      color: theme.colors.muted,
      fontWeight: "bold",
      marginBottom: 2,
    },
    moodContentRow: {
      flexDirection: "row",
      alignItems: "center",
    },
    moodEmoji: {
      fontSize: 20,
      marginRight: 8,
    },
    moodValue: {
      fontSize: 16,
      color: theme.colors.text,
      fontWeight: "bold",
    },
    moodDescription: {
      fontSize: 14,
      color: theme.colors.muted,
      marginLeft: 4,
    },
    editButton: {
      backgroundColor: "transparent",
      borderRadius: 8,
      paddingVertical: 4,
      paddingHorizontal: 12,
      alignItems: "center",
      justifyContent: "center",
    },
    toast: {
      position: "absolute",
      top: 50,
      left: 20,
      right: 20,
      backgroundColor: theme.colors.primary,
      padding: 14,
      borderRadius: 10,
      alignItems: "center",
      zIndex: 100,
      shadowColor: theme.colors.shadow,
      shadowOpacity: 0.2,
      shadowRadius: 8,
      elevation: 8,
    },
    toastText: {
      color: theme.colors.text,
      fontWeight: "bold",
      fontSize: 16,
    },
  });

export default StatusMood;
