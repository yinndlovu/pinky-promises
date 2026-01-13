// external
import React, { useMemo, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Animated,
  Dimensions,
} from "react-native";
import { Feather } from "@expo/vector-icons";

// internal
import { Canvas } from "../../../types/Canvas";
import { formatDateTime } from "../../../helpers/notesHelpers";
import { useTheme } from "../../../theme/ThemeContext";

// helper variables
const { width: SCREEN_WIDTH } = Dimensions.get("window");
const CANVAS_WIDTH = SCREEN_WIDTH * 0.7;
const ADD_BUTTON_WIDTH = 72;
const CANVAS_GAP = 14;

// props
interface CanvasSectionProps {
  canvases: Canvas[];
  onExpand: () => void;
  onCanvasPress: (canvas: Canvas) => void;
  onAddCanvas: () => void;
}

const CanvasSection: React.FC<CanvasSectionProps> = ({
  canvases,
  onExpand,
  onCanvasPress,
  onAddCanvas,
}) => {
  // hook variables
  const { theme } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);

  // use refs
  const scrollX = useRef(new Animated.Value(0)).current;

  // helper
  const renderAddButton = () => (
    <TouchableOpacity
      style={styles.addButton}
      onPress={onAddCanvas}
      activeOpacity={0.7}
    >
      <View style={styles.addButtonInner}>
        <Feather name="plus" size={28} color={theme.colors.primary} />
        <Text style={styles.addButtonText}>New</Text>
      </View>
    </TouchableOpacity>
  );

  const renderCanvasCard = (canvas: Canvas, index: number) => {
    const inputRange = [
      (index - 1) * (CANVAS_WIDTH + CANVAS_GAP),
      index * (CANVAS_WIDTH + CANVAS_GAP),
      (index + 1) * (CANVAS_WIDTH + CANVAS_GAP),
    ];

    const scale = scrollX.interpolate({
      inputRange,
      outputRange: [0.95, 1, 0.95],
      extrapolate: "clamp",
    });

    const opacity = scrollX.interpolate({
      inputRange,
      outputRange: [0.7, 1, 0.7],
      extrapolate: "clamp",
    });

    const preview =
      canvas.content && canvas.content.trim().length > 0
        ? canvas.content.length > 100
          ? canvas.content.slice(0, 100) + "..."
          : canvas.content
        : "Tap to start writing...";

    return (
      <Animated.View
        key={canvas.id}
        style={[styles.canvasCardWrapper, { transform: [{ scale }], opacity }]}
      >
        <TouchableOpacity
          style={styles.canvasCard}
          onPress={() => onCanvasPress(canvas)}
          activeOpacity={0.85}
        >
          <View style={styles.canvasContent}>
            <Text style={styles.canvasPreview} numberOfLines={4}>
              {preview}
            </Text>
          </View>
          {canvas.updatedAt && (
            <Text style={styles.canvasDate}>
              {formatDateTime(canvas.updatedAt)}
            </Text>
          )}
        </TouchableOpacity>
        <Text style={styles.canvasTitle} numberOfLines={1}>
          {canvas.title || "Untitled"}
        </Text>
      </Animated.View>
    );
  };

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Text style={styles.emptyText}>
        Create your first shared canvas together
      </Text>
    </View>
  );

  return (
    <View style={styles.wrapper}>
      <View style={styles.headerRow}>
        <Text style={styles.sectionTitle}>Our canvases</Text>
        <TouchableOpacity style={styles.expandButton} onPress={onExpand}>
          <Feather name="maximize-2" size={16} color={theme.colors.primary} />
          <Text style={styles.expandButtonText}>Expand</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        decelerationRate="fast"
        snapToInterval={CANVAS_WIDTH + CANVAS_GAP}
        snapToAlignment="start"
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { x: scrollX } } }],
          { useNativeDriver: false }
        )}
        scrollEventThrottle={16}
      >
        {renderAddButton()}
        {canvases.length === 0
          ? renderEmptyState()
          : canvases.map((canvas, index) => renderCanvasCard(canvas, index))}
      </ScrollView>
    </View>
  );
};

const createStyles = (theme: ReturnType<typeof useTheme>["theme"]) =>
  StyleSheet.create({
    wrapper: {
      width: "100%",
      marginBottom: 32,
    },
    headerRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      marginBottom: 14,
      paddingHorizontal: 4,
    },
    sectionTitle: {
      fontSize: 18,
      color: theme.colors.muted,
      fontWeight: "bold",
      letterSpacing: 0,
      marginLeft: 8,
    },
    expandButton: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: "transparent",
      borderRadius: 8,
      paddingVertical: 6,
      paddingHorizontal: 12,
      gap: 6,
    },
    expandButtonText: {
      color: theme.colors.primary,
      fontWeight: "600",
      fontSize: 14,
      letterSpacing: 0.3,
    },
    scrollContent: {
      paddingLeft: 4,
      paddingRight: 20,
      gap: CANVAS_GAP,
      alignItems: "flex-start",
    },
    addButton: {
      width: ADD_BUTTON_WIDTH,
      height: 160,
      borderRadius: 16,
      borderWidth: 2,
      borderStyle: "dashed",
      borderColor: theme.colors.primary,
      backgroundColor: theme.colors.surfaceAlt,
      justifyContent: "center",
      alignItems: "center",
      marginRight: 2,
    },
    addButtonInner: {
      alignItems: "center",
      gap: 6,
    },
    addButtonText: {
      color: theme.colors.primary,
      fontSize: 13,
      fontWeight: "600",
    },
    canvasCardWrapper: {
      width: CANVAS_WIDTH,
    },
    canvasCard: {
      width: "100%",
      height: 160,
      backgroundColor: theme.colors.surfaceAlt,
      borderRadius: 16,
      padding: 16,
      justifyContent: "space-between",
      shadowColor: theme.colors.shadow,
      shadowOpacity: 0.1,
      shadowRadius: 10,
      shadowOffset: { width: 0, height: 4 },
      elevation: 3,
    },
    canvasContent: {
      flex: 1,
    },
    canvasPreview: {
      color: theme.colors.muted,
      fontSize: 18,
      lineHeight: 20,
      opacity: 0.9,
    },
    canvasDate: {
      color: theme.colors.mutedAlt,
      fontSize: 11,
      textAlign: "right",
      marginTop: 8,
    },
    canvasTitle: {
      color: theme.colors.text,
      fontSize: 14,
      fontWeight: "600",
      marginTop: 10,
      marginLeft: 4,
      letterSpacing: 0.2,
    },
    emptyState: {
      width: CANVAS_WIDTH,
      height: 160,
      backgroundColor: theme.colors.surfaceAlt,
      borderRadius: 16,
      justifyContent: "center",
      alignItems: "center",
      padding: 20,
    },
    emptyText: {
      color: theme.colors.muted,
      fontSize: 14,
      textAlign: "center",
      opacity: 0.7,
    },
  });

export default CanvasSection;
