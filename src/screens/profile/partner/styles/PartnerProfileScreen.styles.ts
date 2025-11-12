import { StyleSheet } from "react-native";
import type { lightTheme } from "../../../../theme/themes";

type AppTheme = typeof lightTheme;

export const createPartnerProfileStyles = (theme: AppTheme) =>
  StyleSheet.create({
    container: {
      backgroundColor: theme.colors.background,
      paddingHorizontal: 16,
    },
    portalIcon: {
      position: "absolute",
      top: 16,
      right: 20,
      zIndex: 100,
      backgroundColor: theme.colors.background,
      borderRadius: 20,
      padding: 4,
    },
    profileRow: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: 20,
      marginTop: 0,
    },
    avatarWrapper: {
      marginRight: 20,
    },
    avatar: {
      width: 90,
      height: 90,
      borderRadius: 45,
      borderWidth: 2,
      borderColor: theme.colors.surface,
    },
    infoWrapper: {
      flex: 1,
      justifyContent: "center",
    },
    name: {
      fontSize: 24,
      fontWeight: "bold",
      color: theme.colors.text,
      marginBottom: 0,
    },
    username: {
      fontSize: 16,
      color: theme.colors.primary,
      marginBottom: 8,
      marginLeft: 4,
    },
    bio: {
      fontSize: 15,
      color: theme.colors.text,
      textAlign: "left",
    },
    divider: {
      width: "100%",
      height: 1,
      backgroundColor: theme.colors.separator,
      marginVertical: 0,
      opacity: 1,
    },
    partnerRow: {
      marginBottom: 20,
      marginLeft: 20,
      marginRight: 20,
      alignItems: "center",
      marginTop: 20,
      flexDirection: "row",
      justifyContent: "space-between",
    },
    distanceText: {
      fontWeight: "800",
      color: theme.colors.muted,
    },
    apartText: {
      color: theme.colors.muted,
      fontWeight: "500",
    },
    partnerText: {
      color: theme.colors.muted,
      fontSize: 15,
      fontWeight: "500",
      textAlign: "center",
    },
    partnerName: {
      color: theme.colors.muted,
      fontWeight: "bold",
    },
    centered: {
      flex: 1,
      backgroundColor: theme.colors.background,
      alignItems: "center",
      justifyContent: "center",
    },
    removeButton: {
      backgroundColor: "#e02222",
      borderRadius: 8,
      paddingVertical: 8,
      paddingHorizontal: 16,
      alignItems: "center",
      justifyContent: "center",
      marginLeft: 12,
    },
    removeButtonText: {
      color: theme.colors.text,
      fontWeight: "bold",
      fontSize: 14,
      letterSpacing: 0.5,
    },
  });
