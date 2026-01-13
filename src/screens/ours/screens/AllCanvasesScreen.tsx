// external
import React, { useState, useMemo, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Dimensions,
  RefreshControl,
  ActivityIndicator,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useQueryClient } from "@tanstack/react-query";
import Animated, {
  FadeInUp,
  FadeOutDown,
  Layout,
} from "react-native-reanimated";

// internal
import { Canvas } from "../../../types/Canvas";
import { OursStackParamList } from "../../../types/StackParamList";
import { formatDateTime } from "../../../helpers/notesHelpers";
import { createCanvas, deleteCanvas } from "../../../services/api/ours/canvasService";
import { useTheme } from "../../../theme/ThemeContext";
import { useAuth } from "../../../contexts/AuthContext";
import { useSocket } from "../../../contexts/SocketContext";
import useToken from "../../../hooks/useToken";
import { useOursSelector } from "../../../hooks/useOursSelector";
import { useOurs } from "../../../hooks/useOurs";

// components
import CreateCanvasModal from "../../../components/modals/input/CreateCanvasModal";
import ConfirmationModal from "../../../components/modals/selection/ConfirmationModal";
import AlertModal from "../../../components/modals/output/AlertModal";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const CARD_GAP = 14;
const CARD_WIDTH = (SCREEN_WIDTH - 32 - CARD_GAP) / 2;

type Props = NativeStackScreenProps<OursStackParamList, "AllCanvasesScreen">;

