// external
import React, { useMemo } from "react";
import { View, Text, StyleSheet } from "react-native";
import { TouchableOpacity } from "react-native";
import { Feather } from "@expo/vector-icons";

// internal
import { LoveLanguageProps } from "../../../../types/LoveLanguage";
import { useTheme } from "../../../../theme/ThemeContext";

const LoveLanguage: React.FC<LoveLanguageProps> = ({
  loveLanguage = "",
  onEdit,
}) => {
  // variables
  const { theme } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);

  return (
    <View style={styles.wrapper}>
      <View style={styles.headerRow}>
        <Text style={styles.label}>Love language</Text>
        <TouchableOpacity style={styles.editButton} onPress={onEdit}>
          <Feather name="edit-2" size={18} color={theme.colors.primary} />
        </TouchableOpacity>
      </View>
      <View style={styles.valueRow}>
        <Text style={loveLanguage ? styles.value : styles.noValue}>
          {loveLanguage ? loveLanguage : "No love language added"}
        </Text>
      </View>
    </View>
  );
};

const createStyles = (theme: ReturnType<typeof useTheme>["theme"]) =>
  StyleSheet.create({
    wrapper: {
      width: "100%",
      marginBottom: 18,
    },
    headerRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      marginBottom: 4,
    },
    row: {
      marginTop: 0,
      marginBottom: 4,
    },
    label: {
      fontSize: 18,
      color: theme.colors.muted,
      fontWeight: "bold",
      marginBottom: 2,
    },
    valueRow: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: 8,
    },
    value: {
      fontSize: 16,
      color: theme.colors.text,
      fontWeight: "bold",
    },
    editButton: {
      backgroundColor: "transparent",
      borderRadius: 8,
      paddingVertical: 4,
      paddingHorizontal: 12,
      alignItems: "center",
      justifyContent: "center",
    },
    noValue: {
      color: theme.colors.muted,
      fontSize: 16,
      fontStyle: "italic",
      textAlign: "center",
    },
  });

export default LoveLanguage;
