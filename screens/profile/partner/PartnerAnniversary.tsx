// external
import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

// internal
import { getSpecialDates } from "../../../services/specialDateService";

// types
type Props = {
  partnerId: string;
};

type SpecialDate = {
  id: string;
  date: string;
  title: string;
  description?: string;
  togetherFor?: string;
  knownFor?: string;
  nextAnniversaryIn?: string;
  nextMetDayIn?: string;
};

const PartnerAnniversary: React.FC<Props> = ({ partnerId }) => {
  // use states
  const [specialDates, setSpecialDates] = useState<SpecialDate[]>([]);
  const [loading, setLoading] = useState(true);

  // use effects
  useEffect(() => {
    fetchSpecialDates();
  }, [partnerId]);

  // helpers
  const formatDisplayDate = (
    dateString: string,
    timeInfo?: string
  ): { date: string; timeInfo?: string } => {
    if (!dateString || dateString === "Not set") {
      return { date: "Not set" };
    }

    try {
      const date = new Date(dateString);
      const day = date.getDate();
      const month = date.toLocaleDateString("en-US", { month: "short" });
      const year = date.getFullYear();
      const formattedDate = `${day} ${month} ${year}`;

      return {
        date: formattedDate,
        timeInfo,
      };
    } catch (error) {
      return { date: dateString };
    }
  };

  const getAnniversaryDisplay = () => {
    const anniversary = specialDates.find((date) =>
      date.title.toLowerCase().includes("anniversary")
    );

    if (anniversary) {
      return formatDisplayDate(anniversary.date, anniversary.togetherFor);
    }
    return {
      date: "Not set",
    };
  };

  const getDayMetDisplay = () => {
    const dayMet = specialDates.find((date) =>
      date.title.toLowerCase().includes("met")
    );

    if (dayMet) {
      return formatDisplayDate(dayMet.date, dayMet.knownFor);
    }
    return {
      date: "Not set",
    };
  };

  // fetch functions
  const fetchSpecialDates = async () => {
    try {
      const token = await AsyncStorage.getItem("token");

      if (!token) {
        return;
      }

      const dates = await getSpecialDates(token);

      setSpecialDates(dates);
    } catch (error) {
      console.error("Failed to fetch special dates:", error);
    } finally {
      setLoading(false);
    }
  };

  // declarations
  const anniversaryDisplay = getAnniversaryDisplay();
  const dayMetDisplay = getDayMetDisplay();

  if (loading) {
    return (
      <View style={styles.wrapper}>
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  return (
    <View style={styles.wrapper}>
      <View style={styles.row}>
        <Text style={styles.label}>Anniversary date</Text>
      </View>
      <View style={styles.valueRow}>
        <View style={styles.valueContainer}>
          <Text style={styles.value}>{anniversaryDisplay.date}</Text>
          {anniversaryDisplay.timeInfo && (
            <Text style={styles.timeInfo}>
              {" "}
              ({anniversaryDisplay.timeInfo})
            </Text>
          )}
        </View>
      </View>
      <View style={styles.row}>
        <Text style={styles.label}>Day met</Text>
      </View>
      <View style={styles.valueRow}>
        <View style={styles.valueContainer}>
          <Text style={styles.value}>{dayMetDisplay.date}</Text>
          {dayMetDisplay.timeInfo && (
            <Text style={styles.timeInfo}> ({dayMetDisplay.timeInfo})</Text>
          )}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    width: "100%",
    marginBottom: 24,
  },
  row: {
    marginTop: 10,
    marginBottom: 4,
  },
  label: {
    fontSize: 18,
    color: "#b0b3c6",
    fontWeight: "bold",
    marginBottom: 2,
  },
  valueRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  valueContainer: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    marginRight: 12,
  },
  value: {
    fontSize: 16,
    color: "#fff",
    fontWeight: "bold",
  },
  timeInfo: {
    fontSize: 16,
    color: "#a2a5b8",
    fontWeight: "normal",
  },
  loadingText: {
    fontSize: 16,
    color: "#a2a5b8",
    textAlign: "center",
    padding: 20,
  },
});

export default PartnerAnniversary;
