import { StyleSheet } from "react-native";
import type { lightTheme } from "../../../../theme/themes";

type AppTheme = typeof lightTheme;

export const createUserProfileStyles = (theme: AppTheme) =>
  StyleSheet.create({
    container: {
      backgroundColor: theme.colors.background,
      paddingHorizontal: 16,
    },
    header: {
      width: "100%",
      alignItems: "center",
      marginBottom: 36,
    },
    headerTitle: {
      fontSize: 28,
      fontWeight: "bold",
      color: theme.colors.text,
      letterSpacing: 1,
    },
    profileRow: {
      flexDirection: "row",
      alignItems: "center",
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
      backgroundColor: theme.colors.surfaceAlt,
      marginVertical: 24,
      opacity: 1,
    },
    centered: {
      flex: 1,
      backgroundColor: theme.colors.background,
      alignItems: "center",
      justifyContent: "center",
    },
    partnerButton: {
      borderRadius: 25,
      paddingVertical: 15,
      paddingHorizontal: 30,
      alignItems: "center",
      justifyContent: "center",
      marginTop: 20,
      shadowOffset: {
        width: 0,
        height: 4,
      },
      shadowOpacity: 0.3,
      shadowRadius: 8,
      elevation: 8,
    },
    addPartnerButton: {
      backgroundColor: theme.colors.primary,
      shadowColor: theme.colors.primary,
    },
    cancelButton: {
      backgroundColor: "#ff6b6b",
      shadowColor: "#ff6b6b",
    },
    acceptButton: {
      backgroundColor: "#51cf66",
      shadowColor: "#51cf66",
    },
    partnerButtonDisabled: {
      backgroundColor: theme.colors.primaryMuted,
      shadowOpacity: 0.1,
    },
    partnerButtonText: {
      color: "#fff",
      fontSize: 18,
      fontWeight: "bold",
      letterSpacing: 0.5,
    },
  });
