import React from "react";
import { Modal, View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Feather } from "@expo/vector-icons";

type Props = {
  visible: boolean;
  onClose: () => void;
  memory?: {
    memory: string;
    author: string | null;
    date: string;
    createdAt: string;
    updatedAt: string;
  };
  loading?: boolean;
};

const formatDate = (dateStr?: string) => {
  if (!dateStr) return "";
  const date = new Date(dateStr);
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

const FavoriteMemoryDetailsModal: React.FC<Props> = ({
  visible,
  onClose,
  memory,
  loading = false,
}) => (
  <Modal visible={visible} transparent animationType="fade">
    <View style={styles.overlay}>
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>Favorite Memory Details</Text>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Feather name="x" size={24} color="#fff" />
          </TouchableOpacity>
        </View>
        {loading ? (
          <Text style={styles.loadingText}>Loading...</Text>
        ) : memory ? (
          <>
            <Text style={styles.memoryText}>{memory.memory}</Text>
            <View style={styles.metaRow}>
              <Text style={styles.metaLabel}>By:</Text>
              <Text style={styles.metaValue}>{memory.author || "Unknown"}</Text>
            </View>
            <View style={styles.metaRow}>
              <Text style={styles.metaLabel}>Memory Date:</Text>
              <Text style={styles.metaValue}>{formatDate(memory.date)}</Text>
            </View>
            <View style={styles.metaRow}>
              <Text style={styles.metaLabel}>Created:</Text>
              <Text style={styles.metaValue}>
                {formatDate(memory.createdAt)}
              </Text>
            </View>
            <View style={styles.metaRow}>
              <Text style={styles.metaLabel}>Last Updated:</Text>
              <Text style={styles.metaValue}>
                {formatDate(memory.updatedAt)}
              </Text>
            </View>
          </>
        ) : (
          <Text style={styles.loadingText}>No memory found.</Text>
        )}
      </View>
    </View>
  </Modal>
);

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(5, 3, 12, 0.7)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1000,
  },
  content: {
    backgroundColor: "#23243a",
    borderRadius: 16,
    padding: 24,
    width: "90%",
    maxWidth: 400,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 5,
    position: "relative",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#fff",
  },
  closeButton: {
    marginLeft: 12,
    padding: 4,
  },
  memoryText: {
    color: "#fff",
    fontSize: 16,
    marginBottom: 18,
    lineHeight: 22,
  },
  metaRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 6,
  },
  metaLabel: {
    color: "#b0b3c6",
    fontSize: 14,
    fontWeight: "bold",
    width: 110,
  },
  metaValue: {
    color: "#fff",
    fontSize: 14,
    flex: 1,
    textAlign: "right",
  },
  loadingText: {
    color: "#b0b3c6",
    fontSize: 16,
    textAlign: "center",
    paddingVertical: 24,
  },
});

export default FavoriteMemoryDetailsModal;
