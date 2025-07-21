// external
import React from "react";
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  View,
  Dimensions,
} from "react-native";

// types
type Message = {
  id: string;
  message?: string;
  seen?: boolean;
  createdAt?: string;
  updatedAt?: string;
};

interface Props {
  message: Message;
  onLongPress: (msg: Message) => void;
  onPress?: (msg: Message) => void;
}

const screenWidth = Dimensions.get("window").width;

export default function MessageCard({ message, onLongPress, onPress }: Props) {
  // utils
  const formatDate = (dateStr: string) => {
    if (!dateStr) {
      return "";
    }

    const date = new Date(dateStr);

    if (isNaN(date.getTime())) {
      return dateStr;
    }

    return date
      .toLocaleString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      })
      .replace(",", "");
  };

  return (
    <TouchableOpacity
      style={styles.card}
      onLongPress={() => onLongPress(message)}
      onPress={onPress ? () => onPress(message) : undefined}
      activeOpacity={0.85}
    >
      <Text style={styles.messageText}>{message.message}</Text>
      <View style={styles.metaRow}>
        <Text style={styles.date}>{formatDate(message.createdAt || "")}</Text>
        <Text style={styles.status}>{message.seen ? "Seen" : "Sent"}</Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#23243a",
    borderRadius: 14,
    padding: 14,
    margin: 6,
    shadowColor: "#000",
    shadowOpacity: 0.12,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
    width: Math.min(screenWidth * 0.9, 400),
    minWidth: 140,
  },
  messageText: {
    color: "#fff",
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
    color: "#b0b3c6",
    fontSize: 12,
  },
  status: {
    color: "#b0b3c6",
    fontSize: 12,
    marginLeft: 0,
  },
});
