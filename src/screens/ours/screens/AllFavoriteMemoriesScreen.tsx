// external
import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useQuery } from "@tanstack/react-query";
import { useSafeAreaInsets } from "react-native-safe-area-context";

// internal
import {
  getAllFavoriteMemories,
  getFavoriteMemoryById,
} from "../../../services/favoriteMemoriesService";
import { Memory } from "../../../types/Memory";
import { useAuth } from "../../../contexts/AuthContext";

// confirmation modal
import FavoriteMemoryDetailsModal from "../../../components/modals/FavoriteMemoryDetailsModal";
import ConfirmationModal from "../../../components/modals/ConfirmationModal";

const AllFavoriteMemoriesScreen = () => {
  // variables
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const currentUserId = user?.id;

  // use states
  const [refreshing, setRefreshing] = useState(false);
  const [detailsModalVisible, setDetailsModalVisible] = useState(false);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [detailsMemory, setDetailsMemory] = useState<any>(null);
  const [selectedMemory, setSelectedMemory] = useState<Memory | null>(null);
  const [actionModalVisible, setActionModalVisible] = useState(false);

  // fetch functions
  const {
    data: memories = [],
    isLoading: memoriesLoading,
    error,
    refetch: refetchMemories,
  } = useQuery({
    queryKey: ["allFavoriteMemories"],
    queryFn: async () => {
      const token = await AsyncStorage.getItem("token");

      if (!token) {
        throw new Error("Session expired, please log in again");
      }

      return await getAllFavoriteMemories(token);
    },
    staleTime: 1000 * 60 * 10,
  });

  // handlers
  const handleViewMemoryDetails = async (memoryId: string) => {
    setDetailsLoading(true);
    setDetailsModalVisible(true);
    try {
      const token = await AsyncStorage.getItem("token");

      if (!token) {
        throw new Error("Session expired, please log in again");
      }

      const memory = await getFavoriteMemoryById(token, memoryId);
      setDetailsMemory(memory);
    } catch (err) {
      setDetailsMemory(null);
    }
    setDetailsLoading(false);
  };

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

    if (action === "delete") {
      onDelete(selectedMemory);
    }

    setSelectedMemory(null);
  };

  // refresh screen
  const onRefresh = async () => {
    setRefreshing(true);
    await refetchMemories();
    setRefreshing(false);
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

  return (
    <View style={{ flex: 1, backgroundColor: "#23243a" }}>
      <Text
        style={{
          color: "#fff",
          textAlign: "center",
          marginTop: 10,
          fontSize: 16,
          fontWeight: "bold",
          marginBottom: 15,
        }}
      >
        These are all your favorite memories
      </Text>
      {memoriesLoading ? (
        <ActivityIndicator color="#e03487" style={{ marginTop: 40 }} />
      ) : error ? (
        <Text style={{ color: "red", textAlign: "center", marginTop: 40 }}>
          {error.message || "Failed to load memories"}
        </Text>
      ) : (
        <FlatList
          data={memories}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ padding: 18, paddingBottom: 40 }}
          renderItem={({ item }) => (
            <TouchableOpacity
              onPress={() => handleViewMemoryDetails(item.id)}
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
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor="#e03487"
              colors={["#e03487"]}
              progressBackgroundColor="#23243a"
            />
          }
          ListEmptyComponent={
            <Text
              style={{ color: "#b0b3c6", textAlign: "center", marginTop: 40 }}
            >
              No favorite memories yet
            </Text>
          }
        />
      )}

      <FavoriteMemoryDetailsModal
        visible={detailsModalVisible}
        onClose={() => setDetailsModalVisible(false)}
        memory={detailsMemory}
        loading={detailsLoading}
      />

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
  memoryItem: {
    backgroundColor: "#1b1c2e",
    borderRadius: 12,
    padding: 16,
    marginBottom: 10,
  },
  memoryText: {
    color: "#fff",
    fontSize: 15,
    lineHeight: 22,
    textAlign: "left",
    marginBottom: 6,
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
  separator: {
    height: 1,
    backgroundColor: "#393a4a",
    opacity: 0.5,
    marginVertical: 8,
  },
});

export default AllFavoriteMemoriesScreen;
