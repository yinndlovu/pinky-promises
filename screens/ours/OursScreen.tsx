import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, ScrollView } from "react-native";
import NotesCanvas from "./NotesCanvas";
import SpecialDates from "./SpecialDates";
import FavoriteMemories from "./FavoriteMemories";
import { getNotes } from "../../services/notesService";
import AsyncStorage from "@react-native-async-storage/async-storage";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type Props = NativeStackScreenProps<any>;

const specialDates = [
  { id: "1", label: "Our anniversary", date: "22 September 2024" },
  { id: "2", label: "Her birthday", date: "Not added yet" },
  { id: "3", label: "Not added yet", date: "-" },
  { id: "4", label: "Not added yet", date: "-" },
];

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

  useEffect(() => {
    fetchNotesPreview();
  }, []);

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
        <SpecialDates dates={specialDates} onViewAll={() => {}} />
        <FavoriteMemories memories={favoriteMemories} onViewAll={() => {}} />
      </ScrollView>
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
});

export default OursScreen;
