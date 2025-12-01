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
  TouchableOpacity,
  Keyboard,
} from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { Feather } from "@expo/vector-icons";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useQueryClient } from "@tanstack/react-query";
import Animated, {
  FadeIn,
  FadeOut,
  SlideInDown,
} from "react-native-reanimated";

// internal
import { Canvas } from "../../../types/Canvas";
import { OursStackParamList } from "../../../types/StackParamList";
import {
  getCanvas,
  updateCanvasContent,
  updateCanvasTitle,
} from "../../../services/api/ours/canvasService";
import { useTheme } from "../../../theme/ThemeContext";
import { useAuth } from "../../../contexts/AuthContext";
import { useSocket } from "../../../contexts/SocketContext";
import useToken from "../../../hooks/useToken";

// components
import EditTitleModal from "../../../components/modals/input/EditTitleModal";

// constants
const AUTO_SAVE_DELAY = 800;
const TYPING_THROTTLE_MS = 3000;

type Props = NativeStackScreenProps<OursStackParamList, "CanvasEditorScreen">;

const CanvasEditorScreen: React.FC<Props> = ({ navigation, route }) => {
  const { canvasId } = route.params;

  // hooks
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();
  const { user } = useAuth();
  const { socket } = useSocket();
  const token = useToken();
  const queryClient = useQueryClient();

  // styles
  const styles = useMemo(() => createStyles(theme), [theme]);

  // states
  const [canvas, setCanvas] = useState<Canvas | null>(null);
  const [content, setContent] = useState("");
  const [title, setTitle] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [partnerTyping, setPartnerTyping] = useState(false);
  const [editTitleModalVisible, setEditTitleModalVisible] = useState(false);
  const [savingTitle, setSavingTitle] = useState(false);

  // refs
  const saveTimeout = useRef<NodeJS.Timeout | null>(null);
  const typingTimeout = useRef<NodeJS.Timeout | null>(null);
  const lastTypingEmit = useRef<number>(0);
  const lastSavedContent = useRef("");
  const inputRef = useRef<TextInput>(null);

  // fetch canvas
  useEffect(() => {
    const fetchCanvas = async () => {
      if (!token) {
        setError("Your session has expired. Log in again and retry.");
        return;
      }

      setLoading(true);
      setError(null);
      try {
        const fetchedCanvas = await getCanvas(token, canvasId);
        setCanvas(fetchedCanvas);
        setContent(fetchedCanvas.content || "");
        setTitle(fetchedCanvas.title || "Untitled");
        lastSavedContent.current = fetchedCanvas.content || "";
      } catch (err: any) {
        setError(err?.response?.data?.error || "Failed to load canvas");
      } finally {
        setLoading(false);
      }
    };
    fetchCanvas();
  }, [token, canvasId]);

  // socket events
  useEffect(() => {
    if (!socket) return;

    const onPartnerTyping = (data: { userId: number; canvasId: number }) => {
      if (data.canvasId === canvasId) {
        setPartnerTyping(true);
        if (typingTimeout.current) {
          clearTimeout(typingTimeout.current);
        }
        typingTimeout.current = setTimeout(() => {
          setPartnerTyping(false);
        }, 2000);
      }
    };

    const onContentUpdated = (data: {
      by: number;
      canvasId: number;
      content: string;
    }) => {
      if (data.canvasId === canvasId && !saving) {
        setContent(data.content);
        lastSavedContent.current = data.content;
      }
    };

    const onTitleChanged = (data: {
      by: number;
      canvasId: number;
      title: string;
    }) => {
      if (data.canvasId === canvasId) {
        setTitle(data.title);
      }
    };

    socket.on("canvas:partnerTyping", onPartnerTyping);
    socket.on("canvas:contentUpdated", onContentUpdated);
    socket.on("canvas:titleChanged", onTitleChanged);

    return () => {
      socket.off("canvas:partnerTyping", onPartnerTyping);
      socket.off("canvas:contentUpdated", onContentUpdated);
      socket.off("canvas:titleChanged", onTitleChanged);
    };
  }, [socket, canvasId, saving]);

  // auto clear error
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  // auto save content
  useEffect(() => {
    if (!token || !canvas) return;
    if (loading || lastSavedContent.current === content) return;

    if (saveTimeout.current) {
      clearTimeout(saveTimeout.current);
    }

    setSaving(true);
    saveTimeout.current = setTimeout(async () => {
      try {
        await updateCanvasContent(token, canvasId, content);
        lastSavedContent.current = content;

        if (socket?.connected) {
          socket.emit("canvas:updated", { canvasId, content });
        }

        // Invalidate queries to sync
        queryClient.invalidateQueries({ queryKey: ["ours", user?.id] });
      } catch {}
      setSaving(false);
    }, AUTO_SAVE_DELAY);

    return () => {
      if (saveTimeout.current) {
        clearTimeout(saveTimeout.current);
      }
    };
  }, [content, token, canvas, canvasId, socket, queryClient, user?.id, loading]);

  const handleChangeText = useCallback(
    (text: string) => {
      setContent(text);
      const now = Date.now();
      if (
        socket?.connected &&
        now - lastTypingEmit.current > TYPING_THROTTLE_MS
      ) {
        socket.emit("canvas:typing", { canvasId });
        lastTypingEmit.current = now;
      }
    },
    [socket, canvasId]
  );

  const handleSaveTitle = async (newTitle: string) => {
    if (!token) return;

    setSavingTitle(true);
    try {
      await updateCanvasTitle(token, canvasId, newTitle);
      setTitle(newTitle);

      if (socket?.connected) {
        socket.emit("canvas:titleUpdated", { canvasId, title: newTitle });
      }

      queryClient.invalidateQueries({ queryKey: ["ours", user?.id] });
      setEditTitleModalVisible(false);
    } catch (err: any) {
      setError(err?.response?.data?.error || "Failed to update title");
    } finally {
      setSavingTitle(false);
    }
  };

  const handleGoBack = () => {
    Keyboard.dismiss();
    navigation.goBack();
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={handleGoBack}>
          <Feather name="arrow-left" size={24} color={theme.colors.text} />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.titleButton}
          onPress={() => setEditTitleModalVisible(true)}
        >
          <Text style={styles.headerTitle} numberOfLines={1}>
            {title}
          </Text>
          <Feather name="edit-2" size={14} color={theme.colors.muted} />
        </TouchableOpacity>

        <View style={styles.headerRight}>
          {saving && (
            <Animated.View entering={FadeIn} exiting={FadeOut}>
              <ActivityIndicator size="small" color={theme.colors.primary} />
            </Animated.View>
          )}
        </View>
      </View>

      {/* Status indicators */}
      {partnerTyping && (
        <Animated.View
          entering={SlideInDown.springify()}
          exiting={FadeOut}
          style={styles.statusBar}
        >
          <Text style={styles.statusText}>
            Your partner is writing...
          </Text>
        </Animated.View>
      )}

      {error && (
        <Animated.View
          entering={SlideInDown.springify()}
          exiting={FadeOut}
          style={styles.errorBar}
        >
          <Text style={styles.errorText}>{error}</Text>
        </Animated.View>
      )}

      {/* Content */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={styles.loadingText}>Loading canvas...</Text>
        </View>
      ) : (
        <KeyboardAwareScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          enableOnAndroid
          extraScrollHeight={80}
          showsVerticalScrollIndicator={false}
        >
          <TextInput
            ref={inputRef}
            style={styles.input}
            multiline
            value={content}
            onChangeText={handleChangeText}
            placeholder="Start writing here..."
            placeholderTextColor={theme.colors.muted}
            textAlignVertical="top"
            editable={!loading}
            autoFocus={!content}
          />
        </KeyboardAwareScrollView>
      )}

      <EditTitleModal
        visible={editTitleModalVisible}
        onClose={() => setEditTitleModalVisible(false)}
        onSave={handleSaveTitle}
        initialTitle={title}
        loading={savingTitle}
      />
    </View>
  );
};

