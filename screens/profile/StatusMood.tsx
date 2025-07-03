import React, { useState } from "react";
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
import { BASE_URL } from "../../configuration/config";
import AddLocationModal from "../../components/modals/AddLocationModal";
import { getMood, updateMood } from "../../services/moodService";
import UpdateMoodModal from "../../components/modals/UpdateMoodModal";
import AlertModal from "../../components/modals/AlertModal";

type Props = {
  onAddHome?: () => void;
  mood?: string;
  moodDescription?: string;
  onEdit?: () => void;
  status?: "home" | "away" | "unavailable";
  statusDescription?: string;
};

const StatusMood: React.FC<Props> = ({
  onAddHome,
  mood = "No mood",
  moodDescription = "You haven't added a mood yet",
  onEdit,
  status = "unavailable",
  statusDescription = "You must add your home location to use this feature.",
}) => {
  const [moodModalVisible, setMoodModalVisible] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [currentMood, setCurrentMood] = useState<string | undefined>(mood);
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");
  const [fetchingMood, setFetchingMood] = useState(false);
  const [updatingMood, setUpdatingMood] = useState(false);
  const [currentMoodDescription, setCurrentMoodDescription] = useState<
    string | undefined
  >(moodDescription);
  const handleAddHome = async (location: {
    latitude: number;
    longitude: number;
  }) => {
    setModalVisible(false);

    await AsyncStorage.setItem("homeLocation", JSON.stringify(location));

    const token = await AsyncStorage.getItem("token");
    await axios.put(`${BASE_URL}/api/location/add-home-location`, location, {
      headers: { Authorization: `Bearer ${token}` },
    });
  };

  const handleSaveMood = async (mood: string) => {
    setMoodModalVisible(false);
    setUpdatingMood(true);
    try {
      const token = await AsyncStorage.getItem("token");
      if (!token) return;
      const moodData = await updateMood(token, mood);
      setCurrentMood(moodData.mood);
      setCurrentMoodDescription(moodData.description);
      setAlertMessage("Mood updated!");
      setAlertVisible(true);
    } catch (err) {
      setAlertMessage("Failed to update mood");
      setAlertVisible(true);
    } finally {
      setUpdatingMood(false);
    }
  };

  React.useEffect(() => {
    const fetchMood = async () => {
      try {
        setFetchingMood(true);
        const token = await AsyncStorage.getItem("token");
        if (!token) return;
        const moodData = await getMood(token);
        setCurrentMood(moodData.mood);
        setCurrentMoodDescription(moodData.description);
      } catch (err) {
        setCurrentMood(undefined);
        setCurrentMoodDescription("No mood set yet.");
      } finally {
        setFetchingMood(false);
      }
    };
    fetchMood();
  }, []);

  return (
    <View style={styles.wrapper}>
      {updatingMood && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#e03487" />
        </View>
      )}
      <View style={styles.headerRow}>
        <Text style={styles.statusLabel}>Status</Text>
      </View>
      <View style={styles.statusUnavailableRow}>
        <Text
          style={[
            styles.statusUnavailable,
            status === "home"
              ? { color: "#4caf50" }
              : status === "away"
              ? { color: "#e03487" }
              : { color: "#b0b3c6" },
          ]}
        >
          {status === "home"
            ? "Home"
            : status === "away"
            ? "Away"
            : "Unavailable"}
        </Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => setModalVisible(true)}
        >
          <Feather name="plus" size={18} color="#fff" />
        </TouchableOpacity>
      </View>
      <Text style={styles.statusUnavailableDescription}>
        {statusDescription}
      </Text>
      <View style={styles.moodRow}>
        <Text style={styles.moodLabel}>Mood</Text>
        <TouchableOpacity
          style={styles.editButton}
          onPress={() => setMoodModalVisible(true)}
        >
          <Feather name="edit-2" size={18} color="#e03487" />
        </TouchableOpacity>
      </View>
      <View style={styles.moodContentRow}>
        <Text style={styles.moodValue}>{currentMood}</Text>
        <Text style={styles.moodDescription}> - {currentMoodDescription}</Text>
      </View>

      <AddLocationModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        onConfirm={handleAddHome}
      />

      <UpdateMoodModal
        visible={moodModalVisible}
        onClose={() => setMoodModalVisible(false)}
        onSave={handleSaveMood}
        initialMood={currentMood}
      />

      <AlertModal
        visible={alertVisible}
        message={alertMessage}
        onClose={() => setAlertVisible(false)}
      />
    </View>
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
    marginBottom: 0,
  },
  statusUnavailableRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 0,
  },
  statusUnavailable: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
    marginRight: 8,
  },
  statusUnavailableDescription: {
    color: "#b0b3c6",
    fontSize: 14,
    marginBottom: 12,
    marginLeft: 2,
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
  statusContentRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
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
