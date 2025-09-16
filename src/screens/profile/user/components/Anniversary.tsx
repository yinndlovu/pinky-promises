// external
import React, { useState } from "react";
import { View, Text, StyleSheet } from "react-native";
import { TouchableOpacity } from "react-native";
import { useQuery, useQueryClient } from "@tanstack/react-query";

// internal
import {
  getSpecialDates,
  createSpecialDate,
  updateSpecialDate,
} from "../../../../services/api/ours/specialDateService";
import { useAuth } from "../../../../contexts/AuthContext";
import { AnniversaryProps, SpecialDate } from "../../../../types/SpecialDate";
import { formatProfileDisplayDate } from "../../../../utils/formatters/formatDate";
import useToken from "../../../../hooks/useToken";

// screen content
import UpdateSpecialDateModal from "../../../../components/modals/input/UpdateSpecialDateModal";
import AlertModal from "../../../../components/modals/output/AlertModal";

const Anniversary: React.FC<AnniversaryProps> = () => {
  // variables
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const token = useToken();

  // use states
  const [modalVisible, setModalVisible] = useState(false);
  const [editingDate, setEditingDate] = useState<SpecialDate | null>(null);
  const [modalType, setModalType] = useState<"anniversary" | "dayMet">(
    "anniversary"
  );
  const [alertMessage, setAlertMessage] = useState("");
  const [alertTitle, setAlertTitle] = useState("");
  const [showSuccessAlert, setShowSuccess] = useState(false);

  if (!token) {
    return;
  }

  // fetch functions
  const {
    data: specialDates = [],
    isLoading: specialDatesLoading,
    refetch: refetchSpecialDates,
  } = useQuery<SpecialDate[]>({
    queryKey: ["specialDates", user?.id],
    queryFn: async () => {
      return await getSpecialDates(token);
    },
    staleTime: 1000 * 60 * 60 * 24,
  });

  // helpers
  const getAnniversaryDisplay = () => {
    const anniversary = specialDates.find((date: SpecialDate) =>
      date.title.toLowerCase().includes("anniversary")
    );

    if (anniversary) {
      return formatProfileDisplayDate(
        anniversary.date,
        anniversary.togetherFor
      );
    }
    return {
      date: "Not set",
    };
  };

  const getDayMetDisplay = () => {
    const dayMet = specialDates.find(
      (date: SpecialDate) =>
        date.title.toLowerCase().includes("met") ||
        date.title.toLowerCase().includes("meet")
    );

    if (dayMet) {
      return formatProfileDisplayDate(dayMet.date, dayMet.knownFor);
    }
    return {
      date: "Not set",
    };
  };

  // handlers
  const handleEditAnniversary = () => {
    const anniversary = specialDates.find((date: SpecialDate) =>
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
    const dayMet = specialDates.find((date: SpecialDate) =>
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
    setModalVisible(false);

    if (editingDate) {
      await updateSpecialDate(token, editingDate.id, date, title, description);
      setAlertTitle("Updated");
      setAlertMessage(
        modalType === "anniversary"
          ? "Your anniversary date has been updated."
          : "The day you met has been updated."
      );
      setShowSuccess(true);
    } else {
      await createSpecialDate(token, date, title, description);
      setAlertTitle("Created");
      setAlertMessage(
        modalType === "anniversary"
          ? "Your anniversary date has been set."
          : "The day you met has been set."
      );
      setShowSuccess(true);
    }

    await queryClient.invalidateQueries({
      queryKey: ["specialDates", user?.id],
    });
  };

  // declarations
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
            <Text style={styles.timeInfo}>
              {" "}
              ({anniversaryDisplay.timeInfo})
            </Text>
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
            <Text style={styles.timeInfo}> ({dayMetDisplay.timeInfo})</Text>
          )}
        </View>
        <TouchableOpacity style={styles.editButton} onPress={handleEditDayMet}>
          <Text style={styles.editButtonText}>Edit</Text>
        </TouchableOpacity>
      </View>

      <View style={{ zIndex: 1000 }}>
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
          visible={showSuccessAlert}
          type="success"
          title={alertTitle}
          message={alertMessage}
          buttonText="Great"
          onClose={() => setShowSuccess(false)}
        />
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
