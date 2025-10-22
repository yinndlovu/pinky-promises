// external
import React, { useEffect, useState, useRef, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  ActivityIndicator,
} from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";

// internal
import { getNotes, updateNotes } from "../../../services/api/ours/notesService";
import useToken from "../../../hooks/useToken";
import { useSocket } from "../../../contexts/SocketContext";

// variables
const AUTO_SAVE_DELAY = 1000;
const TYPING_THROTTLE_MS = 3000;

const NotesScreen: React.FC = () => {
  // use states
  const [content, setContent] = useState("");

  // use states (proccesing)
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [partnerTyping, setPartnerTyping] = useState(false);

  // use refs
  const saveTimeout = useRef<NodeJS.Timeout | null>(null);
  const typingTimeout = useRef<NodeJS.Timeout | null>(null);
  const lastTypingEmit = useRef<number>(0);

  // variables
  const token = useToken();
  const { socket } = useSocket();

  // use effects
  useEffect(() => {
    const fetchNotes = async () => {
      setLoading(true);
      setError(null);
      try {
        const notes = await getNotes(token);
        setContent(notes.content || "");
      } catch (err: any) {
        setError(err?.response?.data?.error || "Failed to load notes");
      } finally {
        setLoading(false);
      }
    };
    fetchNotes();
  }, [token]);

  // incoming socket events
  useEffect(() => {
    if (!socket) {
      return;
    }

    const onPartnerTyping = () => {
      setPartnerTyping(true);
      if (typingTimeout.current) {
        clearTimeout(typingTimeout.current);
      }
      typingTimeout.current = setTimeout(() => {
        setPartnerTyping(false);
      }, 2000);
    };

    const onContentUpdated = async () => {
      try {
        const notes = await getNotes(token);
        if (!saving) {
          setContent(notes.content || "");
        }
      } catch {}
    };

    socket.on("notes:partnerTyping", onPartnerTyping);
    socket.on("notes:contentUpdated", onContentUpdated);

    return () => {
      socket.off("notes:partnerTyping", onPartnerTyping);
      socket.off("notes:contentUpdated", onContentUpdated);
    };
  }, [socket, token, saving]); // previously removed a saving dependency here

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
        await updateNotes(token, content);

        if (socket?.connected) {
          socket.emit("notes:updated");
        }
      } catch {}
      setSaving(false);
    }, AUTO_SAVE_DELAY);
    return () => {
      if (saveTimeout.current) {
        clearTimeout(saveTimeout.current);
      }
    };
  }, [content]);

  const handleChangeText = useCallback(
    (text: string) => {
      setContent(text);
      const now = Date.now();
      if (
        socket?.connected &&
        now - lastTypingEmit.current > TYPING_THROTTLE_MS
      ) {
        socket.emit("notes:typing");
        lastTypingEmit.current = now;
      }
    },
    [socket]
  );

  return (
    <KeyboardAwareScrollView
      contentContainerStyle={{ flexGrow: 1 }}
      enableOnAndroid
      extraScrollHeight={100}
      keyboardShouldPersistTaps="always"
    >
      <View style={styles.container}>
        <Text style={styles.header}>Our shared notes</Text>
        {partnerTyping ? (
          <View style={[styles.statusBar]}>
            <Text style={styles.savingText}>
              Your baby is writing something on the notes…
            </Text>
          </View>
        ) : null}

        {saving && !partnerTyping ? (
          <View style={styles.statusBar}>
            <Text style={styles.savingText}>Saving...</Text>
          </View>
        ) : null}

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
              onChangeText={handleChangeText}
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
    letterSpacing: 0,
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
