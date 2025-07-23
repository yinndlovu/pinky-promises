// external
import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";

// types
type Props = {
  onView?: () => void;
  preview?: string;
  updatedAt?: string | null;
};

// helpers
const formatDateTime = (isoString?: string | null) => {
  if (!isoString) {
    return "";
  }

  const date = new Date(isoString);
  
  return (
    date.toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
    }) +
    " " +
    date.toLocaleTimeString("en-GB", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    })
  );
};

const NotesCanvas: React.FC<Props> = ({ onView, preview, updatedAt }) => (
  <View style={styles.wrapper}>
    <View style={styles.headerRow}>
      <Text style={styles.sectionTitle}>Our notes</Text>
      <TouchableOpacity style={styles.viewButton} onPress={onView}>
        <Text style={styles.viewButtonText}>View</Text>
      </TouchableOpacity>
    </View>
    <View style={styles.canvas}>
    <Text style={styles.placeholderText}>
        {preview && preview.trim().length > 0
          ? (preview.length > 120 ? preview.slice(0, 120) + "..." : preview)
          : "This is your shared canvas for notes or memories"}
      </Text>
      {updatedAt && (
        <Text style={styles.updatedAt}>
          Last updated: {formatDateTime(updatedAt)}
        </Text>
      )}
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
  },
  sectionTitle: {
    fontSize: 18,
    color: "#b0b3c6",
    fontWeight: "bold",
    letterSpacing: 0,
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
    position: "relative"
  },
  placeholderText: {
    color: "#b0b3c6",
    fontSize: 15,
    textAlign: "center",
    opacity: 0.8,
  },
  updatedAt: {
    position: "absolute",
    right: 12,
    bottom: 10,
    color: "#b0b3c6",
    fontSize: 11,
    opacity: 0.7,
  },
});

export default NotesCanvas;
