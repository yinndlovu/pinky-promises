// external
import { useMemo } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  Dimensions,
} from "react-native";

// internal
import { formatDateDMYHM } from "../../../../utils/formatters/formatDate";
import {
  StoredMessage,
  PartnerMessageStorageProps,
} from "../../../../interfaces/MessageStorage";
import { getTrimmedText } from "../../../../helpers/profileHelpers";
import { useTheme } from "../../../../theme/ThemeContext";

const screenWidth = Dimensions.get("window").width;

export default function PartnerMessageStorage({
  name,
  messages,
  onPress,
}: PartnerMessageStorageProps) {
  // variables
  const { theme } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);

  function MessageCard({ message }: { message: StoredMessage }) {
    return (
      <TouchableOpacity
        style={styles.card}
        onPress={onPress ? () => onPress(message) : undefined}
        activeOpacity={0.85}
      >
        <Text style={styles.title}>{message.title}</Text>
        <Text style={styles.messageText}>
          {getTrimmedText(message.message)}
        </Text>
        <Text style={styles.date}>{formatDateDMYHM(message.createdAt)}</Text>
      </TouchableOpacity>
    );
  }

  return (
    <View style={styles.wrapper}>
      <View style={styles.headerRow}>
        <Text style={styles.headerText}>Message storage</Text>
      </View>
      <Text style={styles.description}>
        {name}'s favorite messages from you
      </Text>

      <FlatList
        data={messages}
        keyExtractor={(item) => item.id}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
        renderItem={({ item }) => <MessageCard message={item} />}
      />
    </View>
  );
}

const createStyles = (theme: ReturnType<typeof useTheme>["theme"]) =>
  StyleSheet.create({
    wrapper: {
      marginBottom: 60,
    },
    headerRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 2,
    },
    description: {
      color: theme.colors.muted,
      fontSize: 15,
      marginTop: 5,
    },
    headerText: {
      fontSize: 18,
      fontWeight: "bold",
      color: theme.colors.muted,
      marginBottom: 1,
    },
    plusButton: {
      backgroundColor: theme.colors.primary,
      borderRadius: 20,
      width: 26,
      height: 26,
      justifyContent: "center",
      alignItems: "center",
      marginRight: 8,
    },
    plusText: {
      color: theme.colors.text,
      fontSize: 16,
      lineHeight: 24,
      marginTop: -2,
    },
    listContent: {},
    card: {
      backgroundColor: theme.colors.background,
      borderRadius: 14,
      marginBottom: 12,
      marginRight: 12,
      marginTop: 16,
      width: Math.min(screenWidth * 0.75, 300),
      shadowColor: theme.colors.shadow,
      shadowOpacity: 0.2,
      shadowRadius: 8,
      shadowOffset: { width: 0, height: 4 },
      elevation: 3,
      borderWidth: 0.7,
      borderColor: theme.colors.surfaceAlt,
    },
    title: {
      color: theme.colors.text,
      fontSize: 15,
      fontWeight: "700",
      marginBottom: 6,
      marginTop: 6,
      paddingHorizontal: 10,
    },
    messageText: {
      color: theme.colors.text,
      fontSize: 14,
      paddingHorizontal: 10,
      marginBottom: 4,
      fontWeight: "500",
    },
    date: {
      color: theme.colors.muted,
      fontSize: 11,
      textAlign: "left",
      padding: 9,
    },
  });
