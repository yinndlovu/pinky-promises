// external
import React, { useMemo } from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";

// internal
import { NotesCanvasProps } from "../../../types/Notes";
import { formatDateTime } from "../../../helpers/notesHelpers";
import { useTheme } from "../../../theme/ThemeContext";

const NotesCanvas: React.FC<NotesCanvasProps> = ({
  onView,
  preview,
  updatedAt,
}) => {
  // variables
  const { theme } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);

  return (
    <View style={styles.wrapper}>
      <View style={styles.headerRow}>
        <Text style={styles.sectionTitle}>Our notes</Text>
        <TouchableOpacity style={styles.viewButton} onPress={onView}>
          <Text style={styles.viewButtonText}>View</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.canvas}>
        <Text style={styles.placeholderText}>
          {preview && preview.trim().length > 0
            ? preview.length > 120
              ? preview.slice(0, 120) + "..."
              : preview
            : "This is your shared canvas for notes or memories"}
        </Text>
        {updatedAt && (
          <Text style={styles.updatedAt}>
            Last updated: {formatDateTime(updatedAt)}
          </Text>
        )}
      </View>
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
      marginBottom: 10,
    },
    sectionTitle: {
      fontSize: 18,
      color: theme.colors.muted,
      fontWeight: "bold",
      letterSpacing: 0,
      marginLeft: 12,
    },
    viewButton: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: "transparent",
      borderRadius: 8,
      paddingVertical: 4,
      paddingHorizontal: 12,
    },
    viewButtonText: {
      color: theme.colors.primary,
      fontWeight: "bold",
      fontSize: 15,
      marginLeft: 6,
      letterSpacing: 0.5,
    },
    canvas: {
      backgroundColor: theme.colors.surfaceAlt,
      borderRadius: 16,
      minHeight: 200,
      padding: 20,
      justifyContent: "center",
      alignItems: "center",
      shadowColor: theme.colors.shadow,
      shadowOpacity: 0.08,
      shadowRadius: 8,
      elevation: 2,
      position: "relative",
    },
    placeholderText: {
      color: theme.colors.muted,
      fontSize: 15,
      textAlign: "center",
      opacity: 0.8,
    },
    updatedAt: {
      position: "absolute",
      right: 12,
      bottom: 10,
      color: theme.colors.muted,
      fontSize: 11,
      opacity: 0.7,
    },
  });

export default NotesCanvas;
