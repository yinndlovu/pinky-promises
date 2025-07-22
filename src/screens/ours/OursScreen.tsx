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
import { Feather } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useSafeAreaInsets } from "react-native-safe-area-context";

// internal
import { getNotes } from "../../services/notesService";
import {
  getSpecialDates,
  createSpecialDate,
  updateSpecialDate,
  deleteSpecialDate,
} from "../../services/specialDateService";
import {
  getFavoriteMemoryById,
  getAllFavoriteMemories,
  createFavoriteMemory,
  updateFavoriteMemory,
  deleteFavoriteMemory,
} from "../../services/favoriteMemoriesService";
import { useAuth } from "../../contexts/AuthContext";

// screen content
import UpdateFavoriteMemoryModal from "../../components/modals/UpdateFavoriteMemoryModal";
import FavoriteMemoryDetailsModal from "../../components/modals/FavoriteMemoryDetailsModal";
import ConfirmationModal from "../../components/modals/ConfirmationModal";
import AlertModal from "../../components/modals/AlertModal";
import NotesCanvas from "./NotesCanvas";
import SpecialDates from "./SpecialDates";
import FavoriteMemories from "./FavoriteMemories";
import UpdateSpecialDateModal from "../../components/modals/UpdateSpecialDateModal";

type Props = NativeStackScreenProps<any>;

