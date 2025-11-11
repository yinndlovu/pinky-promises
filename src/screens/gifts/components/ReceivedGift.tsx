// external
import React, { useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { FontAwesome6 } from "@expo/vector-icons";

// internal
import { ReceivedGiftProps } from "../../../types/Gift";
import { useTheme } from "../../../theme/ThemeContext";

const ReceivedGift: React.FC<ReceivedGiftProps> = ({
  giftName,
  receivedAt,
  onClaim,
  claiming,
}) => {
  // variables
  const { theme } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);

  return (
    <View style={styles.card}>
      <View style={styles.row}>
        <FontAwesome6
          name="gift"
          size={22}
          color={theme.colors.primary}
          style={{ marginRight: 10 }}
        />
        <Text style={styles.title}>You received a present</Text>
      </View>
      <Text style={styles.giftName}>{giftName}</Text>
      <Text style={styles.dateText}>{receivedAt}</Text>
      <TouchableOpacity
        style={styles.claimButton}
        onPress={onClaim}
        disabled={claiming}
      >
        {claiming ? (
          <ActivityIndicator color={theme.colors.text} />
        ) : (
          <Text style={styles.claimButtonText}>Open</Text>
        )}
      </TouchableOpacity>
    </View>
  );
};

const createStyles = (theme: ReturnType<typeof useTheme>["theme"]) =>
  StyleSheet.create({
    card: {
      backgroundColor: theme.colors.background,
      borderRadius: 14,
      padding: 20,
      shadowColor: theme.colors.shadow,
      shadowOpacity: 0.5,
      shadowRadius: 4,
      elevation: 4,
      marginBottom: 24,
      alignItems: "flex-start",
      width: "100%",
    },
    row: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: 8,
    },
    title: {
      color: theme.colors.text,
      fontSize: 17,
      fontWeight: "bold",
      letterSpacing: 0.5,
    },
    giftName: {
      color: theme.colors.primary,
      fontSize: 16,
      fontWeight: "bold",
      marginBottom: 6,
      marginLeft: 2,
    },
    dateText: {
      color: theme.colors.muted,
      fontSize: 13,
      marginBottom: 16,
      marginLeft: 2,
    },
    claimButton: {
      backgroundColor: theme.colors.primary,
      borderRadius: 8,
      paddingVertical: 8,
      paddingHorizontal: 28,
      alignItems: "center",
      alignSelf: "flex-start",
    },
    claimButtonText: {
      color: theme.colors.text,
      fontWeight: "bold",
      fontSize: 16,
      letterSpacing: 1,
    },
  });

export default ReceivedGift;
