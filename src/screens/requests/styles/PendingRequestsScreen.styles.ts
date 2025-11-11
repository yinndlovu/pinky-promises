import { StyleSheet } from "react-native";
import type { lightTheme } from "../../../theme/themes";

type AppTheme = typeof lightTheme;

export const createPendingRequestsStyles = (theme: AppTheme) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    listContainer: {
      padding: 16,
    },
    requestItem: {
      backgroundColor: theme.colors.surface,
      borderRadius: 12,
      padding: 16,
      marginBottom: 12,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
    },
    userInfo: {
      flexDirection: "row",
      alignItems: "center",
      flex: 1,
    },
    avatar: {
      width: 50,
      height: 50,
      borderRadius: 25,
      marginRight: 12,
      borderWidth: 2,
      borderColor: theme.colors.surface,
    },
    userDetails: {
      flex: 1,
    },
    username: {
      fontSize: 16,
      fontWeight: "bold",
      color: theme.colors.text,
      marginBottom: 4,
    },
    requestText: {
      fontSize: 14,
      color: theme.colors.muted,
    },
    actions: {
      flexDirection: "row",
      gap: 8,
    },
    actionButton: {
      paddingVertical: 8,
      paddingHorizontal: 16,
      borderRadius: 20,
      minWidth: 70,
      alignItems: "center",
    },
    acceptButton: {
      backgroundColor: "#51cf66",
    },
    declineButton: {
      backgroundColor: "#ff6b6b",
    },
    actionButtonText: {
      color: theme.colors.text,
      fontSize: 14,
      fontWeight: "bold",
    },
    emptyContainer: {
      alignItems: "center",
      justifyContent: "center",
      paddingVertical: 60,
    },
    emptyText: {
      color: theme.colors.muted,
      fontSize: 16,
    },
    centered: {
      flex: 1,
      backgroundColor: theme.colors.background,
      alignItems: "center",
      justifyContent: "center",
    },
  });
