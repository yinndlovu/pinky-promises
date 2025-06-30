import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Feather } from "@expo/vector-icons";

type Props = {
  onAddHome?: () => void;
  mood?: string;
  moodDescription?: string;
  onEdit?: () => void;
};

const StatusMood: React.FC<Props> = ({
  onAddHome,
  mood = "Happy",
  moodDescription = "description of the mood",
  onEdit,
}) => (
  <View style={styles.wrapper}>
    <View style={styles.headerRow}>
      <Text style={styles.statusLabel}>Status</Text>
    </View>
    <View style={styles.statusUnavailableRow}>
      <Text style={styles.statusUnavailable}>Home</Text>
      <TouchableOpacity style={styles.addButton} onPress={onAddHome}>
        <Feather name="plus" size={18} color="#fff" />
      </TouchableOpacity>
    </View>
    <Text style={styles.statusUnavailableDescription}>
      You're currently at home
    </Text>
    <View style={styles.moodRow}>
      <Text style={styles.moodLabel}>Mood</Text>
      <TouchableOpacity style={styles.editButton} onPress={onEdit}>
        <Feather name="edit-2" size={18} color="#e03487" />
      </TouchableOpacity>
    </View>
    <View style={styles.moodContentRow}>
      <Text style={styles.moodValue}>{mood}</Text>
      <Text style={styles.moodDescription}> - {moodDescription}</Text>
    </View>
  </View>
);

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
});

export default StatusMood;
