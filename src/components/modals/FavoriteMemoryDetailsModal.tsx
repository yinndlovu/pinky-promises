import React from "react";
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  TouchableWithoutFeedback,
} from "react-native";
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
  if (!dateStr) {
    return "";
  }

  const date = new Date(dateStr);

  return date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const FavoriteMemoryDetailsModal: React.FC<Props> = ({
  visible,
  onClose,
  memory,
  loading = false,
}) => (
  <Modal visible={visible} transparent animationType="fade">
    <TouchableWithoutFeedback onPress={onClose}>
      <View style={styles.overlay}>
        <View style={styles.content}>
          <View style={styles.header}>
            <Text style={styles.title}>Favorite memory</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Feather name="x" size={24} color="#fff" />
            </TouchableOpacity>
          </View>
          {loading ? (
            <Text style={styles.loadingText}>Loading...</Text>
          ) : memory ? (
            <>
              {/* Date at the top */}
              <Text style={styles.memoryDateText}>
                this happened on {formatDate(memory.date)}
              </Text>

              {/* Memory text */}
              <Text style={styles.memoryText}>{memory.memory}</Text>

              {/* Author below memory text */}
              <Text style={styles.memoryAuthorText}>
                {memory.author
                  ? `${memory.author} wrote this`
                  : "Unknown author"}
              </Text>

              {/* Created and updated at the bottom, side by side */}
              <View style={styles.bottomRow}>
                <Text style={styles.bottomMeta}>
                  Created: {formatDate(memory.createdAt)}
                </Text>
                <Text style={styles.bottomMeta}>
                  Last updated: {formatDate(memory.updatedAt)}
                </Text>
              </View>
            </>
          ) : (
            <Text style={styles.loadingText}>No memory found.</Text>
          )}
        </View>
      </View>
    </TouchableWithoutFeedback>
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
  memoryDateText: {
    color: "#b0b3c6",
    fontSize: 13,
    textAlign: "center",
    marginBottom: 14,
  },
  memoryText: {
    color: "#fff",
    fontSize: 16,
    marginBottom: 18,
    lineHeight: 22,
    textAlign: "center",
  },
  memoryAuthorText: {
    color: "#b0b3c6",
    fontSize: 13,
    textAlign: "center",
    marginBottom: 18,
  },
  bottomRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
    gap: 8,
  },
  bottomMeta: {
    color: "#7c7e8a",
    fontSize: 12,
    flex: 1,
    textAlign: "center",
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
