import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, ActivityIndicator } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { fetchUserStatus } from "../../../services/userStatusService";
import { getUserMood } from "../../../services/moodService";

type Props = {
  partnerId: string;
  partnerName: string;
  refreshKey?: number;
};

const PartnerStatusMood: React.FC<Props> = ({ partnerId, partnerName, refreshKey }) => {
  const [status, setStatus] = useState<"home" | "away" | "unavailable">(
    "unavailable"
  );
  const [statusDescription, setStatusDescription] = useState<string>(
    "Partner hasn't set a home location"
  );
  const [mood, setMood] = useState<string>("No mood");
  const [moodDescription, setMoodDescription] = useState<string>(
    "Partner hasn't set a mood yet"
  );
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPartnerStatusAndMood();
  }, [partnerId, partnerName, refreshKey]);

  const fetchPartnerStatusAndMood = async () => {
    try {
      const token = await AsyncStorage.getItem("token");

      if (!token) {
        return;
      }

      try {
        const statusData = await fetchUserStatus(token, partnerId);

        if (statusData && typeof statusData.isAtHome === "boolean") {
          if (statusData.isAtHome) {
            setStatus("home");
            setStatusDescription(`${partnerName} is currently at home`);
          } else {
            setStatus("away");
            setStatusDescription(`${partnerName} is currently not home`);
          }
        } else {
          setStatus("unavailable");
          setStatusDescription(`${partnerName} hasn't set a home location`);
        }
      } catch (statusErr: any) {
        setStatus("unavailable");
        setStatusDescription(`${partnerName} hasn't set a home location`);
      }

      try {
        const moodData = await getUserMood(token, partnerId);
        
        setMood(moodData.mood);
        setMoodDescription(moodData.description);
      } catch (moodErr: any) {
        setMood("No mood");
        setMoodDescription(`${partnerName} hasn't set a mood yet`);
      }
    } catch (error) {
      console.error("Failed to fetch partner status and mood:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.wrapper}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#e03487" />
        </View>
      </View>
    );
  }

  return (
    <View style={styles.wrapper}>
      <View style={styles.headerRow}>
        <Text style={styles.statusLabel}>Status</Text>
      </View>
      <View style={styles.statusRow}>
        <Text
          style={[
            styles.statusValue,
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
      </View>
      <Text style={styles.statusDescription}>{statusDescription}</Text>

      <View style={styles.moodRow}>
        <Text style={styles.moodLabel}>Mood</Text>
      </View>
      <View style={styles.moodContentRow}>
        <Text style={styles.moodValue}>{mood}</Text>
        <Text style={styles.moodDescription}> - {moodDescription}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    width: "100%",
    marginBottom: 14,
  },
  loadingContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 20,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 0,
  },
  statusRow: {
    marginBottom: 0,
  },
  statusValue: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
    marginRight: 8,
    marginTop: 5,
  },
  statusDescription: {
    color: "#b0b3c6",
    fontSize: 14,
    marginBottom: 12,
    marginLeft: 2,
    marginTop: 6,
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
});

export default PartnerStatusMood;
