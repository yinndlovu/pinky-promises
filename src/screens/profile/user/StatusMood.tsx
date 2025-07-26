// external
import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
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
import { BASE_URL } from "../../../configuration/config";
import { useAuth } from "../../../contexts/AuthContext";
import { StatusMoodProps } from "../../../types/StatusMood";

// screen content
import AddLocationModal from "../../../components/modals/AddLocationModal";
import UpdateMoodModal from "../../../components/modals/UpdateMoodModal";
import AlertModal from "../../../components/modals/AlertModal";
import { updateMood } from "../../../services/moodService";

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
  const userId = user?.id;
  const displayMood = mood || "No mood";
  const displayMoodDescription =
    moodDescription || "You haven't added a mood yet";

  // animation variables
  const pulseAnimation = useSharedValue(1);
  const floatAnimation = useSharedValue(0);
  const statusColorAnimation = useSharedValue(0);
  const moodBounceAnimation = useSharedValue(0);
  const fadeInAnimation = useSharedValue(0);

  // use states
  const [moodModalVisible, setMoodModalVisible] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");
  const [updatingMood, setUpdatingMood] = useState(false);

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
    setModalVisible(false);

    try {
      await AsyncStorage.setItem("homeLocation", JSON.stringify(location));

      const token = await AsyncStorage.getItem("token");
      await axios.put(`${BASE_URL}/api/location/add-home-location`, location, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setAlertMessage("Home location added");
      await queryClient.invalidateQueries({
        queryKey: ["status", userId],
      });

      setAlertVisible(true);
    } catch (err) {
      setAlertMessage("Failed to add home location");
      setAlertVisible(true);
    }
  };

  const handleSaveMood = async (newMood: string) => {
    try {
      const token = await AsyncStorage.getItem("token");
      if (!token) return;
      await updateMood(token, newMood);

      if (onEdit) {
        onEdit();
      }
      if (onAddHome) {
        onAddHome();
      }
    } catch (err) {}
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
    const colors = ["#4caf50", "#e03487", "#db8a47", "#b0b3c6"];
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
      {updatingMood && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#e03487" />
        </View>
      )}

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
                ? { color: "#e03487" }
                : status === "unreachable"
                ? { color: "#db8a47ff" }
                : { color: "#b0b3c6" },
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
          <Feather name="plus" size={18} color="#fff" />
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
          <Feather name="edit-2" size={18} color="#e03487" />
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
        />

        <UpdateMoodModal
          visible={moodModalVisible}
          onClose={() => setMoodModalVisible(false)}
          onSave={handleSaveMood}
          initialMood={displayMood}
        />

        <AlertModal
          visible={alertVisible}
          message={alertMessage}
          onClose={() => setAlertVisible(false)}
        />
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
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
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(35,36,58,0.7)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 100,
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
    shadowColor: "#000",
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
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
    marginRight: 8,
  },
  statusDescription: {
    color: "#b0b3c6",
    fontSize: 14,
    marginBottom: 8,
    marginLeft: 2,
    marginTop: 6,
  },
  statusDistance: {
    color: "#e03487",
    fontSize: 12,
    marginBottom: 12,
    marginLeft: 2,
    opacity: 0.8,
  },
  addButton: {
    backgroundColor: "#e03487",
    borderRadius: 16,
    padding: 6,
    alignItems: "center",
    justifyContent: "center",
  },
  statusLabel: {
    fontSize: 18,
    color: "#b0b3c6",
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
    color: "#b0b3c6",
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
    color: "#fff",
    fontWeight: "bold",
  },
  moodDescription: {
    fontSize: 14,
    color: "#b0b3c6",
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
    backgroundColor: "#e03487",
    padding: 14,
    borderRadius: 10,
    alignItems: "center",
    zIndex: 100,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
  },
  toastText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
});

export default StatusMood;
