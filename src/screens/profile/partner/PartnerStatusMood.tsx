// external
import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, ActivityIndicator } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useQuery } from "@tanstack/react-query";

// internal
import { fetchUserStatus } from "../../../services/userStatusService";
import { getUserMood } from "../../../services/moodService";

// types
type Props = {
  partnerId: string;
  partnerName: string;
  refreshKey?: number;
};

const PartnerStatusMood: React.FC<Props> = ({
  partnerId,
  partnerName,
  refreshKey,
}) => {
  // use effects
  useEffect(() => {
    refetchPartnerMood();
    refetchPartnerStatus();
  }, [partnerId, partnerName, refreshKey]);

  // fetch functions
  const {
    data: partnerMood,
    isLoading: partnerMoodLoading,
    refetch: refetchPartnerMood,
  } = useQuery({
    queryKey: ["partnerMood", partnerId],
    queryFn: async () => {
      if (!partnerId) {
        return null;
      }

      const token = await AsyncStorage.getItem("token");

      if (!token) {
        return;
      }

      return await getUserMood(token, partnerId);
    },
    enabled: !!partnerId,
    staleTime: 1000 * 60 * 5,
  });

  const mood = partnerMood?.mood || "No mood";
  const moodDescription =
    partnerMood?.description || `${partnerName} hasn't set a mood yet`;

  const {
    data: partnerStatus,
    isLoading: partnerStatusLoading,
    refetch: refetchPartnerStatus,
  } = useQuery({
    queryKey: ["partnerStatus", partnerId],
    queryFn: async () => {
      if (!partnerId) {
        return null;
      }

      const token = await AsyncStorage.getItem("token");

      if (!token) {
        return;
      }

      return await fetchUserStatus(token, partnerId);
    },
    enabled: !!partnerId,
    staleTime: 1000 * 60 * 5,
  });

  const status = partnerStatus?.unreachable
    ? "unreachable"
    : partnerStatus?.dataValues.isAtHome
    ? "home"
    : partnerStatus?.dataValues.isAtHome === false
    ? "away"
    : "unavailable";

  const statusDescription = partnerStatus?.unreachable
    ? `Can't find ${partnerName}'s current location`
    : partnerStatus?.dataValues.isAtHome
    ? `${partnerName} is currently at home`
    : partnerStatus?.dataValues.isAtHome === false
    ? `${partnerName} is currently not home`
    : `${partnerName} hasn't set a home location`;

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
