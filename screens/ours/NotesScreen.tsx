import React, { useEffect, useState, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { getNotes, updateNotes } from "../../services/notesService";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";

const AUTO_SAVE_DELAY = 1000;

const NotesScreen: React.FC = () => {
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const saveTimeout = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const fetchNotes = async () => {
      setLoading(true);
      setError(null);
      try {
        const token = await AsyncStorage.getItem("token");

        if (!token) {
          throw new Error("No token found");
        }

        const notes = await getNotes(token);
        setContent(notes.content || "");
      } catch (err: any) {
        setError(err.message || "Failed to load notes");
      } finally {
        setLoading(false);
      }
    };
    fetchNotes();
  }, []);

  // auto saving notes
  useEffect(() => {
    if (loading) {
      return;
    }

    if (saveTimeout.current) {
      clearTimeout(saveTimeout.current);
    }

    setSaving(true);
    saveTimeout.current = setTimeout(async () => {
      try {
        const token = await AsyncStorage.getItem("token");

        if (!token) {
          return;
        }

        await updateNotes(token, content);
      } catch {}
      setSaving(false);
    }, AUTO_SAVE_DELAY);
    return () => {
      if (saveTimeout.current) {
        clearTimeout(saveTimeout.current);
      }
    };
  }, [content]);

  return (
    <KeyboardAwareScrollView
      contentContainerStyle={{ flexGrow: 1 }}
      enableOnAndroid
      extraScrollHeight={100}
      keyboardShouldPersistTaps="always"
    >
      <View style={styles.container}>
        <Text style={styles.header}>Our shared notes</Text>
        {loading ? (
          <ActivityIndicator color="#e03487" style={{ marginTop: 32 }} />
        ) : (
          <KeyboardAwareScrollView
            style={styles.scroll}
            keyboardShouldPersistTaps="always"
            contentContainerStyle={{ paddingBottom: 200 }}
          >
            <TextInput
              style={styles.input}
              multiline
              value={content}
              onChangeText={setContent}
              placeholder="Start writing your shared notes here..."
              placeholderTextColor="#b0b3c6"
              textAlignVertical="top"
              editable={!loading}
            />
          </KeyboardAwareScrollView>
        )}
      </View>
    </KeyboardAwareScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#23243a",
    padding: 0,
  },
  header: {
    fontSize: 18,
    color: "#b0b3c6",
    fontWeight: "bold",
    letterSpacing: 1,
    paddingBottom: 10,
    textAlign: "center",
  },
  scroll: {
    flexGrow: 1,
    padding: 15,
  },
  input: {
    minHeight: 300,
    color: "#fff",
    fontSize: 16,
    backgroundColor: "#1b1c2e",
    borderRadius: 16,
    padding: 18,
    textAlignVertical: "top",
    fontFamily: "sans-serif",
  },
  statusBar: {
    minHeight: 28,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
  },
  savingText: {
    color: "#e03487",
    fontSize: 13,
  },
  errorText: {
    color: "red",
    fontSize: 13,
  },
});

export default NotesScreen;
