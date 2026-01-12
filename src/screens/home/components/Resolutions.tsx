// external
import React, { useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
} from "react-native";
import { Feather } from "@expo/vector-icons";

// internal
import { useTheme } from "../../../theme/ThemeContext";
import { formatTimeLeft } from "../../../utils/formatters/formatDate";
import { useMarkResolutionComplete } from "../../../hooks/useResolutions";
import type { Resolution } from "../../../services/api/resolutions/resolutionService";
import useToken from "../../../hooks/useToken";

interface ResolutionsProps {
  resolutions: Resolution[];
  isLoading?: boolean;
  onAddResolution: () => void;
}

const Resolutions: React.FC<ResolutionsProps> = ({
  resolutions,
  isLoading,
  onAddResolution,
}) => {
  // hook variables
  const { theme } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const token = useToken();

  const markCompleteMutation = useMarkResolutionComplete(token);

  // helpers
  const calculateTimeLeft = (dueDate: string) => {
    const now = new Date();
    const due = new Date(dueDate);
    const diffMs = due.getTime() - now.getTime();

    if (diffMs <= 0) {
      return {
        days: 0,
        hours: 0,
        minutes: 0,
      };
    }

    const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const hours = Math.floor(
      (diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
    );
    const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

    return {
      days,
      hours,
      minutes,
    };
  };

  // handlers
  const handleMarkComplete = async (resolutionId: number) => {
    try {
      await markCompleteMutation.mutateAsync(resolutionId);
    } catch (error) {
      console.error("Failed to mark resolution complete:", error);
    }
  };

  const sortedResolutions = useMemo(() => {
    return [...resolutions]
      .map((item) => {
        const timeLeft = calculateTimeLeft(item.dueDate);
        const isOverdue =
          !item.completed &&
          timeLeft.days === 0 &&
          timeLeft.hours === 0 &&
          timeLeft.minutes === 0;
        return {
          ...item,
          timeLeft,
          isOverdue,
        };
      })
      .sort((a, b) => {
        if (a.completed !== b.completed) {
          return a.completed ? 1 : -1;
        }
        return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
      });
  }, [resolutions]);

  if (isLoading) {
    return (
      <View style={styles.container}>
        <Text style={styles.sectionTitle}>RESOLUTIONS</Text>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading resolutions...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.sectionTitle}>RESOLUTIONS</Text>
        <TouchableOpacity
          onPress={onAddResolution}
          style={styles.addButton}
        >
          <Feather name="plus" size={20} color={theme.colors.primary} />
        </TouchableOpacity>
      </View>

      {sortedResolutions.length === 0 ? (
        <View style={styles.noResolutionsContainer}>
          <Text style={styles.noResolutionsText}>No resolutions yet</Text>
          <Text style={styles.noResolutionsSubtext}>
            Add a resolution to get started!
          </Text>
        </View>
      ) : (
        <FlatList
          data={sortedResolutions}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => {
            return (
              <TouchableOpacity
                style={[
                  styles.resolutionItem,
                  item.completed && styles.resolutionItemCompleted,
                  item.isOverdue &&
                    !item.completed &&
                    styles.resolutionItemOverdue,
                ]}
                onPress={() => !item.completed && handleMarkComplete(item.id)}
                disabled={item.completed || markCompleteMutation.isPending}
              >
                <View style={styles.resolutionContent}>
                  <View style={styles.resolutionHeader}>
                    <Text
                      style={[
                        styles.resolutionTitle,
                        item.completed && styles.resolutionTitleCompleted,
                      ]}
                    >
                      {item.title}
                    </Text>
                    {item.assignedByAdmin && (
                      <View style={styles.adminBadge}>
                        <Feather
                          name="user-check"
                          size={12}
                          color={theme.colors.primary}
                        />
                      </View>
                    )}
                  </View>
                  <View style={styles.resolutionFooter}>
                    <Text
                      style={[
                        styles.timeLeft,
                        item.isOverdue &&
                          !item.completed &&
                          styles.timeLeftOverdue,
                      ]}
                    >
                      {item.completed
                        ? "Completed"
                        : item.isOverdue
                        ? "Overdue"
                        : formatTimeLeft(
                            item.timeLeft.days,
                            item.timeLeft.hours,
                            item.timeLeft.minutes
                          )}
                    </Text>
                    {!item.completed && (
                      <TouchableOpacity
                        style={styles.checkButton}
                        onPress={() => handleMarkComplete(item.id)}
                        disabled={markCompleteMutation.isPending}
                      >
                        <Feather
                          name="check-circle"
                          size={20}
                          color={theme.colors.primary}
                        />
                      </TouchableOpacity>
                    )}
                    {item.completed && (
                      <Feather
                        name="check-circle"
                        size={20}
                        color={theme.colors.primary}
                      />
                    )}
                  </View>
                </View>
              </TouchableOpacity>
            );
          }}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
          scrollEnabled={false}
          removeClippedSubviews={true}
          maxToRenderPerBatch={10}
          windowSize={5}
          initialNumToRender={10}
        />
      )}
    </View>
  );
};

const createStyles = (theme: ReturnType<typeof useTheme>["theme"]) =>
  StyleSheet.create({
    container: {
      width: "100%",
      marginTop: 10,
      marginBottom: 20,
    },
    header: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 10,
    },
    sectionTitle: {
      fontSize: 14,
      color: theme.colors.muted,
      letterSpacing: 1,
      textTransform: "uppercase",
      marginLeft: 16,
      alignSelf: "flex-start",
    },
    addButton: {
      marginRight: 16,
      padding: 8,
    },
    loadingContainer: {
      borderRadius: 12,
      paddingVertical: 20,
      paddingHorizontal: 16,
      alignItems: "center",
      justifyContent: "center",
    },
    loadingText: {
      color: theme.colors.muted,
      fontSize: 16,
    },
    noResolutionsContainer: {
      borderRadius: 12,
      paddingVertical: 30,
      paddingHorizontal: 16,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: theme.colors.surfaceAlt,
    },
    noResolutionsText: {
      color: theme.colors.text,
      fontSize: 16,
      fontWeight: "500",
      marginBottom: 4,
    },
    noResolutionsSubtext: {
      color: theme.colors.muted,
      fontSize: 14,
    },
    resolutionItem: {
      backgroundColor: theme.colors.surfaceAlt,
      borderRadius: 12,
      padding: 16,
      marginHorizontal: 16,
      marginBottom: 8,
    },
    resolutionItemCompleted: {
      opacity: 0.6,
    },
    resolutionItemOverdue: {
      borderLeftWidth: 4,
      borderLeftColor: "#ef4444",
    },
    resolutionContent: {
      flex: 1,
    },
    resolutionHeader: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: 8,
    },
    resolutionTitle: {
      color: theme.colors.text,
      fontSize: 16,
      fontWeight: "500",
      flex: 1,
    },
    resolutionTitleCompleted: {
      textDecorationLine: "line-through",
      color: theme.colors.muted,
    },
    adminBadge: {
      marginLeft: 8,
      padding: 4,
    },
    resolutionFooter: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
    },
    timeLeft: {
      color: theme.colors.muted,
      fontSize: 13,
      fontWeight: "400",
    },
    timeLeftOverdue: {
      color: "#ef4444",
      fontWeight: "600",
    },
    checkButton: {
      padding: 4,
    },
    separator: {
      height: 0,
    },
  });

export default Resolutions;
