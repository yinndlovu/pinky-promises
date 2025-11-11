// external
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useMemo } from "react";

// content
import MessageList from "../components/MessageList";

// internal
import { VentMessageProps } from "../../../interfaces/PortalMessage";
import { useTheme } from "../../../theme/ThemeContext";

export default function VentMessagesSection({
  sent,
  received,
  onLongPress,
  onAdd,
  onViewMessage,
  lastUnseen,
}: VentMessageProps) {
  // variables
  const unviewed = lastUnseen;
  const { theme } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);

  return (
    <View>
      <View style={styles.titleRow}>
        <Text style={styles.sectionTitle}>Vent Messages</Text>
        <TouchableOpacity style={styles.plusButton} onPress={onAdd}>
          <Ionicons name="add" size={20} color={theme.colors.text} />
        </TouchableOpacity>
      </View>
      {unviewed && (
        <View style={styles.banner}>
          <Text style={styles.bannerText}>You have a vent message!</Text>
          <TouchableOpacity style={styles.viewButton}>
            <Text
              style={styles.viewButtonText}
              onPress={() => onViewMessage(unviewed)}
            >
              View
            </Text>
          </TouchableOpacity>
        </View>
      )}
      <Text style={styles.subTitle}>Most recent sent</Text>
      {sent[0] ? (
        <MessageList messages={[sent[0]]} onLongPress={onLongPress} />
      ) : (
        <Text style={styles.emptyText}>You haven't vented recently</Text>
      )}
      <Text style={styles.subTitle}>Last six sent</Text>
      {sent.length > 0 ? (
        <MessageList messages={sent.slice(0, 6)} onLongPress={onLongPress} />
      ) : (
        <Text style={styles.emptyText}>You haven't vented yet</Text>
      )}
    </View>
  );
}

const createStyles = (theme: ReturnType<typeof useTheme>["theme"]) =>
  StyleSheet.create({
    sectionTitle: {
      fontSize: 20,
      fontWeight: "bold",
      marginTop: 25,
      marginBottom: 10,
      color: theme.colors.muted,
    },
    subTitle: {
      fontSize: 16,
      fontWeight: "600",
      marginTop: 12,
      color: theme.colors.mutedAlt,
    },
    titleRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      marginBottom: 4,
      marginTop: 20,
    },
    plusButton: {
      backgroundColor: "#3b82f6",
      borderRadius: 16,
      width: 32,
      height: 32,
      alignItems: "center",
      justifyContent: "center",
      marginLeft: 8,
    },
    banner: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: theme.colors.surfaceAlt,
      padding: 20,
      borderRadius: 10,
      marginVertical: 10,
      justifyContent: "space-between",
    },
    bannerText: {
      color: theme.colors.text,
      fontWeight: "600",
      fontSize: 16,
    },
    viewButton: {
      marginLeft: 12,
      backgroundColor: theme.colors.primary,
      paddingVertical: 7,
      paddingHorizontal: 18,
      borderRadius: 8,
    },
    viewButtonText: {
      color: theme.colors.text,
      fontWeight: "bold",
      fontSize: 15,
    },
    emptyText: {
      color: theme.colors.muted,
      fontStyle: "italic",
      marginVertical: 8,
      marginLeft: 8,
    },
  });
