// external
import React, { useMemo } from "react";
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  TouchableWithoutFeedback,
} from "react-native";
import { Feather } from "@expo/vector-icons";

// internal
import { formatDateDMY } from "../../../utils/formatters/formatDate";
import { useTheme } from "../../../theme/ThemeContext";

// types
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

const FavoriteMemoryDetailsModal: React.FC<Props> = ({
  visible,
  onClose,
  memory,
  loading = false,
}) => {
  // variables
  const { theme } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);

  return (
    <Modal visible={visible} transparent animationType="fade">
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.overlay}>
          <View style={styles.content}>
            <View style={styles.header}>
              <Text style={styles.title}>Favorite memory</Text>
              <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                <Feather name="x" size={24} color={theme.colors.text} />
              </TouchableOpacity>
            </View>
            {loading ? (
              <Text style={styles.loadingText}>Loading...</Text>
            ) : memory ? (
              <>
                <Text style={styles.memoryDateText}>
                  this happened on {formatDateDMY(memory.date)}
                </Text>
                <Text style={styles.memoryText}>{memory.memory}</Text>
                <Text style={styles.memoryAuthorText}>
                  {memory.author
                    ? `${memory.author} wrote this`
                    : "Unknown author"}
                </Text>
                <View style={styles.bottomRow}>
                  <Text style={styles.bottomMeta}>
                    Created: {formatDateDMY(memory.createdAt)}
                  </Text>
                  <Text style={styles.bottomMeta}>
                    Last updated: {formatDateDMY(memory.updatedAt)}
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
};

const createStyles = (theme: ReturnType<typeof useTheme>["theme"]) =>
  StyleSheet.create({
    overlay: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: theme.colors.modalOverlay,
      justifyContent: "center",
      alignItems: "center",
      zIndex: 1000,
    },
    content: {
      backgroundColor: theme.colors.background,
      borderRadius: 16,
      padding: 24,
      width: "90%",
      maxWidth: 400,
      shadowColor: theme.colors.shadow,
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
      color: theme.colors.text,
    },
    closeButton: {
      marginLeft: 12,
      padding: 4,
    },
    memoryDateText: {
      color: theme.colors.muted,
      fontSize: 13,
      textAlign: "center",
      marginBottom: 14,
    },
    memoryText: {
      color: theme.colors.text,
      fontSize: 16,
      marginBottom: 18,
      lineHeight: 22,
      textAlign: "center",
    },
    memoryAuthorText: {
      color: theme.colors.muted,
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
      color: theme.colors.mutedAlt,
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
      color: theme.colors.muted,
      fontSize: 14,
      fontWeight: "bold",
      width: 110,
    },
    metaValue: {
      color: theme.colors.text,
      fontSize: 14,
      flex: 1,
      textAlign: "right",
    },
    loadingText: {
      color: theme.colors.muted,
      fontSize: 16,
      textAlign: "center",
      paddingVertical: 24,
    },
  });

export default FavoriteMemoryDetailsModal;