const AllCanvasesScreen: React.FC<Props> = ({ navigation }) => {
  // hooks
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();
  const { user } = useAuth();
  const { socket } = useSocket();
  const token = useToken();
  const queryClient = useQueryClient();

  // styles
  const styles = useMemo(() => createStyles(theme), [theme]);

  // data
  const { refetch, isLoading } = useOurs(token, user?.id);
  const canvases: Canvas[] =
    useOursSelector(user?.id, (ours) => ours?.canvases) || [];

  // states
  const [createModalVisible, setCreateModalVisible] = useState(false);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [selectedCanvas, setSelectedCanvas] = useState<Canvas | null>(null);
  const [creating, setCreating] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");
  const [alertTitle, setAlertTitle] = useState("");

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  }, [refetch]);

  const handleCreateCanvas = async (title: string) => {
    if (!token) return;

    setCreating(true);
    try {
      const newCanvas = await createCanvas(token, title);

      // Emit to partner
      if (socket?.connected) {
        socket.emit("canvas:created", { canvas: newCanvas });
      }

      await queryClient.invalidateQueries({ queryKey: ["ours", user?.id] });
      setCreateModalVisible(false);
      
      // Navigate to editor
      navigation.navigate("CanvasEditorScreen", { canvasId: newCanvas.id });
    } catch (err: any) {
      setAlertTitle("Error");
      setAlertMessage(err.response?.data?.error || "Failed to create canvas");
      setAlertVisible(true);
    } finally {
      setCreating(false);
    }
  };

  const handleDeleteCanvas = async () => {
    if (!token || !selectedCanvas) return;

    setDeleting(true);
    try {
      await deleteCanvas(token, selectedCanvas.id);

      // Emit to partner
      if (socket?.connected) {
        socket.emit("canvas:deleted", { canvasId: selectedCanvas.id });
      }

      await queryClient.invalidateQueries({ queryKey: ["ours", user?.id] });
      setDeleteModalVisible(false);
      setSelectedCanvas(null);
      setAlertTitle("Deleted");
      setAlertMessage("Canvas has been deleted successfully");
      setAlertVisible(true);
    } catch (err: any) {
      setAlertTitle("Error");
      setAlertMessage(err.response?.data?.error || "Failed to delete canvas");
      setAlertVisible(true);
    } finally {
      setDeleting(false);
    }
  };

  const handleCanvasPress = (canvas: Canvas) => {
    navigation.navigate("CanvasEditorScreen", { canvasId: canvas.id });
  };

  const handleCanvasLongPress = (canvas: Canvas) => {
    setSelectedCanvas(canvas);
    setDeleteModalVisible(true);
  };

  const renderCanvasCard = ({ item, index }: { item: Canvas; index: number }) => {
    const preview =
      item.content && item.content.trim().length > 0
        ? item.content.length > 80
          ? item.content.slice(0, 80) + "..."
          : item.content
        : "Tap to start writing...";

    return (
      <Animated.View
        entering={FadeInUp.delay(index * 50).springify()}
        exiting={FadeOutDown}
        layout={Layout.springify()}
      >
        <TouchableOpacity
          style={styles.canvasCard}
          onPress={() => handleCanvasPress(item)}
          onLongPress={() => handleCanvasLongPress(item)}
          activeOpacity={0.85}
          delayLongPress={400}
        >
          <View style={styles.cardContent}>
            <Text style={styles.cardTitle} numberOfLines={1}>
              {item.title || "Untitled"}
            </Text>
            <Text style={styles.cardPreview} numberOfLines={3}>
              {preview}
            </Text>
          </View>
          {item.updatedAt && (
            <Text style={styles.cardDate}>{formatDateTime(item.updatedAt)}</Text>
          )}
        </TouchableOpacity>
      </Animated.View>
    );
  };

  const renderAddCard = () => (
    <Animated.View entering={FadeInUp.springify()}>
      <TouchableOpacity
        style={styles.addCard}
        onPress={() => setCreateModalVisible(true)}
        activeOpacity={0.7}
      >
        <Feather name="plus" size={32} color={theme.colors.primary} />
        <Text style={styles.addCardText}>New Canvas</Text>
      </TouchableOpacity>
    </Animated.View>
  );

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <Feather name="edit-3" size={48} color={theme.colors.muted} />
      <Text style={styles.emptyTitle}>No canvases yet</Text>
      <Text style={styles.emptySubtitle}>
        Create your first shared canvas with your partner
      </Text>
    </View>
  );

  const allItems = [{ isAddButton: true }, ...canvases];

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Feather name="arrow-left" size={24} color={theme.colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>All Canvases</Text>
        <View style={styles.headerSpacer} />
      </View>

      {isLoading && canvases.length === 0 ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
        </View>
      ) : (
        <FlatList
          data={allItems}
          renderItem={({ item, index }) =>
            (item as any).isAddButton
              ? renderAddCard()
              : renderCanvasCard({ item: item as Canvas, index: index - 1 })
          }
          keyExtractor={(item, index) =>
            (item as any).isAddButton ? "add-button" : String((item as Canvas).id)
          }
          numColumns={2}
          columnWrapperStyle={styles.row}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={renderEmpty}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              tintColor={theme.colors.primary}
            />
          }
        />
      )}

      <CreateCanvasModal
        visible={createModalVisible}
        onClose={() => setCreateModalVisible(false)}
        onSave={handleCreateCanvas}
        loading={creating}
      />

      <ConfirmationModal
        visible={deleteModalVisible}
        message={`Are you sure you want to delete "${selectedCanvas?.title || "this canvas"}"?`}
        confirmText="Delete"
        cancelText="Cancel"
        onConfirm={handleDeleteCanvas}
        onCancel={() => {
          setDeleteModalVisible(false);
          setSelectedCanvas(null);
        }}
        onClose={() => {
          setDeleteModalVisible(false);
          setSelectedCanvas(null);
        }}
        loading={deleting}
      />

      <AlertModal
        visible={alertVisible}
        type={alertTitle === "Error" ? "error" : "success"}
        title={alertTitle}
        message={alertMessage}
        buttonText="OK"
        onClose={() => setAlertVisible(false)}
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
      paddingVertical: 16,
    },
    backButton: {
      padding: 8,
      borderRadius: 20,
      backgroundColor: theme.colors.surfaceAlt,
    },
    headerTitle: {
      fontSize: 18,
      fontWeight: "600",
      color: theme.colors.text,
      letterSpacing: 0.3,
    },
    headerSpacer: {
      width: 40,
    },
    loadingContainer: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
    },
    listContent: {
      padding: 16,
      paddingBottom: 32,
    },
    row: {
      justifyContent: "space-between",
      marginBottom: CARD_GAP,
    },
    canvasCard: {
      width: CARD_WIDTH,
      height: 160,
      backgroundColor: theme.colors.surfaceAlt,
      borderRadius: 16,
      padding: 14,
      justifyContent: "space-between",
      shadowColor: theme.colors.shadow,
      shadowOpacity: 0.08,
      shadowRadius: 8,
      shadowOffset: { width: 0, height: 3 },
      elevation: 2,
    },
    cardContent: {
      flex: 1,
    },
    cardTitle: {
      fontSize: 15,
      fontWeight: "600",
      color: theme.colors.text,
      marginBottom: 8,
      letterSpacing: 0.2,
    },
    cardPreview: {
      fontSize: 14,
      color: theme.colors.muted,
      lineHeight: 18,
    },
    cardDate: {
      fontSize: 10,
      color: theme.colors.mutedAlt,
      textAlign: "right",
    },
    addCard: {
      width: CARD_WIDTH,
      height: 160,
      backgroundColor: theme.colors.surfaceAlt,
      borderRadius: 16,
      borderWidth: 2,
      borderStyle: "dashed",
      borderColor: theme.colors.primary,
      justifyContent: "center",
      alignItems: "center",
      gap: 8,
    },
    addCardText: {
      fontSize: 14,
      fontWeight: "600",
      color: theme.colors.primary,
    },
    emptyContainer: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      paddingTop: 80,
      paddingHorizontal: 32,
    },
    emptyTitle: {
      fontSize: 18,
      fontWeight: "600",
      color: theme.colors.text,
      marginTop: 16,
    },
    emptySubtitle: {
      fontSize: 14,
      color: theme.colors.muted,
      textAlign: "center",
      marginTop: 8,
    },
  });

export default AllCanvasesScreen;

