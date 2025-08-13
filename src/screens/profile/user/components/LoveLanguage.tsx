// external
import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { TouchableOpacity } from "react-native";
import { Feather } from "@expo/vector-icons";

// internal
import { LoveLanguageProps } from "../../../../types/LoveLanguage";

const LoveLanguage: React.FC<LoveLanguageProps> = ({
  loveLanguage = "",
  onEdit,
}) => (
  <View style={styles.wrapper}>
    <View style={styles.headerRow}>
      <Text style={styles.label}>Love language</Text>
      <TouchableOpacity style={styles.editButton} onPress={onEdit}>
        <Feather name="edit-2" size={18} color="#e03487" />
      </TouchableOpacity>
    </View>
    <View style={styles.valueRow}>
      <Text style={loveLanguage ? styles.value : styles.noValue}>
        {loveLanguage ? loveLanguage : "No love language added"}
      </Text>
    </View>
  </View>
);

const styles = StyleSheet.create({
  wrapper: {
    width: "100%",
    marginBottom: 18,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  row: {
    marginTop: 0,
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
    marginBottom: 8,
  },
  value: {
    fontSize: 16,
    color: "#fff",
    fontWeight: "bold",
  },
  editButton: {
    backgroundColor: "transparent",
    borderRadius: 8,
    paddingVertical: 4,
    paddingHorizontal: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  noValue: {
    color: "#b0b3c6",
    fontSize: 16,
    fontStyle: "italic",
    textAlign: "center",
  },
});

export default LoveLanguage;
