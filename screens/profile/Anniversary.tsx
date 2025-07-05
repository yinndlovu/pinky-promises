import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet } from "react-native";
import { TouchableOpacity } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  getSpecialDates,
  createSpecialDate,
  updateSpecialDate,
} from "../../services/specialDateService";
import UpdateSpecialDateModal from "../../components/modals/UpdateSpecialDateModal";
import AlertModal from "../../components/modals/AlertModal";

type Props = {
  anniversaryDate?: string;
  dayMet?: string;
  onEditAnniversary?: () => void;
  onEditDayMet?: () => void;
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

const Anniversary: React.FC<Props> = ({
  anniversaryDate = "Not set",
  dayMet = "Not set",
  onEditAnniversary,
  onEditDayMet,
}) => {
  const [specialDates, setSpecialDates] = useState<SpecialDate[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingDate, setEditingDate] = useState<SpecialDate | null>(null);
  const [modalType, setModalType] = useState<"anniversary" | "dayMet">(
    "anniversary"
  );
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");

  useEffect(() => {
    fetchSpecialDates();
  }, []);

  const formatDisplayDate = (
    dateString: string,
    timeInfo?: string
  ): { date: string; timeInfo?: string } => {
    if (!dateString || dateString === "Not set") return { date: "Not set" };

    try {
      const date = new Date(dateString);
      const day = date.getDate();
      const month = date.toLocaleDateString("en-US", { month: "short" });
      const year = date.getFullYear();
      const formattedDate = `${day} ${month} ${year}`;

      return { date: formattedDate, timeInfo };
    } catch (error) {
      return { date: dateString };
    }
  };

  const fetchSpecialDates = async () => {
    try {
      const token = await AsyncStorage.getItem("token");
      if (!token) return;

      const dates = await getSpecialDates(token);
      setSpecialDates(dates);
    } catch (error) {
      console.error("Failed to fetch special dates:", error);
    }
  };

  const handleEditAnniversary = () => {
    const anniversary = specialDates.find((date) =>
      date.title.toLowerCase().includes("anniversary")
    );

    if (anniversary) {
      setEditingDate(anniversary);
    } else {
      setEditingDate(null);
    }
    setModalType("anniversary");
    setModalVisible(true);
  };

  const handleEditDayMet = () => {
    const dayMet = specialDates.find((date) =>
      date.title.toLowerCase().includes("met")
    );

    if (dayMet) {
      setEditingDate(dayMet);
    } else {
      setEditingDate(null);
    }
    setModalType("dayMet");
    setModalVisible(true);
  };

  const handleSave = async (
    date: string,
    title: string,
    description?: string
  ) => {
    const token = await AsyncStorage.getItem("token");
    if (!token) throw new Error("No token");

    if (editingDate) {
      await updateSpecialDate(token, editingDate.id, date, title, description);
    } else {
      await createSpecialDate(token, date, title, description);
    }

    fetchSpecialDates();
  };

  const getAnniversaryDisplay = () => {
    const anniversary = specialDates.find((date) =>
      date.title.toLowerCase().includes("anniversary")
    );

    if (anniversary) {
      return formatDisplayDate(anniversary.date, anniversary.togetherFor);
    }
    return { date: "Not set" };
  };

  const getDayMetDisplay = () => {
    const dayMet = specialDates.find((date) =>
      date.title.toLowerCase().includes("met")
    );

    if (dayMet) {
      return formatDisplayDate(dayMet.date, dayMet.knownFor);
    }
    return { date: "Not set" };
  };

  const anniversaryDisplay = getAnniversaryDisplay();
  const dayMetDisplay = getDayMetDisplay();

  return (
  <View style={styles.wrapper}>
    <View style={styles.row}>
      <Text style={styles.label}>Anniversary date</Text>
    </View>
    <View style={styles.valueRow}>
        <View style={styles.valueContainer}>
          <Text style={styles.value}>{anniversaryDisplay.date}</Text>
          {anniversaryDisplay.timeInfo && (
            <Text style={styles.timeInfo}>  ({anniversaryDisplay.timeInfo})</Text>
          )}
        </View>
        <TouchableOpacity
          style={styles.editButton}
          onPress={handleEditAnniversary}
        >
        <Text style={styles.editButtonText}>Edit</Text>
      </TouchableOpacity>
    </View>
    <View style={styles.row}>
      <Text style={styles.label}>Day met</Text>
    </View>
    <View style={styles.valueRow}>
        <View style={styles.valueContainer}>
          <Text style={styles.value}>{dayMetDisplay.date}</Text>
          {dayMetDisplay.timeInfo && (
            <Text style={styles.timeInfo}>  ({dayMetDisplay.timeInfo})</Text>
          )}
        </View>
        <TouchableOpacity style={styles.editButton} onPress={handleEditDayMet}>
        <Text style={styles.editButtonText}>Edit</Text>
      </TouchableOpacity>
    </View>

      <UpdateSpecialDateModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        onSave={handleSave}
        initialDate={editingDate?.date}
        initialTitle={
          editingDate?.title ||
          (modalType === "anniversary" ? "Anniversary" : "Day we met")
        }
        initialDescription={editingDate?.description}
        isEditing={!!editingDate}
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
  editButton: {
    backgroundColor: "#e03487",
    borderRadius: 8,
    paddingVertical: 4,
    paddingHorizontal: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  editButtonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 13,
    letterSpacing: 0.5,
  },
});

export default Anniversary;
