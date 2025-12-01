import React, { useMemo } from "react";
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from "react-native";
import { Feather } from "@expo/vector-icons";
import { useTheme } from "../../../theme/ThemeContext";
import {
  PeriodAid,
  CustomPeriodAid,
  PeriodProblem,
  PeriodAidCategoryLabels,
  PeriodProblemLabels,
  PeriodProblemEmojis,
  PeriodAidCategory,
} from "../../../types/Period";

interface Props {
  aidsForToday: {
    problem: PeriodProblem;
    severity: number;
    aids: (PeriodAid | CustomPeriodAid)[];
  }[];
  onViewAllAids?: () => void;
}

const categoryColors: Record<PeriodAidCategory, string> = {
  what_to_do: "#4caf50",
  what_to_avoid: "#f44336",
  food_to_eat: "#8bc34a",
  food_to_avoid: "#ff5722",
  exercises: "#2196f3",
  self_care: "#e91e63",
  supplements: "#9c27b0",
  general_tip: "#607d8b",
};

const categoryIcons: Record<PeriodAidCategory, string> = {
  what_to_do: "check-circle",
  what_to_avoid: "x-circle",
  food_to_eat: "coffee",
  food_to_avoid: "slash",
  exercises: "activity",
  self_care: "heart",
  supplements: "package",
  general_tip: "info",
};

const PeriodAidsSection: React.FC<Props> = ({ aidsForToday, onViewAllAids }) => {
  const { theme } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);

  if (aidsForToday.length === 0) {
    return null;
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>HELPFUL TIPS FOR TODAY</Text>
        {onViewAllAids && (
          <TouchableOpacity onPress={onViewAllAids}>
            <Text style={styles.seeAll}>View All</Text>
          </TouchableOpacity>
        )}
      </View>

      {aidsForToday.map((issueAids) => (
        <View key={issueAids.problem} style={styles.problemSection}>
          <View style={styles.problemHeader}>
            <Text style={styles.problemEmoji}>
              {PeriodProblemEmojis[issueAids.problem]}
            </Text>
            <Text style={styles.problemTitle}>
              For {PeriodProblemLabels[issueAids.problem]}
            </Text>
          </View>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.aidsScroll}
          >
            {issueAids.aids.slice(0, 5).map((aid) => {
              const isPeriodAid = "category" in aid;
              const category = isPeriodAid
                ? (aid as PeriodAid).category
                : "general_tip";
              const color = categoryColors[category];
              const icon = categoryIcons[category];

              return (
                <View
                  key={aid.id}
                  style={[styles.aidCard, { borderLeftColor: color }]}
                >
                  <View style={styles.aidHeader}>
                    <View style={[styles.aidIcon, { backgroundColor: color + "20" }]}>
                      <Feather name={icon as any} size={16} color={color} />
                    </View>
                    {isPeriodAid && (
                      <Text style={styles.aidCategory}>
                        {PeriodAidCategoryLabels[category]}
                      </Text>
                    )}
                    {"isActive" in aid && (
                      <View style={styles.customBadge}>
                        <Text style={styles.customBadgeText}>CUSTOM</Text>
                      </View>
                    )}
                  </View>
                  <Text style={styles.aidTitle} numberOfLines={2}>
                    {aid.title}
                  </Text>
                  {aid.description && (
                    <Text style={styles.aidDescription} numberOfLines={3}>
                      {aid.description}
                    </Text>
                  )}
                </View>
              );
            })}
          </ScrollView>
        </View>
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
    problemSection: {
      marginBottom: 16,
    },
    problemHeader: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: 10,
    },
    problemEmoji: {
      fontSize: 20,
      marginRight: 8,
    },
    problemTitle: {
      fontSize: 15,
      fontWeight: "600",
      color: theme.colors.text,
    },
    aidsScroll: {
      paddingRight: 16,
    },
    aidCard: {
      backgroundColor: theme.colors.surfaceAlt,
      borderRadius: 16,
      padding: 14,
      marginRight: 12,
      width: 220,
      borderLeftWidth: 4,
    },
    aidHeader: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: 10,
    },
    aidIcon: {
      width: 28,
      height: 28,
      borderRadius: 8,
      alignItems: "center",
      justifyContent: "center",
      marginRight: 8,
    },
    aidCategory: {
      fontSize: 10,
      color: theme.colors.muted,
      letterSpacing: 0.5,
      textTransform: "uppercase",
      fontWeight: "600",
      flex: 1,
    },
    customBadge: {
      backgroundColor: theme.colors.primary + "20",
      paddingHorizontal: 6,
      paddingVertical: 2,
      borderRadius: 4,
    },
    customBadgeText: {
      fontSize: 9,
      color: theme.colors.primary,
      fontWeight: "700",
      letterSpacing: 0.5,
    },
    aidTitle: {
      fontSize: 15,
      fontWeight: "600",
      color: theme.colors.text,
      marginBottom: 6,
    },
    aidDescription: {
      fontSize: 13,
      color: theme.colors.muted,
      lineHeight: 18,
    },
  });

export default PeriodAidsSection;

