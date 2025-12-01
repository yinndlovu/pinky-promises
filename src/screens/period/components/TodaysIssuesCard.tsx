import React, { useMemo } from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Feather } from "@expo/vector-icons";
import { useTheme } from "../../../theme/ThemeContext";
import { UserIssue, PeriodProblemLabels, PeriodProblemEmojis } from "../../../types/Period";

interface Props {
  issues: UserIssue[];
  onViewIssue: (issue: UserIssue) => void;
  onLogIssue?: () => void;
  isPartnerView?: boolean;
}

const TodaysIssuesCard: React.FC<Props> = ({
  issues,
  onViewIssue,
  onLogIssue,
  isPartnerView = false,
}) => {
  const { theme } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);

  if (issues.length === 0 && !isPartnerView) {
    return (
      <View style={styles.emptyCard}>
        <Text style={styles.emptyEmoji}>✨</Text>
        <Text style={styles.emptyTitle}>No Issues Today</Text>
        <Text style={styles.emptyText}>
          Your partner hasn't logged any issues for you today
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>
          {isPartnerView ? "LOG TODAY'S ISSUES" : "TODAY'S ISSUES"}
        </Text>
        {isPartnerView && onLogIssue && (
          <TouchableOpacity onPress={onLogIssue} style={styles.addButton}>
            <Feather name="plus" size={18} color={theme.colors.primary} />
          </TouchableOpacity>
        )}
      </View>

      {issues.length === 0 && isPartnerView ? (
        <View style={styles.partnerEmpty}>
          <Text style={styles.partnerEmptyText}>
            Tap + to log what your partner is experiencing today
          </Text>
        </View>
      ) : (
        <View style={styles.card}>
          {issues.map((issue, index) => (
            <TouchableOpacity
              key={issue.id}
              style={[
                styles.issueRow,
                index === issues.length - 1 && styles.issueRowLast,
              ]}
              onPress={() => onViewIssue(issue)}
            >
              <Text style={styles.issueEmoji}>
                {PeriodProblemEmojis[issue.problem]}
              </Text>
              <View style={styles.issueContent}>
                <Text style={styles.issueName}>
                  {PeriodProblemLabels[issue.problem]}
                </Text>
                <View style={styles.severityBar}>
                  {[...Array(10)].map((_, i) => (
                    <View
                      key={i}
                      style={[
                        styles.severityDot,
                        i < issue.severity && styles.severityDotActive,
                        i < issue.severity && {
                          backgroundColor:
                            issue.severity <= 3
                              ? "#4caf50"
                              : issue.severity <= 6
                              ? "#ff9800"
                              : "#f44336",
                        },
                      ]}
                    />
                  ))}
                </View>
              </View>
              {issue.aids && issue.aids.length > 0 && (
                <View style={styles.aidsCount}>
                  <Text style={styles.aidsCountText}>
                    {issue.aids.length} tips
                  </Text>
                </View>
              )}
              <Feather
                name="chevron-right"
                size={20}
                color={theme.colors.muted}
              />
            </TouchableOpacity>
          ))}
        </View>
      )}
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
    addButton: {
      width: 32,
      height: 32,
      borderRadius: 16,
      backgroundColor: theme.colors.primary + "20",
      alignItems: "center",
      justifyContent: "center",
    },
    card: {
      backgroundColor: theme.colors.surfaceAlt,
      borderRadius: 20,
      padding: 16,
    },
    issueRow: {
      flexDirection: "row",
      alignItems: "center",
      paddingVertical: 14,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.separator,
    },
    issueRowLast: {
      borderBottomWidth: 0,
    },
    issueEmoji: {
      fontSize: 28,
      marginRight: 14,
    },
    issueContent: {
      flex: 1,
    },
    issueName: {
      fontSize: 16,
      fontWeight: "600",
      color: theme.colors.text,
      marginBottom: 6,
    },
    severityBar: {
      flexDirection: "row",
      gap: 3,
    },
    severityDot: {
      width: 8,
      height: 8,
      borderRadius: 4,
      backgroundColor: theme.colors.separator,
    },
    severityDotActive: {
      backgroundColor: theme.colors.primary,
    },
    aidsCount: {
      backgroundColor: theme.colors.primary,
      paddingHorizontal: 10,
      paddingVertical: 4,
      borderRadius: 12,
      marginRight: 8,
    },
    aidsCountText: {
      fontSize: 11,
      color: "#fff",
      fontWeight: "600",
    },
    emptyCard: {
      backgroundColor: theme.colors.surfaceAlt,
      borderRadius: 20,
      padding: 32,
      alignItems: "center",
      marginBottom: 16,
    },
    emptyEmoji: {
      fontSize: 40,
      marginBottom: 12,
    },
    emptyTitle: {
      fontSize: 18,
      fontWeight: "600",
      color: theme.colors.text,
      marginBottom: 8,
    },
    emptyText: {
      fontSize: 14,
      color: theme.colors.muted,
      textAlign: "center",
    },
    partnerEmpty: {
      backgroundColor: theme.colors.surfaceAlt,
      borderRadius: 16,
      padding: 20,
      alignItems: "center",
      borderWidth: 1,
      borderColor: theme.colors.separator,
      borderStyle: "dashed",
    },
    partnerEmptyText: {
      fontSize: 14,
      color: theme.colors.muted,
      textAlign: "center",
    },
  });

export default TodaysIssuesCard;

