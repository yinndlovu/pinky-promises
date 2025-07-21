// external
import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
} from "react-native";

// screen content
import ConfirmationModal from "../../components/modals/ConfirmationModal";

// types
type Memory = {
  id: string;
  memory: string;
  date: string;
  author: string | null;
  userId: string;
};

type Props = {
  memories: Memory[];
  currentUserId: string;
  onViewAll?: () => void;
  onViewDetails?: (memoryId: string) => void;
  onAdd?: () => void;
  onEdit?: (memory: Memory) => void;
  onDelete?: (memory: Memory) => void;
  showAll?: boolean;
};

const FavoriteMemories: React.FC<Props> = ({
  memories,
  currentUserId,
  onViewAll,
  onViewDetails,
  onAdd,
  onEdit,
  onDelete,
  showAll = false,
}) => {
  // variables
  const displayMemories = showAll ? memories : memories.slice(0, 5);

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

  // helpers
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

  return (
    <View style={styles.wrapper}>
      <View style={styles.headerRow}>
        <Text style={styles.sectionTitle}>Favorite memories</Text>
        {onViewAll && memories.length > 5 && !showAll && (
          <TouchableOpacity style={styles.viewButton} onPress={onViewAll}>
            <Text style={styles.viewButtonText}>View all</Text>
          </TouchableOpacity>
        )}
      </View>
      <View style={styles.memoriesCard}>
        {displayMemories.length === 0 ? (
          <Text style={styles.noMemoriesText}>
            You haven't added any favorite memories yet.
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
                  <Text style={styles.metaText}>{formatDate(item.date)}</Text>
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
    color: "#e03487",
    fontWeight: "bold",
    fontSize: 15,
    letterSpacing: 0.5,
  },
  memoriesCard: {
    backgroundColor: "#1b1c2e",
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 20,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },
  memoryItem: {
    paddingVertical: 12,
  },
  memoryText: {
    color: "#fff",
    fontSize: 15,
    lineHeight: 22,
    textAlign: "left",
    marginBottom: 6,
  },
  noMemoriesText: {
    color: "#b0b3c6",
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
    color: "#b0b3c6",
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
    backgroundColor: "#393a4a",
  },
  actionText: {
    color: "#e03487",
    fontWeight: "bold",
    fontSize: 13,
  },
  separator: {
    height: 1,
    backgroundColor: "#393a4a",
    opacity: 0.5,
    marginVertical: 8,
  },
  addButton: {
    marginTop: 18,
    alignSelf: "center",
    backgroundColor: "#e03487",
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 16,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },
  addButtonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
});

export default FavoriteMemories;
