import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import NotesCanvas from "./NotesCanvas";
import SpecialDates from "./SpecialDates";
import FavoriteMemories from "./FavoriteMemories";
import { getNotes } from "../../services/notesService";
import AsyncStorage from "@react-native-async-storage/async-storage";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import UpdateSpecialDateModal from "../../components/modals/UpdateSpecialDateModal";
import {
  getSpecialDates,
  createSpecialDate,
  updateSpecialDate,
  deleteSpecialDate,
} from "../../services/specialDateService";
import ConfirmationModal from "../../components/modals/ConfirmationModal";
import AlertModal from "../../components/modals/AlertModal";

type Props = NativeStackScreenProps<any>;

const favoriteMemories = [
  {
    id: "1",
    text: "That time we got lost in the city and ended up finding the most amazing little café. We spent hours talking and laughing, completely forgetting about time. The owner even gave us free dessert because he said we reminded him of when he first met his wife.",
  },
  {
    id: "2",
    text: "The rainy day when we stayed in bed all day watching movies and ordering takeout. You fell asleep on my shoulder and I didn't want to move for hours, just listening to you breathe.",
  },
  {
    id: "3",
    text: "Our first road trip together - we drove for hours with no destination, just exploring and stopping wherever looked interesting. We found that beautiful lake and spent the sunset there, it was perfect.",
  },
  {
    id: "4",
    text: "The night we cooked dinner together and everything went wrong - the pasta was overcooked, the sauce was too spicy, but we laughed so much and ended up ordering pizza. It was still one of the best nights ever.",
  },
];

const OursScreen = ({ navigation }: Props) => {
  const insets = useSafeAreaInsets();
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

  const fetchNotesPreview = async () => {
    try {
      const token = await AsyncStorage.getItem("token");
      if (!token) return;
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

  const handleAddSpecialDate = async (
    date: string,
    title: string,
    description?: string
  ) => {
    const token = await AsyncStorage.getItem("token");

    if (!token) {
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
    if (!selectedDate) return;
    const token = await AsyncStorage.getItem("token");
    if (!token) return;
    await updateSpecialDate(token, selectedDate.id, date, title, description);
    setEditModalVisible(false);
    setSelectedDate(null);
    setAlertMessage("Special date updated");
    setAlertVisible(true);
    await fetchSpecialDates();
  };

  const handleDeleteSpecialDate = async () => {
    if (!selectedDate) return;
    setDeleting(true);
    const token = await AsyncStorage.getItem("token");
    if (!token) return;
    await deleteSpecialDate(token, selectedDate.id);
    setDeleting(false);
    setDeleteModalVisible(false);
    setSelectedDate(null);
    setAlertMessage("Special date deleted");
    setAlertVisible(true);
    await fetchSpecialDates();
  };

  useEffect(() => {
    fetchNotesPreview();
    fetchSpecialDates();
  }, []);

  {
    deleting && (
      <View style={styles.loadingOverlay}>
        <ActivityIndicator size="large" color="#e03487" />
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: "#23243a" }}>
      <ScrollView
        contentContainerStyle={[styles.container, { paddingTop: insets.top }]}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.headerTitle}>Ours</Text>
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
        <FavoriteMemories memories={favoriteMemories} onViewAll={() => {}} />
      </ScrollView>

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
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 32,
    alignItems: "stretch",
    backgroundColor: "#23243a",
    minHeight: "100%",
  },
  headerTitle: {
    fontSize: 20,
    color: "#fff",
    paddingTop: 20,
    letterSpacing: 0,
    alignSelf: "center",
    marginBottom: 26,
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(35,36,58,0.7)",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 16,
  },
});

export default OursScreen;
