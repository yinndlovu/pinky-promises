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
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useSafeAreaInsets } from "react-native-safe-area-context";

// internal
import {
  getAllFavoriteMemories,
  getFavoriteMemoryById,
  deleteFavoriteMemory,
  updateFavoriteMemory,
} from "../../../services/api/ours/favoriteMemoriesService";
import { Memory } from "../../../types/Memory";
import { useAuth } from "../../../contexts/AuthContext";
import { formatDateDMY } from "../../../utils/formatters/formatDate";

// confirmation modal
import FavoriteMemoryDetailsModal from "../../../components/modals/output/FavoriteMemoryDetailsModal";
import ConfirmationModal from "../../../components/modals/selection/ConfirmationModal";
import UpdateFavoriteMemoryModal from "../../../components/modals/input/UpdateFavoriteMemoryModal";
import AlertModal from "../../../components/modals/output/AlertModal";

const AllFavoriteMemoriesScreen = () => {
  // variables
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const currentUserId = user?.id;

  // use states
  const [refreshing, setRefreshing] = useState(false);
  const [detailsModalVisible, setDetailsModalVisible] = useState(false);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [detailsMemory, setDetailsMemory] = useState<any>(null);
  const [selectedMemory, setSelectedMemory] = useState<Memory | null>(null);
  const [actionModalVisible, setActionModalVisible] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editingMemory, setEditingMemory] = useState<Memory | null>(null);
  const [editLoading, setEditLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showError, setShowError] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");
  const [alertTitle, setAlertTitle] = useState("");

  // fetch functions
  const {
    data: memories = [],
    isLoading: memoriesLoading,
    error,
    refetch: refetchMemories,
  } = useQuery({
    queryKey: ["allFavoriteMemories", user?.id],
    queryFn: async () => {
      const token = await AsyncStorage.getItem("token");

      if (!token) {
        throw new Error("Session expired, please log in again");
      }

      return await getAllFavoriteMemories(token);
    },
    staleTime: 1000 * 60 * 60,
  });

  // handlers
  const handleViewMemoryDetails = async (memoryId: string) => {
    setDetailsLoading(true);
    setDetailsModalVisible(true);
    try {
      const token = await AsyncStorage.getItem("token");

      if (!token) {
        return;
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
    if (!selectedMemory) return;
    setActionModalVisible(false);

    if (action === "edit") {
      setEditingMemory(selectedMemory);
      setEditModalVisible(true);
    } else if (action === "delete") {
      handleDeleteMemory(selectedMemory);
    }
  };

  const handleDeleteMemory = async (memory: Memory) => {
    setEditLoading(true);
    setActionModalVisible(false);

    try {
      const token = await AsyncStorage.getItem("token");

      if (!token) {
        return;
      }

      await deleteFavoriteMemory(token, memory.id);

      await queryClient.invalidateQueries({
        queryKey: ["allFavoriteMemories", user?.id],
      });

      await queryClient.invalidateQueries({
        queryKey: ["recentFavoriteMemories", user?.id],
      });

      setAlertTitle("Deleted");
      setAlertMessage("Favorite memory deleted");
      setShowSuccess(true);
    } catch (err) {
      setAlertTitle("Failed");
      setAlertMessage("Failed to delete favorite memory");
      setShowError(true);
    }

    setEditLoading(false);
    setSelectedMemory(null);
  };

  const handleSaveEditMemory = async (memoryText: string, date: string) => {
    if (!editingMemory) {
      return;
    }

    setEditLoading(true);
    try {
      const token = await AsyncStorage.getItem("token");

      if (!token) {
        return;
      }

      await updateFavoriteMemory(token, editingMemory.id, memoryText, date);

      setEditModalVisible(false);
      setEditingMemory(null);

      await queryClient.invalidateQueries({
        queryKey: ["allFavoriteMemories", user?.id],
      });

      await queryClient.invalidateQueries({
        queryKey: ["recentFavoriteMemories", user?.id],
      });

      setAlertTitle("Updated");
      setAlertMessage("Favorite memory updated");
      setShowSuccess(true);
    } catch (err: any) {
      setAlertTitle("Failed");
      setAlertMessage(
        err.response?.data?.error || "Failed to update favorite memory"
      );
      setShowError(true);
    }

    setEditLoading(false);
  };

  // refresh screen
  const onRefresh = async () => {
    setRefreshing(true);
    await refetchMemories();
    setRefreshing(false);
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
          {error.message || "Failed to load favorite memories"}
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
                <Text style={styles.metaText}>{formatDateDMY(item.date)}</Text>
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

      <UpdateFavoriteMemoryModal
        visible={editModalVisible}
        onClose={() => {
          setEditModalVisible(false);
          setEditingMemory(null);
        }}
        onSave={handleSaveEditMemory}
        initialMemory={editingMemory?.memory}
        initialDate={editingMemory?.date}
        isEditing={true}
        loading={editLoading}
      />

      <AlertModal
        visible={showSuccess}
        type="success"
        title={alertTitle}
        message={alertMessage}
        buttonText="Great"
        onClose={() => setShowSuccess(false)}
      />

      <AlertModal
        visible={showError}
        type="error"
        title={alertTitle}
        message={alertMessage}
        buttonText="Close"
        onClose={() => setShowError(false)}
      />

      {editLoading && !editModalVisible && (
        <View
          style={{
            ...StyleSheet.absoluteFillObject,
            backgroundColor: "rgba(35,36,58,0.7)",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 1000,
          }}
        >
          <ActivityIndicator size="large" color="#e03487" />
          <Text style={{ color: "#fff", marginTop: 12 }}>Deleting...</Text>
        </View>
      )}
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
