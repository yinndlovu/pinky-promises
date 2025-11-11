// external
import React, { useMemo } from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";

// internal
import { SetMonthlyGiftProps } from "../../../types/Gift";
import { useTheme } from "../../../theme/ThemeContext";

const SetMonthlyGift: React.FC<SetMonthlyGiftProps> = ({
  giftName,
  onChange,
  buttonText = "Change",
}) => {
  // variables
  const { theme } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);

  return (
    <View style={styles.card}>
      <Text style={styles.tip}>YOUR FAVORITE PRESENT</Text>
      <Text style={styles.giftName}>{giftName}</Text>
      <TouchableOpacity style={styles.changeButton} onPress={onChange}>
        <Text style={styles.changeButtonText}>{buttonText}</Text>
      </TouchableOpacity>
    </View>
  );
};

const createStyles = (theme: ReturnType<typeof useTheme>["theme"]) =>
  StyleSheet.create({
    card: {
      backgroundColor: theme.colors.surfaceAlt,
      borderRadius: 16,
      paddingVertical: 24,
      paddingHorizontal: 20,
      marginBottom: 24,
      alignItems: "center",
      width: "100%",
      shadowColor: theme.colors.shadow,
      shadowOpacity: 0.08,
      shadowRadius: 8,
      elevation: 2,
    },
    tip: {
      fontSize: 13,
      color: theme.colors.muted,
      letterSpacing: 1,
      textTransform: "uppercase",
      marginBottom: 8,
      opacity: 0.7,
      fontWeight: "bold",
    },
    giftName: {
      fontSize: 22,
      color: theme.colors.text,
      fontWeight: "bold",
      marginBottom: 18,
      textAlign: "center",
    },
    changeButton: {
      backgroundColor: theme.colors.primary,
      borderRadius: 8,
      paddingVertical: 8,
      paddingHorizontal: 28,
      alignItems: "center",
      justifyContent: "center",
    },
    changeButtonText: {
      color: theme.colors.text,
      fontWeight: "bold",
      fontSize: 16,
      letterSpacing: 1,
    },
  });

export default SetMonthlyGift;
