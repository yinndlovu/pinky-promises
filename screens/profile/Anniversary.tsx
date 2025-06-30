import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { TouchableOpacity } from "react-native";

type Props = {
  anniversaryDate?: string;
  dayMet?: string;
  onEditAnniversary?: () => void;
  onEditDayMet?: () => void;
};

const Anniversary: React.FC<Props> = ({
  anniversaryDate = "Not set",
  dayMet = "Not set",
  onEditAnniversary,
  onEditDayMet,
}) => (
  <View style={styles.wrapper}>
    <View style={styles.row}>
      <Text style={styles.label}>Anniversary date</Text>
    </View>
    <View style={styles.valueRow}>
      <Text style={styles.value}>{anniversaryDate}</Text>
      <TouchableOpacity style={styles.editButton} onPress={onEditAnniversary}>
        <Text style={styles.editButtonText}>Edit</Text>
      </TouchableOpacity>
    </View>
    <View style={styles.row}>
      <Text style={styles.label}>Day met</Text>
    </View>
    <View style={styles.valueRow}>
      <Text style={styles.value}>{dayMet}</Text>
      <TouchableOpacity style={styles.editButton} onPress={onEditDayMet}>
        <Text style={styles.editButtonText}>Edit</Text>
      </TouchableOpacity>
    </View>
  </View>
);

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
  value: {
    fontSize: 16,
    color: "#fff",
    fontWeight: "bold",
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
