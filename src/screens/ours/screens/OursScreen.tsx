// external
import { useEffect, useState, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { Feather, FontAwesome5 } from "@expo/vector-icons";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useQueryClient } from "@tanstack/react-query";
import NetInfo from "@react-native-community/netinfo";

// internal
import {
  createSpecialDate,
  updateSpecialDate,
  deleteSpecialDate,
} from "../../../services/api/ours/specialDateService";
import {
  getFavoriteMemoryById,
  createFavoriteMemory,
  updateFavoriteMemory,
  deleteFavoriteMemory,
} from "../../../services/api/ours/favoriteMemoriesService";
import { useAuth } from "../../../contexts/AuthContext";
import { useTheme } from "../../../theme/ThemeContext";

// screen content
import UpdateFavoriteMemoryModal from "../../../components/modals/input/UpdateFavoriteMemoryModal";
import FavoriteMemoryDetailsModal from "../../../components/modals/output/FavoriteMemoryDetailsModal";
import ConfirmationModal from "../../../components/modals/selection/ConfirmationModal";
import AlertModal from "../../../components/modals/output/AlertModal";
import NotesCanvas from "../components/NotesCanvas";
import SpecialDates from "../components/SpecialDates";
import FavoriteMemories from "../components/FavoriteMemories";
import UpdateSpecialDateModal from "../../../components/modals/input/UpdateSpecialDateModal";
import Shimmer from "../../../components/skeletons/Shimmer";

// hooks
import useToken from "../../../hooks/useToken";
import { useOurs } from "../../../hooks/useOurs";
import { useOursSelector } from "../../../hooks/useOursSelector";

type Props = NativeStackScreenProps<any>;

