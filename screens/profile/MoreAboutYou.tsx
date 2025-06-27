import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Feather } from "@expo/vector-icons";

type Props = {
  about?: string;
  onEdit?: () => void;
};

const MoreAboutYou: React.FC<Props> = ({
  about = "stuff about you",
  onEdit,
}) => (
  <View style={styles.wrapper}>
    <View style={styles.headerRow}>
      <Text style={styles.label}>More about you</Text>
      <TouchableOpacity style={styles.editButton} onPress={onEdit}>
        <Feather name="edit-2" size={18} color="#e03487" />
      </TouchableOpacity>
    </View>
    <View style={styles.valueRow}>
      <Text style={styles.value}>{about}</Text>
    </View>
  </View>
);

const styles = StyleSheet.create({
  wrapper: {
    width: "100%",
    marginBottom: 50,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  label: {
    fontSize: 18,
    color: "#b0b3c6",
    fontWeight: "bold",
    marginBottom: 2,
  },
  editButton: {
    backgroundColor: "transparent",
    borderRadius: 8,
    paddingVertical: 4,
    paddingHorizontal: 12,
    alignItems: "center",
    justifyContent: "center",
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
});

export default MoreAboutYou;
