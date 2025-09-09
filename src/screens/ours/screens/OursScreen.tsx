// external
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { Feather, FontAwesome5 } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import NetInfo from "@react-native-community/netinfo";

// internal
import { getNotes } from "../../../services/api/ours/notesService";
import {
  getSpecialDates,
  createSpecialDate,
  updateSpecialDate,
  deleteSpecialDate,
} from "../../../services/api/ours/specialDateService";
import {
  getFavoriteMemoryById,
  createFavoriteMemory,
  updateFavoriteMemory,
  deleteFavoriteMemory,
  getRecentFavoriteMemories,
} from "../../../services/api/ours/favoriteMemoriesService";
import { useAuth } from "../../../contexts/AuthContext";

// screen content
import UpdateFavoriteMemoryModal from "../../../components/modals/input/UpdateFavoriteMemoryModal";
import FavoriteMemoryDetailsModal from "../../../components/modals/output/FavoriteMemoryDetailsModal";
import ConfirmationModal from "../../../components/modals/selection/ConfirmationModal";
import AlertModal from "../../../components/modals/output/AlertModal";
import NotesCanvas from "../components/NotesCanvas";
import SpecialDates from "../components/SpecialDates";
import FavoriteMemories from "../components/FavoriteMemories";
import UpdateSpecialDateModal from "../../../components/modals/input/UpdateSpecialDateModal";

type Props = NativeStackScreenProps<any>;