const OursScreen = ({ navigation }: Props) => {
  // variables
  const HEADER_HEIGHT = 60;

  // hooks
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const token = useToken();
  const { theme } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);

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
  const [deleting, setDeleting] = useState(false);
  const [editingMemory, setEditingMemory] = useState<any | null>(null);
  const [memoryModalLoading, setMemoryModalLoading] = useState(false);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [addingSpecialDate, setAddingSpecialDate] = useState(false);
  const [updatingSpecialDate, setUpdatingSpecialDate] = useState(false);

  // use states errors
  const [error, setError] = useState<string | null>(null);
  const [showError, setShowError] = useState(false);

  // fetch data
  const {
    data: _oursData,
    refetch: refetchOursData,
    isLoading: oursDataLoading,
  } = useOurs(token, user?.id);

  // select data
  const notesPreview = useOursSelector(user?.id, (ours) => ours?.notes) || null;
  const specialDates =
    useOursSelector(user?.id, (ours) => ours?.specialDates) || [];
  const favoriteMemories =
    useOursSelector(user?.id, (ours) => ours?.recentFavoriteMemories) || [];

  // handlers
  const handleAddSpecialDate = async (
    date: string,
    title: string,
    description?: string
  ) => {
    if (!token) {
      setError("Your session has expired. Log in again and retry.");
      return;
    }

    setAddingSpecialDate(true);
    try {
      await createSpecialDate(token, date, title, description);

      setAlertMessage("You have added " + title + " into your special dates.");
      setAlertTitle("Special Date Added");
      setShowSuccess(true);
      setAddModalVisible(false);
      setSelectedDate(null);

      await queryClient.invalidateQueries({
        queryKey: ["ours", user?.id],
      });
      await queryClient.invalidateQueries({
        queryKey: ["profile", user?.id],
      });
      await queryClient.invalidateQueries({
        queryKey: ["profile", user?.partnerId],
      });
      await queryClient.invalidateQueries({
        queryKey: ["home", user?.id],
      });
    } catch (err: any) {
      setError(
        err.response?.data?.error ||
          "Failed to add " + title + " into your special dates"
      );
      setAddModalVisible(false);
    } finally {
      setAddModalVisible(false);
      setAddingSpecialDate(false);
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
    if (!token) {
      setError("Your session has expired. Log in again and retry.");
      return;
    }
    if (!selectedDate) {
      setError("You have not selected a special date");
      return;
    }

    setUpdatingSpecialDate(true);
    try {
      await updateSpecialDate(token, selectedDate.id, date, title, description);

      if (title === selectedDate.title) {
        setAlertMessage("You have updated " + title + ".");
      } else {
        setAlertMessage(
          "You have updated " + selectedDate.title + " into " + title + "."
        );
      }
      setAlertTitle("Special Date Updated");
      setEditModalVisible(false);
      setSelectedDate(null);
      setShowSuccess(true);

      await queryClient.invalidateQueries({
        queryKey: ["ours", user?.id],
      });
      await queryClient.invalidateQueries({
        queryKey: ["profile", user?.id],
      });
      await queryClient.invalidateQueries({
        queryKey: ["profile", user?.partnerId],
      });
      await queryClient.invalidateQueries({
        queryKey: ["home", user?.id],
      });
    } catch (err: any) {
      setError(
        err.response?.data?.error ||
          "Failed to update " + selectedDate.title + ""
      );
      setEditModalVisible(false);
    } finally {
      setEditModalVisible(false);
      setUpdatingSpecialDate(false);
    }
  };

  const handleDeleteSpecialDate = async () => {
    if (!token) {
      setError("Your session has expired. Log in again and retry.");
      return;
    }
    if (!selectedDate) {
      setError("You have not selected a date");
      return;
    }

    setDeleting(true);
    try {
      await deleteSpecialDate(token, selectedDate.id);

      setDeleteModalVisible(false);
      setSelectedDate(null);
      setAlertMessage(
        "You have deleted " + selectedDate.title + " from special dates."
      );
      setAlertTitle("Special Date Deleted");
      setShowSuccess(true);

      await queryClient.invalidateQueries({
        queryKey: ["ours", user?.id],
      });
      await queryClient.invalidateQueries({
        queryKey: ["profile", user?.id],
      });
      await queryClient.invalidateQueries({
        queryKey: ["profile", user?.partnerId],
      });
      await queryClient.invalidateQueries({
        queryKey: ["home", user?.id],
      });
    } catch (err: any) {
      setError(
        err.response?.data?.error ||
          "Failed to delete " + selectedDate.title + " from special dates"
      );
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
    if (!token) {
      setError("Your session has expired. Log in again and retry.");
      return;
    }

    setMemoryModalLoading(true);
    try {
      await deleteFavoriteMemory(token, memory.id);
      setAlertMessage("You have deleted a favorite memory.");
      setAlertTitle("Memory Deleted");
      setShowSuccess(true);

      await queryClient.invalidateQueries({
        queryKey: ["ours", user?.id],
      });
      await queryClient.invalidateQueries({
        queryKey: ["allFavoriteMemories", user?.id],
      });
    } catch (err: any) {
      setError(err.response?.data?.error || "Failed to delete favorite memory");
    }

    setMemoryModalLoading(false);
  };

  const handleSaveMemory = async (memoryText: string, date: string) => {
    if (!token) {
      setError("Your session has expired. Log in again and retry.");
      return;
    }

    setMemoryModalLoading(true);
    try {
      if (editingMemory) {
        await updateFavoriteMemory(token, editingMemory.id, memoryText, date);

        setAlertMessage("You have updated a favorite memory.");
        setAlertTitle("Memory Updated");
      } else {
        await createFavoriteMemory(token, memoryText, date);
        setAlertMessage("You have added a new favorite memory.");
        setAlertTitle("New Memory Added");
      }

      setMemoryModalVisible(false);
      setShowSuccess(true);

      await queryClient.invalidateQueries({
        queryKey: ["ours", user?.id],
      });
      await queryClient.invalidateQueries({
        queryKey: ["allFavoriteMemories", user?.id],
      });
    } catch (err: any) {
      setError(err.response?.data?.error || "Failed to save favorite memory");
    }

    setMemoryModalLoading(false);
  };

  const handleViewMemoryDetails = async (memoryId: string) => {
    if (!token) {
      setError(
        "Action failed, your session has expired. Log in again and retry."
      );
      return;
    }

    setDetailsLoading(true);
    setDetailsModalVisible(true);
    try {
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
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state) => {
      setIsOnline(!!state.isConnected);
    });
    return () => unsubscribe();
  }, []);

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
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
          <Text style={{ color: theme.colors.text, textAlign: "center" }}>
            You are offline
          </Text>
        </View>
      )}
      <View
        style={{
          backgroundColor: theme.colors.background,
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
            backgroundColor: theme.colors.background,
            borderRadius: 20,
            padding: 8,
            shadowColor: theme.colors.shadow,
            shadowOpacity: 0.1,
            shadowRadius: 4,
          }}
          onPress={() => navigation.navigate("TimelineScreen")}
        >
          <FontAwesome5 name="stream" size={22} color={theme.colors.text} />
        </TouchableOpacity>
        <Text
          style={{
            fontSize: 20,
            color: theme.colors.text,
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
            backgroundColor: theme.colors.background,
            borderRadius: 20,
            padding: 8,
            shadowColor: theme.colors.shadow,
            shadowOpacity: 0.1,
            shadowRadius: 4,
          }}
          onPress={() => navigation.navigate("ChatScreen")}
        >
          <Feather name="message-circle" size={22} color={theme.colors.text} />
        </TouchableOpacity>
      </View>
      <ScrollView
        contentContainerStyle={[styles.container, { paddingTop: insets.top }]}
        showsVerticalScrollIndicator={false}
      >
        {oursDataLoading ? (
          <Shimmer radius={8} height={70} style={{ width: "100%", marginBottom: 32 }} />
        ) : (
          <NotesCanvas
            preview={notesPreview?.content}
            updatedAt={notesPreview?.updatedAt}
            onView={() => navigation.navigate("NotesScreen")}
          />
        )}

        {oursDataLoading ? (
          <Shimmer radius={8} height={150} style={{ width: "100%", marginBottom: 32 }} />
        ) : (
          <SpecialDates
            dates={specialDates}
            onAdd={() => setAddModalVisible(true)}
            onLongPressDate={handleLongPressDate}
          />
        )}

        {oursDataLoading ? (
          <Shimmer radius={8} height={150} style={{ width: "100%", marginBottom: 32 }} />
        ) : (
          <FavoriteMemories
            memories={favoriteMemories}
            currentUserId={user?.id}
            onViewAll={() => navigation.navigate("AllFavoriteMemoriesScreen")}
            onViewDetails={handleViewMemoryDetails}
            onAdd={handleAddMemory}
            onEdit={handleEditMemory}
            onDelete={handleDeleteMemory}
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
        loading={addingSpecialDate}
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
        loading={updatingSpecialDate}
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
    </View>
  );
};

const createStyles = (theme: ReturnType<typeof useTheme>["theme"]) =>
  StyleSheet.create({
    container: {
      paddingHorizontal: 16,
      paddingBottom: 32,
      alignItems: "stretch",
      backgroundColor: theme.colors.background,
      minHeight: "100%",
    },
    toast: {
      position: "absolute",
      bottom: 10,
      left: 20,
      right: 20,
      backgroundColor: theme.colors.primary,
      padding: 14,
      borderRadius: 10,
      alignItems: "center",
      zIndex: 100,
      shadowColor: theme.colors.shadow,
      shadowOpacity: 0.2,
      shadowRadius: 8,
      elevation: 8,
    },
    toastText: {
      color: theme.colors.text,
      fontWeight: "bold",
      fontSize: 16,
    },
  });

export default OursScreen;