const createStyles = (theme: ReturnType<typeof useTheme>["theme"]) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    header: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingHorizontal: 16,
      paddingVertical: 12,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.separator,
    },
    backButton: {
      padding: 8,
      borderRadius: 20,
      backgroundColor: theme.colors.surfaceAlt,
    },
    titleButton: {
      flex: 1,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 8,
      paddingHorizontal: 16,
    },
    headerTitle: {
      fontSize: 17,
      fontWeight: "600",
      color: theme.colors.text,
      maxWidth: 200,
    },
    headerRight: {
      width: 40,
      alignItems: "center",
    },
    statusBar: {
      backgroundColor: theme.colors.primary + "20",
      paddingVertical: 8,
      paddingHorizontal: 16,
      alignItems: "center",
    },
    statusText: {
      color: theme.colors.primary,
      fontSize: 13,
      fontWeight: "500",
    },
    errorBar: {
      backgroundColor: "#ff4444" + "20",
      paddingVertical: 8,
      paddingHorizontal: 16,
      alignItems: "center",
    },
    errorText: {
      color: "#ff4444",
      fontSize: 13,
      fontWeight: "500",
    },
    loadingContainer: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      gap: 12,
    },
    loadingText: {
      color: theme.colors.muted,
      fontSize: 14,
    },
    scrollView: {
      flex: 1,
    },
    scrollContent: {
      padding: 20,
      paddingBottom: 100,
    },
    input: {
      minHeight: 400,
      color: theme.colors.text,
      fontSize: 16,
      lineHeight: 24,
      backgroundColor: theme.colors.surfaceAlt,
      borderRadius: 16,
      padding: 18,
      textAlignVertical: "top",
    },
  });

export default CanvasEditorScreen;

