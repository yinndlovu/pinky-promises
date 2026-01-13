import React, { useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Feather } from "@expo/vector-icons";
import { useTheme } from "../../../theme/ThemeContext";
import { PeriodStatus } from "../../../types/Period";

interface Props {
  status: PeriodStatus;
  onStartPeriod?: () => void;
  onEndPeriod?: () => void;
  isPartnerView?: boolean;
  loading?: boolean;
}

const PeriodStatusCard: React.FC<Props> = ({
  status,
  onStartPeriod,
  onEndPeriod,
  isPartnerView = false,
  loading = false,
}) => {
  const { theme } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const expectedPeriodLength =
    status.expectedEndDay ??
    status.cycle?.periodLength ??
    status.lastCycle?.periodLength ??
    5;

  const getStatusContent = () => {
    switch (status.status) {
      case "on_period":
        return {
          emoji: "🌸",
          label: isPartnerView ? "PARTNER'S PERIOD" : "CURRENTLY ON PERIOD",
          days: (status.daysSinceStart || 0) + 1,
          subtext: `Day ${
            (status.daysSinceStart || 0) + 1
          } of ~${expectedPeriodLength}`,
          gradientColors: ["#ff6b9d", "#c44569"] as [string, string],
          chipText: "On Period",
          chipBg: "#ff6b9d20",
          chipColor: "#ff6b9d",
          action: onEndPeriod,
          actionText: "End Period",
        };
      case "waiting":
        return {
          emoji: "🌷",
          label: isPartnerView ? "PARTNER'S NEXT PERIOD" : "DAYS UNTIL PERIOD",
          days: status.daysUntilNext || 0,
          subtext: status.expectedDate
            ? `Expected: ${new Date(status.expectedDate).toLocaleDateString(
                "en-US",
                {
                  month: "short",
                  day: "numeric",
                }
              )}`
            : "Waiting",
          gradientColors: ["#a29bfe", "#6c5ce7"] as [string, string],
          chipText: "Not on Period",
          chipBg: "#a29bfe20",
          chipColor: "#a29bfe",
          action: isPartnerView ? onStartPeriod : null,
          actionText: "Log Period Start",
        };
      case "late":
        return {
          emoji: "⏰",
          label: isPartnerView ? "PARTNER'S PERIOD LATE" : "PERIOD IS LATE",
          days: status.daysLate || 0,
          subtext: `Was expected ${status.daysLate} day${
            (status.daysLate || 0) > 1 ? "s" : ""
          } ago`,
          gradientColors: ["#fd79a8", "#e84393"] as [string, string],
          chipText: `${status.daysLate} Days Late`,
          chipBg: "#fd79a820",
          chipColor: "#fd79a8",
          action: isPartnerView ? onStartPeriod : null,
          actionText: "Log Period Start",
        };
      case "no_data":
      default:
        return {
          emoji: "🌺",
          label: "NO PERIOD DATA",
          days: "—",
          subtext: isPartnerView
            ? "Start tracking your partner's period"
            : "Your partner will log your period",
          gradientColors: ["#dfe6e9", "#b2bec3"] as [string, string],
          chipText: "Not Tracked",
          chipBg: "#dfe6e920",
          chipColor: "#b2bec3",
          action: isPartnerView ? onStartPeriod : null,
          actionText: "Start Tracking",
        };
    }
  };

  const content = getStatusContent();

  return (
    <View style={styles.card}>
      <LinearGradient
        colors={content.gradientColors}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.gradient}
      />
      <Text style={styles.emoji}>{content.emoji}</Text>
      <Text style={styles.label}>{content.label}</Text>
      <Text style={styles.days}>
        {typeof content.days === "number" ? content.days : content.days}
      </Text>
      <Text style={styles.subtext}>{content.subtext}</Text>
      <View style={[styles.chip, { backgroundColor: content.chipBg }]}>
        <Text style={[styles.chipText, { color: content.chipColor }]}>
          {content.chipText}
        </Text>
      </View>
      {content.action && (
        <TouchableOpacity
          style={[
            styles.actionButton,
            { backgroundColor: content.gradientColors[0] },
            loading && styles.actionButtonDisabled,
          ]}
          onPress={content.action}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" size="small" />
          ) : (
            <>
              <Feather
                name="plus"
                size={16}
                color="#fff"
                style={{ marginRight: 6 }}
              />
              <Text style={styles.actionButtonText}>{content.actionText}</Text>
            </>
          )}
        </TouchableOpacity>
      )}
    </View>
  );
};

const createStyles = (theme: any) =>
  StyleSheet.create({
    card: {
      backgroundColor: theme.colors.surfaceAlt,
      borderRadius: 24,
      padding: 24,
      marginBottom: 20,
      alignItems: "center",
      shadowColor: theme.colors.shadow,
      shadowOpacity: 0.1,
      shadowRadius: 12,
      elevation: 4,
      overflow: "hidden",
    },
    gradient: {
      position: "absolute",
      top: 0,
      left: 0,
      right: 0,
      height: 4,
      borderTopLeftRadius: 24,
      borderTopRightRadius: 24,
    },
    emoji: {
      fontSize: 48,
      marginBottom: 12,
      marginTop: 8,
    },
    label: {
      fontSize: 12,
      color: theme.colors.muted,
      letterSpacing: 1.5,
      textTransform: "uppercase",
      marginBottom: 4,
      fontWeight: "600",
    },
    days: {
      fontSize: 56,
      fontWeight: "800",
      color: theme.colors.text,
      marginBottom: 4,
    },
    subtext: {
      fontSize: 15,
      color: theme.colors.muted,
      marginBottom: 16,
    },
    chip: {
      paddingHorizontal: 16,
      paddingVertical: 8,
      borderRadius: 20,
    },
    chipText: {
      fontSize: 14,
      fontWeight: "600",
    },
    actionButton: {
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: 20,
      paddingVertical: 12,
      borderRadius: 24,
      marginTop: 16,
    },
    actionButtonText: {
      color: "#fff",
      fontSize: 15,
      fontWeight: "600",
    },
    actionButtonDisabled: {
      opacity: 0.7,
    },
  });

export default PeriodStatusCard;
