// external
import React, { useMemo } from "react";
import { View, Text, StyleSheet } from "react-native";

// internal
import { PartnerAboutProps } from "../../../../types/About";
import { useTheme } from "../../../../theme/ThemeContext";

const PartnerMoreAboutYou: React.FC<PartnerAboutProps> = ({ about = "" }) => {
  // variables
  const { theme } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);

  return (
    <View style={styles.wrapper}>
      <View style={styles.headerRow}>
        <Text style={styles.label}>More about you</Text>
      </View>
      <View style={styles.valueRow}>
        {!about ? (
          <Text style={styles.noInfoText}>No info added yet</Text>
        ) : (
          <Text style={styles.value}>{about}</Text>
        )}
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
    noInfoText: {
      color: theme.colors.muted,
      fontSize: 16,
      textAlign: "center",
      marginVertical: 0,
    },
  });

export default PartnerMoreAboutYou;
