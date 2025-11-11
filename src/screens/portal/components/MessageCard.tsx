// external
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  View,
  Dimensions,
} from "react-native";
import { useMemo } from "react";

// internal
import { Message } from "../../../types/Message";
import { formatDateDMYHM } from "../../../utils/formatters/formatDate";
import { useTheme } from "../../../theme/ThemeContext";

// interfaces
interface Props {
  message: Message;
  onLongPress: (msg: Message) => void;
  onPress?: (msg: Message) => void;
}

// get screen width
const screenWidth = Dimensions.get("window").width;

export default function MessageCard({ message, onLongPress, onPress }: Props) {
  // variables
  const { theme } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);

  return (
    <TouchableOpacity
      style={styles.card}
      onLongPress={() => onLongPress(message)}
      onPress={onPress ? () => onPress(message) : undefined}
      activeOpacity={0.85}
    >
      <Text style={styles.messageText}>{message.message}</Text>
      <View style={styles.metaRow}>
        <Text style={styles.date}>
          {formatDateDMYHM(message.createdAt || "")}
        </Text>
        <Text style={styles.status}>{message.seen ? "Seen" : "Sent"}</Text>
      </View>
    </TouchableOpacity>
  );
}

const createStyles = (theme: ReturnType<typeof useTheme>["theme"]) =>
  StyleSheet.create({
    card: {
      backgroundColor: theme.colors.background,
      borderRadius: 14,
      padding: 14,
      margin: 6,
      shadowColor: theme.colors.shadow,
      shadowOpacity: 0.12,
      shadowRadius: 8,
      shadowOffset: { width: 0, height: 4 },
      elevation: 3,
      width: Math.min(screenWidth * 0.9, 400),
      minWidth: 140,
    },
    messageText: {
      color: theme.colors.text,
      fontSize: 16,
      marginBottom: 8,
      fontWeight: "500",
    },
    metaRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
    },
    date: {
      color: theme.colors.muted,
      fontSize: 12,
    },
    status: {
      color: theme.colors.muted,
      fontSize: 12,
      marginLeft: 0,
    },
  });
