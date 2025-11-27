// external
import React, { useState, useMemo } from "react";
import { View, Text, StyleSheet } from "react-native";
import { TouchableOpacity } from "react-native";
import { useQueryClient } from "@tanstack/react-query";

// internal
import {
  createSpecialDate,
  updateSpecialDate,
} from "../../../../services/api/ours/specialDateService";
import { useAuth } from "../../../../contexts/AuthContext";
import { AnniversaryProps, SpecialDate } from "../../../../types/SpecialDate";
import { formatProfileDisplayDate } from "../../../../utils/formatters/formatDate";
import useToken from "../../../../hooks/useToken";
import { useTheme } from "../../../../theme/ThemeContext";

// screen content
import UpdateSpecialDateModal from "../../../../components/modals/input/UpdateSpecialDateModal";
import AlertModal from "../../../../components/modals/output/AlertModal";
import Shimmer from "../../../../components/skeletons/Shimmer";

const Anniversary: React.FC<AnniversaryProps> = ({
  specialDates,
  specialDatesLoading,
}) => {
  // variables
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const token = useToken();
  const { theme } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);

  // use states
  const [modalVisible, setModalVisible] = useState(false);
  const [editingDate, setEditingDate] = useState<SpecialDate | null>(null);
  const [modalType, setModalType] = useState<"anniversary" | "dayMet">(
    "anniversary"
  );
  const [alertMessage, setAlertMessage] = useState("");
  const [alertTitle, setAlertTitle] = useState("");
  const [showSuccessAlert, setShowSuccessAlert] = useState(false);
  const [showErrorAlert, setShowErrorAlert] = useState(false);
  const [loading, setLoading] = useState(false);

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
    setLoading(true);

    if (editingDate) {
      try {
        await updateSpecialDate(
          token,
          editingDate.id,
          date,
          title,
          description
        );
        setAlertTitle("Updated");
        setAlertMessage(
          modalType === "anniversary"
            ? "Your anniversary date has been updated."
            : "The day you met has been updated."
        );
        setLoading(false);
        setModalVisible(false);
        setShowSuccessAlert(true);
      } catch (error: any) {
        setAlertTitle("Failed");
        setAlertMessage(
          error.response.data?.error || "Failed to update special date"
        );
        setLoading(false);
        setModalVisible(false);
        setShowErrorAlert(true);
      }
    } else {
      try {
        await createSpecialDate(token, date, title, description);
        setAlertTitle("Created");
        setAlertMessage(
          modalType === "anniversary"
            ? "Your anniversary date has been set."
            : "The day you met has been set."
        );
        setLoading(false);
        setModalVisible(false);
        setShowSuccessAlert(true);
      } catch (error: any) {
        setAlertTitle("Failed");
        setAlertMessage(
          error.response.data?.error || "Failed to create special date"
        );
        setLoading(false);
        setModalVisible(false);
        setShowErrorAlert(true);
      }
    }

    await queryClient.invalidateQueries({
      queryKey: ["specialDates", user?.id],
    });
    await queryClient.invalidateQueries({
      queryKey: ["recentActivities", user?.id],
    });
    await queryClient.invalidateQueries({
      queryKey: ["upcomingSpecialDate", user?.id],
    });
    await queryClient.invalidateQueries({
      queryKey: ["aiContext", user?.id],
    });
  };

  // declarations
  const anniversaryDisplay = getAnniversaryDisplay();
  const dayMetDisplay = getDayMetDisplay();

  if (specialDatesLoading) {
    return (
      <View style={styles.wrapper}>
        <Shimmer radius={8} height={90} style={{ width: "100%" }} />
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
          loading={loading}
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
    </View>
  );
};

const createStyles = (theme: ReturnType<typeof useTheme>["theme"]) =>
  StyleSheet.create({
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
      color: theme.colors.muted,
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
      color: theme.colors.text,
      fontWeight: "bold",
    },
    timeInfo: {
      fontSize: 16,
      color: "#a2a5b8",
      fontWeight: "normal",
    },
    editButton: {
      backgroundColor: theme.colors.primary,
      borderRadius: 8,
      paddingVertical: 4,
      paddingHorizontal: 12,
      alignItems: "center",
      justifyContent: "center",
    },
    editButtonText: {
      color: theme.colors.text,
      fontWeight: "bold",
      fontSize: 13,
      letterSpacing: 0.5,
    },
  });

export default Anniversary;
