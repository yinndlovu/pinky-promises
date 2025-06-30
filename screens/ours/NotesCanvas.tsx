import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Feather } from "@expo/vector-icons";

type Props = {
  onView?: () => void;
};

const NotesCanvas: React.FC<Props> = ({ onView }) => (
  <View style={styles.wrapper}>
    <View style={styles.headerRow}>
      <Text style={styles.sectionTitle}>Our notes</Text>
      <TouchableOpacity style={styles.viewButton} onPress={onView}>
        <Text style={styles.viewButtonText}>View</Text>
      </TouchableOpacity>
    </View>
    <View style={styles.canvas}>
      <Text style={styles.placeholderText}>
        This is your shared canvas for notes, doodles, or memories.
      </Text>
    </View>
  </View>
);

const styles = StyleSheet.create({
  wrapper: {
    width: "100%",
    marginBottom: 32,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 10,
    marginTop: 8,
  },
  sectionTitle: {
    fontSize: 18,
    color: "#b0b3c6",
    fontWeight: "bold",
    letterSpacing: 1,
    marginLeft: 12,
  },
  viewButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "transparent",
    borderRadius: 8,
    paddingVertical: 4,
    paddingHorizontal: 12,
  },
  viewButtonText: {
    color: "#e03487",
    fontWeight: "bold",
    fontSize: 15,
    marginLeft: 6,
    letterSpacing: 0.5,
  },
  canvas: {
    backgroundColor: "#1b1c2e",
    borderRadius: 16,
    minHeight: 200,
    padding: 20,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },
  placeholderText: {
    color: "#b0b3c6",
    fontSize: 15,
    textAlign: "center",
    opacity: 0.8,
  },
});

export default NotesCanvas;
