// external
import { useState, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
} from "react-native";
import { useQueryClient } from "@tanstack/react-query";
import { useSafeAreaInsets } from "react-native-safe-area-context";

// internal (hooks)
import { useAuth } from "../../../contexts/AuthContext";
import useToken from "../../../hooks/useToken";
import { useMemories } from "../../../hooks/useMemories";
import { useTheme } from "../../../theme/ThemeContext";

// internal
import {
  getFavoriteMemoryById,
  deleteFavoriteMemory,
  updateFavoriteMemory,
} from "../../../services/api/ours/favoriteMemoriesService";
import { formatDateDMY } from "../../../utils/formatters/formatDate";
import { Memory } from "../../../types/Memory";

// modals
import FavoriteMemoryDetailsModal from "../../../components/modals/output/FavoriteMemoryDetailsModal";
import ConfirmationModal from "../../../components/modals/selection/ConfirmationModal";
import UpdateFavoriteMemoryModal from "../../../components/modals/input/UpdateFavoriteMemoryModal";
import AlertModal from "../../../components/modals/output/AlertModal";

// content
import Shimmer from "../../../components/skeletons/Shimmer";

const AllFavoriteMemoriesScreen = () => {
  // hooks
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const token = useToken();
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const styles = useMemo(() => createStyles(theme), [theme]);

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

  // data
  const {
    data: memories = [],
    refetch: refetchMemories,
    isLoading: memoriesLoading,
    error,
  } = useMemories(user?.id, token);

  // handlers
  const handleViewMemoryDetails = async (memoryId: string) => {
    if (!token) {
      setAlertTitle("Couldn't view memory");
      setAlertMessage(
        "It appears that your session has expired. " +
          " You need to log out and log in again to continue."
      );
      setShowError(true);
      return;
    }

    setDetailsLoading(true);
    setDetailsModalVisible(true);
    try {
      const memory = await getFavoriteMemoryById(token, memoryId);
      setDetailsMemory(memory);
    } catch (err) {
      setDetailsMemory(null);
    }
    setDetailsLoading(false);
  };

  const handleLongPress = (item: Memory) => {
    if (item.userId === user?.id) {
      setSelectedMemory(item);
      setActionModalVisible(true);
    }
  };

  const handleAction = (action: "edit" | "delete") => {
    if (!selectedMemory) {
      return;
    }
    setActionModalVisible(false);

    if (action === "edit") {
      setEditingMemory(selectedMemory);
      setEditModalVisible(true);
    } else if (action === "delete") {
      handleDeleteMemory(selectedMemory);
    }
  };

  const handleDeleteMemory = async (memory: Memory) => {
    if (!token) {
      setAlertTitle("Couldn't delete memory");
      setAlertMessage(
        "It appears that your session has expired. " +
          " You need to log out and log in again to continue."
      );
      setShowError(true);
      return;
    }

    setEditLoading(true);
    setActionModalVisible(false);
    try {
      await deleteFavoriteMemory(token, memory.id);

      await queryClient.invalidateQueries({
        queryKey: ["allFavoriteMemories", user?.id],
      });

      await queryClient.invalidateQueries({
        queryKey: ["ours", user?.id],
      });

      setAlertTitle("Memory Deleted");
      setAlertMessage(
        "You have deleted that memory from your favorite memories."
      );
      setShowSuccess(true);
    } catch (err) {
      setAlertTitle("Failed");
      setAlertMessage("Failed to delete favorite memory.");
      setShowError(true);
    }

    setEditLoading(false);
    setSelectedMemory(null);
  };

  const handleSaveEditMemory = async (memoryText: string, date: string) => {
    if (!token) {
      setAlertTitle("Couldn't edit memory");
      setAlertMessage(
        "It appears that your session has expired. " +
          " You need to log out and log in again to continue."
      );
      setShowError(true);
      return;
    }

    if (!editingMemory) {
      return;
    }

    setEditLoading(true);
    try {
      await updateFavoriteMemory(token, editingMemory.id, memoryText, date);

      setEditModalVisible(false);
      setEditingMemory(null);

      await queryClient.invalidateQueries({
        queryKey: ["allFavoriteMemories", user?.id],
      });

      await queryClient.invalidateQueries({
        queryKey: ["ours", user?.id],
      });

      setAlertTitle("Memory Updated");
      setAlertMessage("You have made some changes in that favorite memory.");
      setShowSuccess(true);
    } catch (err: any) {
      setAlertTitle("Failed");
      setAlertMessage(
        err.response?.data?.error || "Failed to update favorite memory."
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

  if (memoriesLoading) {
    <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <ScrollView
        contentContainerStyle={{
          paddingTop: insets.top,
          backgroundColor: theme.colors.background,
          paddingHorizontal: 16,
        }}
        showsVerticalScrollIndicator={false}
      >
        <Text
          style={{
            color: theme.colors.text,
            textAlign: "center",
            marginTop: 10,
            fontSize: 16,
            fontWeight: "bold",
            marginBottom: 15,
          }}
        >
          These are all your favorite memories
        </Text>
        <Shimmer
          radius={8}
          height={40}
          style={{ width: "100%", marginTop: 10 }}
        />
        <View style={{ height: 12 }} />
        <Shimmer radius={8} height={40} style={{ width: "100%" }} />
        <View style={{ height: 12 }} />
        <Shimmer radius={8} height={40} style={{ width: "100%" }} />
        <View style={{ height: 12 }} />
        <Shimmer radius={8} height={40} style={{ width: "100%" }} />
        <View style={{ height: 12 }} />
        <Shimmer radius={8} height={40} style={{ width: "100%" }} />
        <View style={{ height: 12 }} />
        <Shimmer radius={8} height={40} style={{ width: "100%" }} />
        <View style={{ height: 12 }} />
        <Shimmer radius={8} height={40} style={{ width: "100%" }} />
        <View style={{ height: 12 }} />
        <Shimmer
          radius={8}
          height={40}
          style={{ width: "100%", marginBottom: 20 }}
        />
      </ScrollView>
    </View>;
  }

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <Text
        style={{
          color: theme.colors.text,
          textAlign: "center",
          marginTop: 10,
          fontSize: 16,
          fontWeight: "bold",
          marginBottom: 15,
        }}
      >
        These are all your favorite memories
      </Text>
      {error ? (
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
              tintColor={theme.colors.primary}
              colors={[theme.colors.primary]}
              progressBackgroundColor={theme.colors.background}
            />
          }
          ListEmptyComponent={
            <Text
              style={{
                color: theme.colors.muted,
                textAlign: "center",
                marginTop: 40,
              }}
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
            backgroundColor: theme.colors.absoluteFillObject,
            justifyContent: "center",
            alignItems: "center",
            zIndex: 1000,
          }}
        >
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={{ color: theme.colors.text, marginTop: 12 }}>
            Deleting...
          </Text>
        </View>
      )}
    </View>
  );
};

const createStyles = (theme: ReturnType<typeof useTheme>["theme"]) =>
  StyleSheet.create({
    memoryItem: {
      backgroundColor: theme.colors.surfaceAlt,
      borderRadius: 12,
      padding: 16,
      marginBottom: 10,
    },
    memoryText: {
      color: theme.colors.text,
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
      color: theme.colors.muted,
      fontSize: 12,
    },
    separator: {
      height: 1,
      backgroundColor: theme.colors.mutedAlt,
      opacity: 0.5,
      marginVertical: 8,
    },
  });

export default AllFavoriteMemoriesScreen;
