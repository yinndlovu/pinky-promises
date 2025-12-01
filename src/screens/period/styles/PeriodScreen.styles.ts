import { StyleSheet } from "react-native";

export const createPeriodStyles = (theme: any) =>
  StyleSheet.create({
    container: {
      paddingHorizontal: 16,
      paddingTop: 12,
      paddingBottom: 32,
      backgroundColor: theme.colors.background,
      minHeight: "100%",
    },
    
    // Status Card
    statusCard: {
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
    statusGradient: {
      position: "absolute",
      top: 0,
      left: 0,
      right: 0,
      height: 4,
      borderTopLeftRadius: 24,
      borderTopRightRadius: 24,
    },
    statusEmoji: {
      fontSize: 48,
      marginBottom: 12,
    },
    statusLabel: {
      fontSize: 13,
      color: theme.colors.muted,
      letterSpacing: 1.5,
      textTransform: "uppercase",
      marginBottom: 4,
      fontWeight: "600",
    },
    statusDays: {
      fontSize: 42,
      fontWeight: "800",
      color: theme.colors.text,
      marginBottom: 4,
    },
    statusSubtext: {
      fontSize: 15,
      color: theme.colors.muted,
      marginBottom: 16,
    },
    statusChip: {
      paddingHorizontal: 16,
      paddingVertical: 8,
      borderRadius: 20,
      marginTop: 8,
    },
    statusChipText: {
      fontSize: 14,
      fontWeight: "600",
    },
    
    // Section Headers
    sectionHeader: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      marginTop: 24,
      marginBottom: 12,
    },
    sectionTitle: {
      fontSize: 13,
      color: theme.colors.muted,
      letterSpacing: 1.5,
      textTransform: "uppercase",
      fontWeight: "700",
    },
    sectionSeeAll: {
      fontSize: 13,
      color: theme.colors.primary,
      fontWeight: "600",
    },
    
    // Issues Card
    issuesCard: {
      backgroundColor: theme.colors.surfaceAlt,
      borderRadius: 20,
      padding: 16,
      marginBottom: 8,
    },
    issueRow: {
      flexDirection: "row",
      alignItems: "center",
      paddingVertical: 12,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.separator,
    },
    issueRowLast: {
      borderBottomWidth: 0,
    },
    issueEmoji: {
      fontSize: 24,
      marginRight: 12,
    },
    issueContent: {
      flex: 1,
    },
    issueName: {
      fontSize: 16,
      fontWeight: "600",
      color: theme.colors.text,
      marginBottom: 2,
    },
    issueSeverity: {
      fontSize: 12,
      color: theme.colors.muted,
    },
    issueAidsCount: {
      backgroundColor: theme.colors.primary,
      paddingHorizontal: 10,
      paddingVertical: 4,
      borderRadius: 12,
    },
    issueAidsCountText: {
      fontSize: 12,
      color: "#fff",
      fontWeight: "600",
    },
    
    // Aid Cards
    aidCard: {
      backgroundColor: theme.colors.surfaceAlt,
      borderRadius: 16,
      padding: 16,
      marginBottom: 12,
      borderLeftWidth: 4,
    },
    aidHeader: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: 8,
    },
    aidIcon: {
      width: 32,
      height: 32,
      borderRadius: 8,
      alignItems: "center",
      justifyContent: "center",
      marginRight: 12,
    },
    aidCategory: {
      fontSize: 11,
      color: theme.colors.muted,
      letterSpacing: 0.5,
      textTransform: "uppercase",
      fontWeight: "600",
    },
    aidTitle: {
      fontSize: 16,
      fontWeight: "600",
      color: theme.colors.text,
      marginBottom: 6,
    },
    aidDescription: {
      fontSize: 14,
      color: theme.colors.muted,
      lineHeight: 20,
    },
    
    // Lookout Cards
    lookoutCard: {
      backgroundColor: theme.colors.surfaceAlt,
      borderRadius: 16,
      padding: 16,
      marginBottom: 12,
      borderWidth: 1,
      borderColor: theme.colors.primary + "40",
    },
    lookoutHeader: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: 8,
    },
    lookoutBadge: {
      backgroundColor: theme.colors.primary + "20",
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 8,
      marginRight: 8,
    },
    lookoutBadgeText: {
      fontSize: 10,
      color: theme.colors.primary,
      fontWeight: "700",
      letterSpacing: 0.5,
    },
    lookoutTitle: {
      fontSize: 16,
      fontWeight: "600",
      color: theme.colors.text,
      flex: 1,
    },
    lookoutDescription: {
      fontSize: 14,
      color: theme.colors.muted,
      lineHeight: 20,
    },
    lookoutDismiss: {
      marginTop: 12,
      alignSelf: "flex-end",
    },
    lookoutDismissText: {
      fontSize: 13,
      color: theme.colors.primary,
      fontWeight: "600",
    },
    
    // Previous Cycle Card
    previousCycleCard: {
      backgroundColor: theme.colors.surfaceAlt,
      borderRadius: 20,
      padding: 20,
      marginBottom: 16,
    },
    previousCycleHeader: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: 16,
    },
    previousCycleIcon: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: theme.colors.primary + "20",
      alignItems: "center",
      justifyContent: "center",
      marginRight: 12,
    },
    previousCycleTitle: {
      fontSize: 16,
      fontWeight: "700",
      color: theme.colors.text,
    },
    previousCycleSubtitle: {
      fontSize: 13,
      color: theme.colors.muted,
    },
    previousCycleStats: {
      flexDirection: "row",
      justifyContent: "space-around",
    },
    previousCycleStat: {
      alignItems: "center",
    },
    previousCycleStatValue: {
      fontSize: 24,
      fontWeight: "700",
      color: theme.colors.text,
    },
    previousCycleStatLabel: {
      fontSize: 11,
      color: theme.colors.muted,
      marginTop: 4,
      textTransform: "uppercase",
      letterSpacing: 0.5,
    },
    
    // Empty State
    emptyState: {
      alignItems: "center",
      paddingVertical: 40,
      paddingHorizontal: 24,
      backgroundColor: theme.colors.surfaceAlt,
      borderRadius: 24,
      marginBottom: 20,
    },
    emptyStateEmoji: {
      fontSize: 56,
      marginBottom: 16,
    },
    emptyStateTitle: {
      fontSize: 20,
      fontWeight: "700",
      color: theme.colors.text,
      marginBottom: 12,
      textAlign: "center",
    },
    emptyStateText: {
      fontSize: 15,
      color: theme.colors.muted,
      textAlign: "center",
      lineHeight: 22,
      maxWidth: 280,
    },
    
    // Quick Actions
    quickActions: {
      flexDirection: "row",
      justifyContent: "space-between",
      marginBottom: 20,
    },
    quickAction: {
      flex: 1,
      backgroundColor: theme.colors.surfaceAlt,
      borderRadius: 16,
      padding: 16,
      alignItems: "center",
      marginHorizontal: 4,
    },
    quickActionIcon: {
      width: 44,
      height: 44,
      borderRadius: 22,
      alignItems: "center",
      justifyContent: "center",
      marginBottom: 8,
    },
    quickActionText: {
      fontSize: 12,
      fontWeight: "600",
      color: theme.colors.text,
      textAlign: "center",
    },
    
    // Toast
    toast: {
      position: "absolute",
      bottom: 10,
      left: 20,
      right: 20,
      backgroundColor: theme.colors.primary,
      padding: 14,
      borderRadius: 10,
      alignItems: "center",
      zIndex: 100,
      shadowColor: theme.colors.shadow,
      shadowOpacity: 0.2,
      shadowRadius: 8,
      elevation: 8,
    },
    toastText: {
      color: "#fff",
      fontWeight: "bold",
      fontSize: 16,
    },
  });