const OursScreen = ({ navigation }: Props) => {
  // variables
  const HEADER_HEIGHT = 60;
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const currentUserId = user?.id;
  const queryClient = useQueryClient();

  // use states
  const [selectedDate, setSelectedDate] = useState<any | null>(null);
  const [detailsMemory, setDetailsMemory] = useState<any>(null);
  const [isOnline, setIsOnline] = useState(true);

  // use states (modals)
  const [addModalVisible, setAddModalVisible] = useState(false);
  const [actionModalVisible, setActionModalVisible] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");
  const [memoryModalVisible, setMemoryModalVisible] = useState(false);
  const [detailsModalVisible, setDetailsModalVisible] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [alertTitle, setAlertTitle] = useState("");

  // use states (processing)
  const [refreshing, setRefreshing] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [editingMemory, setEditingMemory] = useState<any | null>(null);
  const [memoryModalLoading, setMemoryModalLoading] = useState(false);
  const [detailsLoading, setDetailsLoading] = useState(false);

  // use states errors
  const [error, setError] = useState<string | null>(null);
  const [showError, setShowError] = useState(false);

  // fetch functions
  const {
    data: notesPreview,
    isLoading: notesPreviewLoading,
    refetch: refetchNotesPreview,
  } = useQuery({
    queryKey: ["notesPreview", currentUserId],
    queryFn: async () => {
      const token = await AsyncStorage.getItem("token");

      if (!token) {
        setError("Session expired, please log in again");
        return;
      }

      return await getNotes(token);
    },
    staleTime: 1000 * 60 * 5,
  });

  const {
    data: specialDates = [],
    isLoading: specialDatesLoading,
    refetch: refetchSpecialDates,
  } = useQuery({
    queryKey: ["specialDates", user?.id],
    queryFn: async () => {
      const token = await AsyncStorage.getItem("token");

      if (!token) {
        setError("Session expired, please log in again");
        return [];
      }

      return await getSpecialDates(token);
    },
    staleTime: 1000 * 60 * 60,
  });

  const {
    data: recentMemories = [],
    isLoading: recentMemoriesLoading,
    refetch: refetchRecentMemories,
  } = useQuery({
    queryKey: ["recentFavoriteMemories", user?.id],
    queryFn: async () => {
      const token = await AsyncStorage.getItem("token");

      if (!token) {
        setError("Session expired, please log in again");
        return [];
      }

      return await getRecentFavoriteMemories(token);
    },
    staleTime: 1000 * 60 * 60,
  });

  // handlers
  const handleAddSpecialDate = async (
    date: string,
    title: string,
    description?: string
  ) => {
    try {
      const token = await AsyncStorage.getItem("token");

      if (!token) {
        setError("Session expired, please log in again");
        return;
      }

      await createSpecialDate(token, date, title, description);

      setAlertMessage("Special date created");
      setAlertTitle("Created");
      setShowSuccess(true);
      setAddModalVisible(false);
      setSelectedDate(null);

      await queryClient.invalidateQueries({
        queryKey: ["specialDates", user?.id],
      });

      await queryClient.invalidateQueries({
        queryKey: ["upcomingSpecialDate", user?.id],
      });

      await queryClient.invalidateQueries({
        queryKey: ["aiContext", currentUserId],
      });

      await queryClient.invalidateQueries({
        queryKey: ["recentActivities", user?.id],
      });
    } catch (err: any) {
      setError(err.response?.data?.error || "Failed to add special date");
      setAddModalVisible(false);
    } finally {
      setAddModalVisible(false);
    }
  };

  const handleLongPressDate = (date: any) => {
    setSelectedDate(date);
    setActionModalVisible(true);
  };

  const handleActionChoice = (action: "edit" | "delete") => {
    setActionModalVisible(false);
    if (action === "edit") {
      setEditModalVisible(true);
    } else if (action === "delete") {
      setDeleteModalVisible(true);
    }
  };

  const handleUpdateSpecialDate = async (
    date: string,
    title: string,
    description?: string
  ) => {
    if (!selectedDate) {
      return;
    }

    try {
      const token = await AsyncStorage.getItem("token");

      if (!token) {
        setError("Session expired, please log in again");
        return;
      }

      await updateSpecialDate(token, selectedDate.id, date, title, description);

      setAlertMessage("Special date updated");
      setAlertTitle("Updated");
      setEditModalVisible(false);
      setSelectedDate(null);
      setShowSuccess(true);

      await queryClient.invalidateQueries({
        queryKey: ["specialDates", user?.id],
      });

      await queryClient.invalidateQueries({
        queryKey: ["upcomingSpecialDate", user?.id],
      });

      await queryClient.invalidateQueries({
        queryKey: ["aiContext", currentUserId],
      });

      await queryClient.invalidateQueries({
        queryKey: ["recentActivities", user?.id],
      });
    } catch (err: any) {
      setError(err.response?.data?.error || "Failed to update special date");
      setEditModalVisible(false);
    } finally {
      setEditModalVisible(false);
    }
  };

  const handleDeleteSpecialDate = async () => {
    if (!selectedDate) {
      return;
    }

    setDeleting(true);

    try {
      const token = await AsyncStorage.getItem("token");

      if (!token) {
        setError("Session expired, please log in again");
        return;
      }

      await deleteSpecialDate(token, selectedDate.id);

      setDeleteModalVisible(false);
      setSelectedDate(null);
      setAlertMessage("Special date deleted");
      setAlertTitle("Deleted");
      setShowSuccess(true);

      await queryClient.invalidateQueries({
        queryKey: ["specialDates", user?.id],
      });

      await queryClient.invalidateQueries({
        queryKey: ["upcomingSpecialDate", user?.id],
      });

      await queryClient.invalidateQueries({
        queryKey: ["aiContext", currentUserId],
      });

      await queryClient.invalidateQueries({
        queryKey: ["recentActivities", user?.id],
      });
    } catch (err: any) {
      setError(err.response?.data?.error || "Failed to delete special date");
    } finally {
      setDeleting(false);
      setDeleteModalVisible(false);
    }
  };

  const handleAddMemory = () => {
    setEditingMemory(null);
    setMemoryModalVisible(true);
  };

  const handleEditMemory = (memory: any) => {
    setEditingMemory(memory);
    setMemoryModalVisible(true);
  };

  const handleDeleteMemory = async (memory: any) => {
    setMemoryModalLoading(true);

    try {
      const token = await AsyncStorage.getItem("token");

      if (!token) {
        setError("Session expired, please log in again");
        return;
      }

      await deleteFavoriteMemory(token, memory.id);
      setAlertMessage("Favorite memory deleted");
      setAlertTitle("Deleted");
      setShowSuccess(true);

      await queryClient.invalidateQueries({
        queryKey: ["recentFavoriteMemories", user?.id],
      });

      await queryClient.invalidateQueries({
        queryKey: ["allFavoriteMemories", user?.id],
      });

      await queryClient.invalidateQueries({
        queryKey: ["aiContext", currentUserId],
      });

      await queryClient.invalidateQueries({
        queryKey: ["recentActivities", user?.id],
      });
    } catch (err: any) {
      setError(err.response?.data?.error || "Failed to delete favorite memory");
    }

    setMemoryModalLoading(false);
  };

  const handleSaveMemory = async (memoryText: string, date: string) => {
    setMemoryModalLoading(true);

    try {
      const token = await AsyncStorage.getItem("token");

      if (!token) {
        setError("Session expired, please log in again");
        setMemoryModalLoading(false);

        return;
      }

      if (editingMemory) {
        await updateFavoriteMemory(token, editingMemory.id, memoryText, date);

        setAlertMessage("Favorite memory updated");
        setAlertTitle("Updated");
      } else {
        await createFavoriteMemory(token, memoryText, date);
        setAlertMessage("Favorite memory added");
        setAlertTitle("Added");
      }

      setMemoryModalVisible(false);
      setShowSuccess(true);

      await queryClient.invalidateQueries({
        queryKey: ["recentFavoriteMemories", user?.id],
      });

      await queryClient.invalidateQueries({
        queryKey: ["recentActivities", user?.id],
      });

      await queryClient.invalidateQueries({
        queryKey: ["allFavoriteMemories", user?.id],
      });

      await queryClient.invalidateQueries({
        queryKey: ["aiContext", currentUserId],
      });
    } catch (err: any) {
      setError(err.response?.data?.error || "Failed to save favorite memory");
    }

    setMemoryModalLoading(false);
  };

  const handleViewMemoryDetails = async (memoryId: string) => {
    setDetailsLoading(true);
    setDetailsModalVisible(true);
    try {
      const token = await AsyncStorage.getItem("token");

      if (!token) {
        setError("Session expired, please log in again");
        return;
      }

      const memory = await getFavoriteMemoryById(token, memoryId);
      setDetailsMemory(memory);
    } catch (err: any) {
      setError(err.response?.data?.error || "Failed to view favorite memory");
      setDetailsMemory(null);
    }
    setDetailsLoading(false);
  };

  // use effects
  useEffect(() => {
    if (error) {
      setShowError(true);
      const timer = setTimeout(() => {
        setShowError(false);
        setError(null);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state) => {
      setIsOnline(!!state.isConnected);
    });
    return () => unsubscribe();
  }, []);

  // refresh screen
  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.all([
      refetchNotesPreview(),
      refetchSpecialDates(),
      refetchRecentMemories(),
    ]);
    setRefreshing(false);
  };

  {
    deleting && (
      <View style={styles.loadingOverlay}>
        <ActivityIndicator size="large" color="#e03487" />
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: "#23243a" }}>
      {!isOnline && (
        <View
          style={{
            backgroundColor: "red",
            position: "absolute",
            top: insets.top,
            left: 0,
            right: 0,
            zIndex: 10,
            paddingVertical: 2,
          }}
        >
          <Text style={{ color: "white", textAlign: "center" }}>
            You are offline
          </Text>
        </View>
      )}
      <View
        style={{
          backgroundColor: "#23243a",
          paddingTop: insets.top,
          height: HEADER_HEIGHT + insets.top,
          justifyContent: "center",
          alignItems: "center",
          position: "relative",
          zIndex: 2,
        }}
      >
        <TouchableOpacity
          style={{
            position: "absolute",
            top: insets.top + (HEADER_HEIGHT - 36) / 2,
            left: 18,
            zIndex: 10,
            backgroundColor: "#23243a",
            borderRadius: 20,
            padding: 8,
            shadowColor: "#000",
            shadowOpacity: 0.1,
            shadowRadius: 4,
          }}
          onPress={() => navigation.navigate("TimelineScreen")}
        >
          <FontAwesome5 name="stream" size={22} color="#fff" />
        </TouchableOpacity>
        <Text
          style={{
            fontSize: 20,
            color: "#fff",
            letterSpacing: 0,
          }}
        >
          Ours
        </Text>
        <TouchableOpacity
          style={{
            position: "absolute",
            top: insets.top + (HEADER_HEIGHT - 36) / 2,
            right: 18,
            zIndex: 10,
            backgroundColor: "#23243a",
            borderRadius: 20,
            padding: 8,
            shadowColor: "#000",
            shadowOpacity: 0.1,
            shadowRadius: 4,
          }}
          onPress={() => navigation.navigate("ChatScreen")}
        >
          <Feather name="message-circle" size={22} color="#fff" />
        </TouchableOpacity>
      </View>
      <ScrollView
        contentContainerStyle={[styles.container, { paddingTop: insets.top }]}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#e03487"
            colors={["#e03487"]}
            progressBackgroundColor="#23243a"
          />
        }
      >
        <NotesCanvas
          preview={notesPreview?.content}
          updatedAt={notesPreview?.updatedAt}
          onView={() => navigation.navigate("NotesScreen")}
        />

        <SpecialDates
          dates={specialDates}
          onAdd={() => setAddModalVisible(true)}
          onLongPressDate={handleLongPressDate}
        />

        <FavoriteMemories
          memories={recentMemories}
          currentUserId={currentUserId}
          onViewAll={() => navigation.navigate("AllFavoriteMemoriesScreen")}
          onViewDetails={handleViewMemoryDetails}
          onAdd={handleAddMemory}
          onEdit={handleEditMemory}
          onDelete={handleDeleteMemory}
        />
      </ScrollView>

      <UpdateFavoriteMemoryModal
        visible={memoryModalVisible}
        onClose={() => setMemoryModalVisible(false)}
        onSave={handleSaveMemory}
        initialMemory={editingMemory?.memory}
        initialDate={editingMemory?.date}
        isEditing={!!editingMemory}
        loading={memoryModalLoading}
      />

      <UpdateSpecialDateModal
        visible={addModalVisible}
        onClose={() => setAddModalVisible(false)}
        onSave={handleAddSpecialDate}
        isEditing={false}
      />

      <ConfirmationModal
        visible={deleteModalVisible}
        message="Are you sure you want to delete this special date?"
        confirmText="Delete"
        cancelText="Cancel"
        onConfirm={handleDeleteSpecialDate}
        onCancel={() => setDeleteModalVisible(false)}
        loading={deleting}
        onClose={() => setActionModalVisible(false)}
      />

      <ConfirmationModal
        visible={actionModalVisible}
        message="What would you like to do with this special date?"
        confirmText="Edit"
        cancelText="Delete"
        onConfirm={() => handleActionChoice("edit")}
        onCancel={() => handleActionChoice("delete")}
        onClose={() => setActionModalVisible(false)}
      />

      <UpdateSpecialDateModal
        visible={editModalVisible}
        onClose={() => setEditModalVisible(false)}
        onSave={handleUpdateSpecialDate}
        initialDate={selectedDate?.date}
        initialTitle={selectedDate?.title}
        initialDescription={selectedDate?.description}
        isEditing={true}
      />

      <AlertModal
        visible={showSuccess}
        type="success"
        title={alertTitle}
        message={alertMessage}
        buttonText="Great"
        onClose={() => setShowSuccess(false)}
      />

      <FavoriteMemoryDetailsModal
        visible={detailsModalVisible}
        onClose={() => setDetailsModalVisible(false)}
        memory={detailsMemory}
        loading={detailsLoading}
      />

      {showError && error && (
        <View style={styles.toast}>
          <Text style={styles.toastText}>{error}</Text>
        </View>
      )}

      {memoryModalLoading && !memoryModalVisible && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#e03487" />
          <Text style={{ color: "#fff", marginTop: 12 }}>Deleting...</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingBottom: 32,
    alignItems: "stretch",
    backgroundColor: "#23243a",
    minHeight: "100%",
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(35,36,58,0.7)",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 16,
  },
  toast: {
    position: "absolute",
    bottom: 10,
    left: 20,
    right: 20,
    backgroundColor: "#e03487",
    padding: 14,
    borderRadius: 10,
    alignItems: "center",
    zIndex: 100,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
  },
  toastText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
});

export default OursScreen;
