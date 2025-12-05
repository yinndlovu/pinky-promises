// external
import React, { useMemo } from "react";
import { View, Text, StyleSheet, FlatList } from "react-native";
import { Feather } from "@expo/vector-icons";
import Animated, { FadeIn } from "react-native-reanimated";

// internal
import { useTheme } from "../../../../theme/ThemeContext";
import { formatTimeLeft, formatDateDMY } from "../../../../utils/formatters/formatDate";
import type { Resolution } from "../../../../services/api/resolutions/resolutionService";

interface PartnerResolutionsProps {
  resolutions: Resolution[];
  isLoading?: boolean;
}

const PartnerResolutions: React.FC<PartnerResolutionsProps> = ({
  resolutions,
  isLoading,
}) => {
  const { theme } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);

  const calculateTimeLeft = (dueDate: string) => {
    const now = new Date();
    const due = new Date(dueDate);
    const diffMs = due.getTime() - now.getTime();

    if (diffMs <= 0) {
      return { days: 0, hours: 0, minutes: 0 };
    }

    const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

    return { days, hours, minutes };
  };

  const sortedResolutions = useMemo(() => {
    return [...resolutions].sort((a, b) => {
      if (a.completed !== b.completed) {
        return a.completed ? 1 : -1;
      }
      return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
    });
  }, [resolutions]);

  if (isLoading) {
    return (
      <View style={styles.wrapper}>
        <View style={styles.headerContainer}>
          <View style={styles.headerLeft}>
            <View style={styles.iconContainer}>
              <Feather name="target" size={20} color={theme.colors.primary} />
            </View>
            <Text style={styles.title}>Resolutions</Text>
          </View>
        </View>
        <View style={styles.emptyCard}>
          <Text style={styles.emptyText}>Loading resolutions...</Text>
        </View>
      </View>
    );
  }

  if (sortedResolutions.length === 0) {
    return (
      <Animated.View entering={FadeIn.duration(400)} style={styles.wrapper}>
        <View style={styles.headerContainer}>
          <View style={styles.headerLeft}>
            <View style={styles.iconContainer}>
              <Feather name="target" size={20} color={theme.colors.primary} />
            </View>
            <Text style={styles.title}>Resolutions</Text>
          </View>
        </View>
        <View style={styles.emptyCard}>
          <Feather
            name="target"
            size={32}
            color={theme.colors.mutedAlt}
            style={styles.emptyIcon}
          />
          <Text style={styles.emptyText}>No resolutions yet</Text>
        </View>
      </Animated.View>
    );
  }

  return (
    <Animated.View entering={FadeIn.duration(400)} style={styles.wrapper}>
      <View style={styles.headerContainer}>
        <View style={styles.headerLeft}>
          <View style={styles.iconContainer}>
            <Feather name="target" size={20} color={theme.colors.primary} />
          </View>
          <Text style={styles.title}>Resolutions</Text>
        </View>
        <Text style={styles.countBadge}>{sortedResolutions.length}</Text>
      </View>

      <FlatList
        data={sortedResolutions}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item, index }) => {
          const timeLeft = calculateTimeLeft(item.dueDate);
          const isOverdue =
            !item.completed &&
            timeLeft.days === 0 &&
            timeLeft.hours === 0 &&
            timeLeft.minutes === 0;

          return (
            <Animated.View
              entering={FadeIn.duration(300).delay(index * 50)}
              style={[
                styles.resolutionCard,
                item.completed && styles.resolutionCardCompleted,
                isOverdue && !item.completed && styles.resolutionCardOverdue,
              ]}
            >
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
                <View style={styles.statusContainer}>
                  {item.completed ? (
                    <View style={styles.completedBadge}>
                      <Feather
                        name="check-circle"
                        size={14}
                        color={theme.colors.primary}
                      />
                      <Text style={styles.completedText}>Completed</Text>
                    </View>
                  ) : isOverdue ? (
                    <View style={styles.overdueBadge}>
                      <Text style={styles.overdueText}>Overdue</Text>
                    </View>
                  ) : (
                    <Text style={styles.timeLeft}>
                      {formatTimeLeft(
                        timeLeft.days,
                        timeLeft.hours,
                        timeLeft.minutes
                      )}
                    </Text>
                  )}
                </View>
                <Text style={styles.dueDate}>
                  Due: {formatDateDMY(item.dueDate)}
                </Text>
              </View>
            </Animated.View>
          );
        }}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        scrollEnabled={false}
      />
    </Animated.View>
  );
};

const createStyles = (theme: ReturnType<typeof useTheme>["theme"]) =>
  StyleSheet.create({
    wrapper: {
      width: "100%",
      marginBottom: 24,
    },
    headerContainer: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      marginBottom: 16,
    },
    headerLeft: {
      flexDirection: "row",
      alignItems: "center",
      gap: 10,
    },
    iconContainer: {
      width: 36,
      height: 36,
      borderRadius: 18,
      backgroundColor: theme.colors.primary + "20",
      alignItems: "center",
      justifyContent: "center",
    },
    title: {
      fontSize: 18,
      fontWeight: "700",
      color: theme.colors.muted,
      letterSpacing: 0.5,
    },
    countBadge: {
      fontSize: 12,
      fontWeight: "600",
      color: theme.colors.primary,
      backgroundColor: theme.colors.primary + "15",
      paddingHorizontal: 10,
      paddingVertical: 4,
      borderRadius: 12,
      overflow: "hidden",
    },
    emptyCard: {
      backgroundColor: theme.colors.surfaceAlt,
      borderRadius: 20,
      padding: 40,
      alignItems: "center",
      justifyContent: "center",
      borderWidth: 1,
      borderColor: theme.colors.separator + "30",
      borderStyle: "dashed",
    },
    emptyIcon: {
      marginBottom: 12,
      opacity: 0.5,
    },
    emptyText: {
      fontSize: 14,
      color: theme.colors.mutedAlt,
      fontStyle: "italic",
    },
    resolutionCard: {
      backgroundColor: theme.colors.surfaceAlt,
      borderRadius: 16,
      padding: 16,
      shadowColor: theme.colors.shadow,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.08,
      shadowRadius: 8,
      elevation: 2,
      borderWidth: 1,
      borderColor: theme.colors.separator + "30",
    },
    resolutionCardCompleted: {
      opacity: 0.6,
    },
    resolutionCardOverdue: {
      borderLeftWidth: 4,
      borderLeftColor: "#ef4444",
    },
    resolutionHeader: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: 12,
    },
    resolutionTitle: {
      fontSize: 16,
      fontWeight: "600",
      color: theme.colors.text,
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
    statusContainer: {
      flexDirection: "row",
      alignItems: "center",
    },
    timeLeft: {
      fontSize: 13,
      color: theme.colors.muted,
      fontWeight: "500",
    },
    completedBadge: {
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
      backgroundColor: theme.colors.primary + "15",
      paddingHorizontal: 10,
      paddingVertical: 4,
      borderRadius: 12,
    },
    completedText: {
      fontSize: 12,
      fontWeight: "600",
      color: theme.colors.primary,
    },
    overdueBadge: {
      backgroundColor: "#ef4444" + "15",
      paddingHorizontal: 10,
      paddingVertical: 4,
      borderRadius: 12,
    },
    overdueText: {
      fontSize: 12,
      fontWeight: "600",
      color: "#ef4444",
    },
    dueDate: {
      fontSize: 12,
      color: theme.colors.muted,
    },
    separator: {
      height: 12,
    },
  });

export default PartnerResolutions;