const OursScreen = ({ navigation }: Props) => {
  // variables
  const HEADER_HEIGHT = 60;
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const currentUserId = user?.id;

  // use states
  const [notesPreview, setNotesPreview] = useState<string>("");
  const [notesUpdatedAt, setNotesUpdatedAt] = useState<string | null>(null);
  const [specialDates, setSpecialDates] = useState<any[]>([]);
  const [addModalVisible, setAddModalVisible] = useState(false);
  const [loadingDates, setLoadingDates] = useState(false);
  const [selectedDate, setSelectedDate] = useState<any | null>(null);
  const [actionModalVisible, setActionModalVisible] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");
  const [deleting, setDeleting] = useState(false);
  const [memories, setMemories] = useState<any[]>([]);
  const [showAllMemories, setShowAllMemories] = useState(false);
  const [memoriesLoading, setMemoriesLoading] = useState(false);
  const [memoryModalVisible, setMemoryModalVisible] = useState(false);
  const [editingMemory, setEditingMemory] = useState<any | null>(null);
  const [memoryModalLoading, setMemoryModalLoading] = useState(false);
  const [detailsModalVisible, setDetailsModalVisible] = useState(false);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [detailsMemory, setDetailsMemory] = useState<any>(null);
  const [refreshing, setRefreshing] = useState(false);

  // use states errors
  const [error, setError] = useState<string | null>(null);
  const [showError, setShowError] = useState(false);

  // refresh screen
  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.all([
      fetchNotesPreview(),
      fetchSpecialDates(),
      fetchMemories(showAllMemories),
    ]);
    setRefreshing(false);
  };

  // fetch functions
  const fetchNotesPreview = async () => {
    try {
      const token = await AsyncStorage.getItem("token");

      if (!token) {
        setError("Session expired, please log in again");
        return;
      }

      const notes = await getNotes(token);

      setNotesPreview(notes.content || "");
      setNotesUpdatedAt(notes.updatedAt || null);
    } catch {
      setNotesPreview("");
      setNotesUpdatedAt(null);
    }
  };

  const fetchSpecialDates = async () => {
    setLoadingDates(true);
    try {
      const token = await AsyncStorage.getItem("token");

      if (!token) {
        setError("Session expired, please log in again");
        return;
      }

      const dates = await getSpecialDates(token);
      setSpecialDates(dates);
    } catch {
      setSpecialDates([]);
    } finally {
      setLoadingDates(false);
    }
  };

  const fetchMemories = async (all = false) => {
    setMemoriesLoading(true);
    try {
      const token = await AsyncStorage.getItem("token");

      if (!token) {
        setError("Session expired, please log in again");
        return;
      }

      const data = await getAllFavoriteMemories(token);
      setMemories(data || []);
    } catch {
      setMemories([]);
    } finally {
      setMemoriesLoading(false);
    }
  };

  // handlers
  const handleAddSpecialDate = async (
    date: string,
    title: string,
    description?: string
  ) => {
    const token = await AsyncStorage.getItem("token");

    if (!token) {
      setError("Session expired, please log in again");
      return;
    }

    await createSpecialDate(token, date, title, description);
    await fetchSpecialDates();
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

    const token = await AsyncStorage.getItem("token");

    if (!token) {
      setError("Session expired, please log in again");
      return;
    }

    await updateSpecialDate(token, selectedDate.id, date, title, description);

    setAlertMessage("Special date updated");
    setEditModalVisible(false);
    setSelectedDate(null);
    setAlertVisible(true);

    await fetchSpecialDates();
  };

  const handleDeleteSpecialDate = async () => {
    if (!selectedDate) {
      return;
    }

    setDeleting(true);

    const token = await AsyncStorage.getItem("token");

    if (!token) {
      setError("Session expired, please log in again");
      return;
    }

    await deleteSpecialDate(token, selectedDate.id);

    setDeleting(false);
    setDeleteModalVisible(false);
    setSelectedDate(null);
    setAlertMessage("Special date deleted");
    setAlertVisible(true);

    await fetchSpecialDates();
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
      await fetchMemories(showAllMemories);
    } catch {}

    setMemoryModalLoading(false);
  };

  const handleSaveMemory = async (memoryText: string, date: string) => {
    setMemoryModalLoading(true);

    try {
      const token = await AsyncStorage.getItem("token");

      if (!token) {
        setAlertMessage("Session expired, please log in again");
        setAlertVisible(true);
        setMemoryModalLoading(false);

        return;
      }

      if (editingMemory) {
        await updateFavoriteMemory(token, editingMemory.id, memoryText, date);

        setAlertMessage("Favorite memory updated");
      } else {
        await createFavoriteMemory(token, memoryText, date);
        setAlertMessage("Favorite memory added");
      }

      setMemoryModalVisible(false);
      setAlertVisible(true);

      await fetchMemories(showAllMemories);
    } catch (err) {
      setAlertMessage("Failed to save memory.");
      setAlertVisible(true);
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
    } catch (e) {
      setDetailsMemory(null);
    }
    setDetailsLoading(false);
  };

  // use effects
  useEffect(() => {
    fetchNotesPreview();
    fetchSpecialDates();
  }, []);

  useEffect(() => {
    fetchMemories(showAllMemories);
  }, [showAllMemories]);

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

  {
    deleting && (
      <View style={styles.loadingOverlay}>
        <ActivityIndicator size="large" color="#e03487" />
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: "#23243a" }}>
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
          preview={notesPreview}
          updatedAt={notesUpdatedAt}
          onView={() => navigation.navigate("NotesScreen")}
        />
        <SpecialDates
          dates={specialDates}
          onAdd={() => setAddModalVisible(true)}
          onLongPressDate={handleLongPressDate}
        />
        {memoriesLoading ? (
          <ActivityIndicator
            size="large"
            color="#e03487"
            style={{ marginVertical: 24 }}
          />
        ) : (
          <FavoriteMemories
            memories={memories}
            currentUserId={currentUserId}
            onViewAll={() => setShowAllMemories(true)}
            onViewDetails={handleViewMemoryDetails}
            onAdd={handleAddMemory}
            onEdit={handleEditMemory}
            onDelete={handleDeleteMemory}
            showAll={showAllMemories}
          />
        )}
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
        visible={alertVisible}
        message={alertMessage}
        onClose={() => setAlertVisible(false)}
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
    top: 50,
    // bottom: 40,
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
