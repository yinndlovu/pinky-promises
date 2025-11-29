// external
import React, {
  useEffect,
  useState,
  useRef,
  useCallback,
  useMemo,
} from "react";
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
import { useTheme } from "../../../theme/ThemeContext";

// variables
const AUTO_SAVE_DELAY = 1000;
const TYPING_THROTTLE_MS = 3000;

// interfaces
interface ContentUpdatedPayload {
  by: number;
  content: string;
}

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
  const lastSavedContent = useRef("");

  // variables
  const token = useToken();
  const { socket } = useSocket();
  const { theme } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);

  // use effects
  useEffect(() => {
    const fetchNotes = async () => {
      if (!token) {
        setError("Your session has expired. Log in again and retry.");
        return;
      }

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

    const onContentUpdated = (payload: ContentUpdatedPayload) => {
      const { content: newContent } = payload;
      if (!saving && newContent !== content) {
        setContent(newContent);
      }
    };

    socket.on("notes:partnerTyping", onPartnerTyping);
    socket.on("notes:contentUpdated", onContentUpdated);

    return () => {
      socket.off("notes:partnerTyping", onPartnerTyping);
      socket.off("notes:contentUpdated", onContentUpdated);
    };
  }, [socket, token, saving, content]);

  // automatically clear error state
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  // auto saving notes
  useEffect(() => {
    if (!token) {
      setError(
        "Notes are not saving. Your session has expired. Log in again and retry."
      );
      return;
    }
    if (loading || lastSavedContent.current === content) {
      return;
    }

    if (saveTimeout.current) {
      clearTimeout(saveTimeout.current);
    }

    setSaving(true);
    saveTimeout.current = setTimeout(async () => {
      try {
        await updateNotes(token, content);
        lastSavedContent.current = content;

        if (socket?.connected) {
          socket.emit("notes:updated", { content });
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
        {error && (
          <View style={styles.statusBar}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

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
          <ActivityIndicator
            color={theme.colors.primary}
            style={{ marginTop: 32 }}
          />
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
              placeholderTextColor={theme.colors.muted}
              textAlignVertical="top"
              editable={!loading}
            />
          </KeyboardAwareScrollView>
        )}
      </View>
    </KeyboardAwareScrollView>
  );
};

const createStyles = (theme: ReturnType<typeof useTheme>["theme"]) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
      padding: 0,
    },
    header: {
      fontSize: 18,
      color: theme.colors.muted,
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
      color: theme.colors.text,
      fontSize: 16,
      backgroundColor: theme.colors.surfaceAlt,
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
      color: theme.colors.primary,
      fontSize: 13,
    },
    errorText: {
      color: "red",
      fontSize: 13,
    },
  });

export default NotesScreen;
