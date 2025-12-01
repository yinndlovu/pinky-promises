import React, { useMemo } from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Feather } from "@expo/vector-icons";
import { useTheme } from "../../../theme/ThemeContext";
import { PeriodLookout } from "../../../types/Period";

interface Props {
  lookouts: PeriodLookout[];
  onMarkSeen: (lookoutId: number) => void;
  onViewLookout?: (lookout: PeriodLookout) => void;
}

const LookoutsSection: React.FC<Props> = ({
  lookouts,
  onMarkSeen,
  onViewLookout,
}) => {
  const { theme } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);

  if (lookouts.length === 0) {
    return null;
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Feather name="eye" size={16} color={theme.colors.primary} />
        <Text style={styles.headerTitle}>THINGS TO LOOK OUT FOR</Text>
      </View>

      {lookouts.map((lookout) => (
        <TouchableOpacity
          key={lookout.id}
          style={styles.card}
          onPress={() => onViewLookout?.(lookout)}
          activeOpacity={0.7}
        >
          <View style={styles.cardHeader}>
            <View style={styles.badge}>
              <Text style={styles.badgeText}>
                {lookout.isAdminCreated ? "TIP" : "FROM PARTNER"}
              </Text>
            </View>
            {lookout.priority > 0 && (
              <View style={styles.priorityBadge}>
                <Feather name="alert-circle" size={12} color="#ff6b6b" />
                <Text style={styles.priorityText}>Important</Text>
              </View>
            )}
          </View>
          <Text style={styles.title}>{lookout.title}</Text>
          {lookout.description && (
            <Text style={styles.description} numberOfLines={2}>
              {lookout.description}
            </Text>
          )}
          {lookout.CreatedBy && (
            <Text style={styles.createdBy}>
              Added by {lookout.CreatedBy.name}
            </Text>
          )}
          {!lookout.isSeen && (
            <TouchableOpacity
              style={styles.dismissButton}
              onPress={() => onMarkSeen(lookout.id)}
            >
              <Text style={styles.dismissText}>Mark as seen</Text>
              <Feather name="check" size={14} color={theme.colors.primary} />
            </TouchableOpacity>
          )}
        </TouchableOpacity>
      ))}
    </View>
  );
};

const createStyles = (theme: any) =>
  StyleSheet.create({
    container: {
      marginBottom: 16,
    },
    header: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: 12,
      gap: 8,
    },
    headerTitle: {
      fontSize: 13,
      color: theme.colors.muted,
      letterSpacing: 1.5,
      textTransform: "uppercase",
      fontWeight: "700",
    },
    card: {
      backgroundColor: theme.colors.surfaceAlt,
      borderRadius: 16,
      padding: 16,
      marginBottom: 12,
      borderWidth: 1,
      borderColor: theme.colors.primary + "30",
    },
    cardHeader: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: 10,
      gap: 8,
    },
    badge: {
      backgroundColor: theme.colors.primary + "20",
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 6,
    },
    badgeText: {
      fontSize: 10,
      color: theme.colors.primary,
      fontWeight: "700",
      letterSpacing: 0.5,
    },
    priorityBadge: {
      flexDirection: "row",
      alignItems: "center",
      gap: 4,
    },
    priorityText: {
      fontSize: 11,
      color: "#ff6b6b",
      fontWeight: "600",
    },
    title: {
      fontSize: 16,
      fontWeight: "600",
      color: theme.colors.text,
      marginBottom: 6,
    },
    description: {
      fontSize: 14,
      color: theme.colors.muted,
      lineHeight: 20,
      marginBottom: 8,
    },
    createdBy: {
      fontSize: 12,
      color: theme.colors.mutedAlt,
      fontStyle: "italic",
    },
    dismissButton: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "flex-end",
      marginTop: 12,
      gap: 6,
    },
    dismissText: {
      fontSize: 13,
      color: theme.colors.primary,
      fontWeight: "600",
    },
  });

export default LookoutsSection;

