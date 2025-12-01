import React, { useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import { useTheme } from "../../../theme/ThemeContext";
import {
  UserIssue,
  PeriodProblemLabels,
  PeriodProblemEmojis,
  PeriodAidCategoryLabels,
  PeriodAidCategory,
} from "../../../types/Period";

interface Props {
  visible: boolean;
  issue: UserIssue | null;
  onClose: () => void;
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

const IssueDetailModal: React.FC<Props> = ({ visible, issue, onClose }) => {
  const { theme } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);

  if (!issue) return null;

  const getSeverityColor = () => {
    if (issue.severity <= 3) return "#4caf50";
    if (issue.severity <= 6) return "#ff9800";
    return "#f44336";
  };

  const getSeverityLabel = () => {
    if (issue.severity <= 2) return "Very Mild";
    if (issue.severity <= 4) return "Mild";
    if (issue.severity <= 6) return "Moderate";
    if (issue.severity <= 8) return "Severe";
    return "Very Severe";
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      statusBarTranslucent
    >
      <BlurView intensity={20} tint="dark" style={styles.overlay}>
        <View style={styles.container}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <Text style={styles.emoji}>{PeriodProblemEmojis[issue.problem]}</Text>
              <View>
                <Text style={styles.title}>
                  {PeriodProblemLabels[issue.problem]}
                </Text>
                <Text style={styles.subtitle}>
                  Logged on {new Date(issue.logDate).toLocaleDateString()}
                </Text>
              </View>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Feather name="x" size={24} color={theme.colors.text} />
            </TouchableOpacity>
          </View>

          <ScrollView
            style={styles.content}
            showsVerticalScrollIndicator={false}
          >
            {/* Severity Card */}
            <View style={styles.severityCard}>
              <Text style={styles.severityLabel}>Severity Level</Text>
              <View style={styles.severityRow}>
                <Text style={[styles.severityValue, { color: getSeverityColor() }]}>
                  {issue.severity}/10
                </Text>
                <View
                  style={[
                    styles.severityBadge,
                    { backgroundColor: getSeverityColor() + "20" },
                  ]}
                >
                  <Text style={[styles.severityBadgeText, { color: getSeverityColor() }]}>
                    {getSeverityLabel()}
                  </Text>
                </View>
              </View>
              <View style={styles.severityBar}>
                {[...Array(10)].map((_, i) => (
                  <View
                    key={i}
                    style={[
                      styles.severityDot,
                      i < issue.severity && {
                        backgroundColor: getSeverityColor(),
                      },
                    ]}
                  />
                ))}
              </View>
            </View>

            {/* Notes */}
            {issue.notes && (
              <View style={styles.notesCard}>
                <Text style={styles.notesLabel}>Notes</Text>
                <Text style={styles.notesText}>{issue.notes}</Text>
              </View>
            )}

            {/* Logged By */}
            {issue.LoggedByPartner && (
              <View style={styles.loggedByCard}>
                <Feather name="heart" size={16} color={theme.colors.primary} />
                <Text style={styles.loggedByText}>
                  Logged by {issue.LoggedByPartner.name}
                </Text>
              </View>
            )}

            {/* Helpful Tips */}
            {issue.aids && issue.aids.length > 0 && (
              <>
                <Text style={styles.sectionTitle}>Helpful Tips</Text>
                {issue.aids.map((aid) => {
                  const isPeriodAid = "category" in aid;
                  const category = isPeriodAid
                    ? (aid as any).category
                    : "general_tip";
                  const color = categoryColors[category as PeriodAidCategory];

                  return (
                    <View
                      key={aid.id}
                      style={[styles.aidCard, { borderLeftColor: color }]}
                    >
                      {isPeriodAid && (
                        <Text style={styles.aidCategory}>
                          {PeriodAidCategoryLabels[category as PeriodAidCategory]}
                        </Text>
                      )}
                      {"isActive" in aid && (
                        <View style={styles.customBadge}>
                          <Text style={styles.customBadgeText}>YOUR TIP</Text>
                        </View>
                      )}
                      <Text style={styles.aidTitle}>{aid.title}</Text>
                      {aid.description && (
                        <Text style={styles.aidDescription}>{aid.description}</Text>
                      )}
                    </View>
                  );
                })}
              </>
            )}
          </ScrollView>
        </View>
      </BlurView>
    </Modal>
  );
};

const createStyles = (theme: any) =>
  StyleSheet.create({
    overlay: {
      flex: 1,
      justifyContent: "flex-end",
    },
    container: {
      backgroundColor: theme.colors.background,
      borderTopLeftRadius: 24,
      borderTopRightRadius: 24,
      maxHeight: "85%",
      paddingBottom: 34,
    },
    header: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      padding: 20,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.separator,
    },
    headerLeft: {
      flexDirection: "row",
      alignItems: "center",
      gap: 12,
    },
    emoji: {
      fontSize: 36,
    },
    title: {
      fontSize: 20,
      fontWeight: "700",
      color: theme.colors.text,
    },
    subtitle: {
      fontSize: 13,
      color: theme.colors.muted,
      marginTop: 2,
    },
    closeButton: {
      padding: 4,
    },
    content: {
      padding: 20,
    },
    severityCard: {
      backgroundColor: theme.colors.surfaceAlt,
      borderRadius: 16,
      padding: 16,
      marginBottom: 16,
    },
    severityLabel: {
      fontSize: 12,
      color: theme.colors.muted,
      fontWeight: "600",
      textTransform: "uppercase",
      letterSpacing: 0.5,
      marginBottom: 8,
    },
    severityRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      marginBottom: 12,
    },
    severityValue: {
      fontSize: 32,
      fontWeight: "700",
    },
    severityBadge: {
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 10,
    },
    severityBadgeText: {
      fontSize: 13,
      fontWeight: "600",
    },
    severityBar: {
      flexDirection: "row",
      gap: 4,
    },
    severityDot: {
      flex: 1,
      height: 6,
      borderRadius: 3,
      backgroundColor: theme.colors.separator,
    },
    notesCard: {
      backgroundColor: theme.colors.surfaceAlt,
      borderRadius: 16,
      padding: 16,
      marginBottom: 16,
    },
    notesLabel: {
      fontSize: 12,
      color: theme.colors.muted,
      fontWeight: "600",
      textTransform: "uppercase",
      letterSpacing: 0.5,
      marginBottom: 8,
    },
    notesText: {
      fontSize: 15,
      color: theme.colors.text,
      lineHeight: 22,
    },
    loggedByCard: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
      marginBottom: 20,
    },
    loggedByText: {
      fontSize: 13,
      color: theme.colors.muted,
      fontStyle: "italic",
    },
    sectionTitle: {
      fontSize: 14,
      fontWeight: "700",
      color: theme.colors.text,
      marginBottom: 12,
      textTransform: "uppercase",
      letterSpacing: 0.5,
    },
    aidCard: {
      backgroundColor: theme.colors.surfaceAlt,
      borderRadius: 12,
      padding: 14,
      marginBottom: 10,
      borderLeftWidth: 4,
    },
    aidCategory: {
      fontSize: 10,
      color: theme.colors.muted,
      fontWeight: "600",
      textTransform: "uppercase",
      letterSpacing: 0.5,
      marginBottom: 6,
    },
    customBadge: {
      alignSelf: "flex-start",
      backgroundColor: theme.colors.primary + "20",
      paddingHorizontal: 8,
      paddingVertical: 2,
      borderRadius: 4,
      marginBottom: 6,
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
      marginBottom: 4,
    },
    aidDescription: {
      fontSize: 13,
      color: theme.colors.muted,
      lineHeight: 18,
    },
  });

export default IssueDetailModal;

