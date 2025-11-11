import { StyleSheet } from "react-native";
import type { lightTheme } from "../../../../theme/themes";

type AppTheme = typeof lightTheme;

export const createModalStyles = (theme: AppTheme) =>
  StyleSheet.create({
    modalOverlay: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: theme.colors.absoluteFillObject,
      justifyContent: "center",
      alignItems: "center",
      zIndex: 1000,
    },
    modalContent: {
      backgroundColor: theme.colors.background,
      borderRadius: 16,
      padding: 20,
      alignItems: "center",
      width: "95%",
      shadowColor: theme.colors.shadow,
      shadowOpacity: 0.2,
      shadowRadius: 10,
      elevation: 5,
    },
    modalHeader: {
      flexDirection: "row",
      alignItems: "center",
      width: "100%",
      marginBottom: 18,
      justifyContent: "space-between",
    },
    modalTitle: {
      color: theme.colors.text,
      fontSize: 18,
      fontWeight: "bold",
      textAlign: "left",
      flex: 1,
    },
    closeButton: {
      marginLeft: 12,
      padding: 4,
    },
    form: {
      width: "100%",
      marginBottom: 18,
    },
    label: {
      color: theme.colors.muted,
      fontSize: 14,
      marginBottom: 6,
      fontWeight: "bold",
    },
    input: {
      backgroundColor: theme.colors.surface,
      color: theme.colors.text,
      borderRadius: 8,
      paddingVertical: 10,
      paddingHorizontal: 14,
      fontSize: 16,
      marginBottom: 16,
    },
    textArea: {
      minHeight: 160,
      textAlignVertical: "top",
    },
    modalActions: {
      flexDirection: "row",
      justifyContent: "space-between",
      width: "100%",
      marginTop: 8,
    },
    cancelButton: {
      backgroundColor: theme.colors.border,
      borderRadius: 8,
      paddingVertical: 12,
      alignItems: "center",
      borderColor: theme.colors.muted,
      marginLeft: 8,
      flex: 1,
    },
    cancelButtonText: {
      color: theme.colors.text,
      fontWeight: "bold",
      fontSize: 15,
    },
    saveButton: {
      backgroundColor: theme.colors.primary,
      borderRadius: 8,
      paddingVertical: 12,
      alignItems: "center",
      flex: 1,
    },
    saveButtonDisabled: {
      opacity: 0.6,
    },
    saveButtonText: {
      color: theme.colors.text,
      fontWeight: "bold",
      fontSize: 15,
    },
  });
