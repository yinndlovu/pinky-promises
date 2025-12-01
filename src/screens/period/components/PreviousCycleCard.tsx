import React, { useMemo } from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Feather } from "@expo/vector-icons";
import { useTheme } from "../../../theme/ThemeContext";
import { PeriodCycle } from "../../../types/Period";

interface Props {
  cycles: PeriodCycle[];
  averages: {
    cycleLength: number;
    periodLength: number;
  };
  onViewHistory?: () => void;
}

const PreviousCycleCard: React.FC<Props> = ({
  cycles,
  averages,
  onViewHistory,
}) => {
  const { theme } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);

  const lastCycle = cycles.find((c) => c.endDate) || null;

  if (!lastCycle && cycles.length === 0) {
    return null;
  }

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  };

  const getPeriodLength = (cycle: PeriodCycle) => {
    if (!cycle.endDate) return null;
    const start = new Date(cycle.startDate);
    const end = new Date(cycle.endDate);
    return Math.round((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>CYCLE INSIGHTS</Text>
        {onViewHistory && (
          <TouchableOpacity onPress={onViewHistory}>
            <Text style={styles.seeAll}>View History</Text>
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.card}>
        <View style={styles.statsRow}>
          <View style={styles.stat}>
            <View style={[styles.statIcon, { backgroundColor: "#a29bfe20" }]}>
              <Feather name="repeat" size={18} color="#a29bfe" />
            </View>
            <Text style={styles.statValue}>{averages.cycleLength}</Text>
            <Text style={styles.statLabel}>Avg Cycle</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.stat}>
            <View style={[styles.statIcon, { backgroundColor: "#ff6b9d20" }]}>
              <Feather name="droplet" size={18} color="#ff6b9d" />
            </View>
            <Text style={styles.statValue}>{averages.periodLength}</Text>
            <Text style={styles.statLabel}>Avg Period</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.stat}>
            <View style={[styles.statIcon, { backgroundColor: "#00b89420" }]}>
              <Feather name="calendar" size={18} color="#00b894" />
            </View>
            <Text style={styles.statValue}>{cycles.length}</Text>
            <Text style={styles.statLabel}>Tracked</Text>
          </View>
        </View>

        {lastCycle && (
          <View style={styles.lastCycleSection}>
            <Text style={styles.lastCycleTitle}>Previous Period</Text>
            <View style={styles.lastCycleRow}>
              <View style={styles.lastCycleInfo}>
                <Feather name="calendar" size={14} color={theme.colors.muted} />
                <Text style={styles.lastCycleText}>
                  {formatDate(lastCycle.startDate)} - {formatDate(lastCycle.endDate!)}
                </Text>
              </View>
              <View style={styles.lastCycleBadge}>
                <Text style={styles.lastCycleBadgeText}>
                  {getPeriodLength(lastCycle)} days
                </Text>
              </View>
            </View>
          </View>
        )}
      </View>
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
      justifyContent: "space-between",
      marginBottom: 12,
    },
    headerTitle: {
      fontSize: 13,
      color: theme.colors.muted,
      letterSpacing: 1.5,
      textTransform: "uppercase",
      fontWeight: "700",
    },
    seeAll: {
      fontSize: 13,
      color: theme.colors.primary,
      fontWeight: "600",
    },
    card: {
      backgroundColor: theme.colors.surfaceAlt,
      borderRadius: 20,
      padding: 20,
    },
    statsRow: {
      flexDirection: "row",
      justifyContent: "space-around",
      alignItems: "center",
    },
    stat: {
      alignItems: "center",
      flex: 1,
    },
    statIcon: {
      width: 40,
      height: 40,
      borderRadius: 12,
      alignItems: "center",
      justifyContent: "center",
      marginBottom: 8,
    },
    statValue: {
      fontSize: 24,
      fontWeight: "700",
      color: theme.colors.text,
    },
    statLabel: {
      fontSize: 11,
      color: theme.colors.muted,
      marginTop: 2,
      textTransform: "uppercase",
      letterSpacing: 0.5,
    },
    divider: {
      width: 1,
      height: 50,
      backgroundColor: theme.colors.separator,
    },
    lastCycleSection: {
      marginTop: 20,
      paddingTop: 16,
      borderTopWidth: 1,
      borderTopColor: theme.colors.separator,
    },
    lastCycleTitle: {
      fontSize: 13,
      color: theme.colors.muted,
      fontWeight: "600",
      marginBottom: 10,
    },
    lastCycleRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
    },
    lastCycleInfo: {
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
    },
    lastCycleText: {
      fontSize: 15,
      color: theme.colors.text,
      fontWeight: "500",
    },
    lastCycleBadge: {
      backgroundColor: theme.colors.primary + "20",
      paddingHorizontal: 10,
      paddingVertical: 4,
      borderRadius: 10,
    },
    lastCycleBadgeText: {
      fontSize: 12,
      color: theme.colors.primary,
      fontWeight: "600",
    },
  });

export default PreviousCycleCard;

