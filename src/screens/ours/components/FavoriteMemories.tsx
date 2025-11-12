// external
import React, { useState, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
} from "react-native";

// internal
import { Memory, FavoriteMemoryProps } from "../../../types/Memory";
import { formatDateDMY } from "../../../utils/formatters/formatDate";
import { useTheme } from "../../../theme/ThemeContext";

// screen content
import ConfirmationModal from "../../../components/modals/selection/ConfirmationModal";

const FavoriteMemories: React.FC<FavoriteMemoryProps> = ({
  memories,
  currentUserId,
  onViewAll,
  onViewDetails,
  onAdd,
  onEdit,
  onDelete,
}) => {
  // variables
  const displayMemories = memories.slice(0, 5);
  const { theme } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);

  // use states
  const [selectedMemory, setSelectedMemory] = useState<Memory | null>(null);
  const [actionModalVisible, setActionModalVisible] = useState(false);

  // handlers
  const handleLongPress = (item: Memory) => {
    if (item.userId === currentUserId) {
      setSelectedMemory(item);
      setActionModalVisible(true);
    }
  };

  const handleAction = (action: "edit" | "delete") => {
    if (!selectedMemory) {
      return;
    }

    setActionModalVisible(false);

    if (action === "edit" && onEdit) {
      onEdit(selectedMemory);
    }

    if (action === "delete" && onDelete) {
      onDelete(selectedMemory);
    }

    setSelectedMemory(null);
  };

  return (
    <View style={styles.wrapper}>
      <View style={styles.headerRow}>
        <Text style={styles.sectionTitle}>Favorite memories</Text>
        {onViewAll && memories.length >= 4 && (
          <TouchableOpacity style={styles.viewButton} onPress={onViewAll}>
            <Text style={styles.viewButtonText}>View all</Text>
          </TouchableOpacity>
        )}
      </View>
      <View style={styles.memoriesCard}>
        {displayMemories.length === 0 ? (
          <Text style={styles.noMemoriesText}>
            You haven't added any favorite memories yet
          </Text>
        ) : (
          <FlatList
            data={displayMemories}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <TouchableOpacity
                onPress={() => onViewDetails && onViewDetails(item.id)}
                onLongPress={() => handleLongPress(item)}
                delayLongPress={400}
                activeOpacity={0.7}
                style={styles.memoryItem}
              >
                <Text style={styles.memoryText}>{item.memory}</Text>
                <View style={styles.metaRow}>
                  <Text style={styles.metaText}>
                    {item.author ? `By ${item.author}` : "By Unknown"}
                  </Text>
                  <Text style={styles.metaText}>
                    {formatDateDMY(item.date)}
                  </Text>
                </View>
              </TouchableOpacity>
            )}
            ItemSeparatorComponent={() => <View style={styles.separator} />}
            scrollEnabled={false}
          />
        )}
      </View>
      {onAdd && (
        <TouchableOpacity style={styles.addButton} onPress={onAdd}>
          <Text style={styles.addButtonText}>+ Add new memory</Text>
        </TouchableOpacity>
      )}

      <ConfirmationModal
        visible={actionModalVisible}
        message="What would you like to do with this memory?"
        confirmText="Edit"
        cancelText="Delete"
        onConfirm={() => handleAction("edit")}
        onCancel={() => handleAction("delete")}
        onClose={() => {
          setActionModalVisible(false);
          setSelectedMemory(null);
        }}
      />
    </View>
  );
};

const createStyles = (theme: ReturnType<typeof useTheme>["theme"]) =>
  StyleSheet.create({
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
      color: theme.colors.muted,
      fontWeight: "bold",
      letterSpacing: 0,
      marginLeft: 12,
    },
    viewButton: {
      backgroundColor: "transparent",
      borderRadius: 8,
      paddingVertical: 4,
      paddingHorizontal: 12,
    },
    viewButtonText: {
      color: theme.colors.primary,
      fontWeight: "bold",
      fontSize: 15,
      letterSpacing: 0.5,
    },
    memoriesCard: {
      backgroundColor: theme.colors.surfaceAlt,
      borderRadius: 16,
      paddingVertical: 16,
      paddingHorizontal: 20,
      shadowColor: theme.colors.shadow,
      shadowOpacity: 0.08,
      shadowRadius: 8,
      elevation: 2,
    },
    memoryItem: {
      paddingVertical: 12,
    },
    memoryText: {
      color: theme.colors.text,
      fontSize: 15,
      lineHeight: 22,
      textAlign: "left",
      marginBottom: 6,
    },
    noMemoriesText: {
      color: theme.colors.muted,
      fontSize: 15,
      textAlign: "center",
      paddingVertical: 24,
    },
    metaRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      marginBottom: 4,
    },
    metaText: {
      color: theme.colors.muted,
      fontSize: 12,
    },
    actionRow: {
      flexDirection: "row",
      marginTop: 4,
    },
    actionButton: {
      paddingVertical: 2,
      paddingHorizontal: 8,
      borderRadius: 6,
      backgroundColor: theme.colors.surfaceAlt,
    },
    actionText: {
      color: theme.colors.accent,
      fontWeight: "bold",
      fontSize: 13,
    },
    separator: {
      height: 1,
      backgroundColor: theme.colors.separatorAlt,
      opacity: 0.5,
      marginVertical: 8,
    },
    addButton: {
      marginTop: 18,
      alignSelf: "center",
      backgroundColor: theme.colors.primary,
      borderRadius: 8,
      paddingVertical: 10,
      paddingHorizontal: 16,
      shadowColor: theme.colors.shadow,
      shadowOpacity: 0.08,
      shadowRadius: 8,
      elevation: 2,
    },
    addButtonText: {
      color: theme.colors.text,
      fontWeight: "bold",
      fontSize: 16,
    },
  });

export default FavoriteMemories;
