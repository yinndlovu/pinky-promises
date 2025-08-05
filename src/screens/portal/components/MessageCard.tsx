// external
import React from "react";
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  View,
  Dimensions,
} from "react-native";

// internal
import { Message } from "../../../types/Message";
import { formatDateDMYHM } from "../../../utils/formatDateHelper";

// interfaces
interface Props {
  message: Message;
  onLongPress: (msg: Message) => void;
  onPress?: (msg: Message) => void;
}

// get screen width
const screenWidth = Dimensions.get("window").width;

export default function MessageCard({ message, onLongPress, onPress }: Props) {
  return (
    <TouchableOpacity
      style={styles.card}
      onLongPress={() => onLongPress(message)}
      onPress={onPress ? () => onPress(message) : undefined}
      activeOpacity={0.85}
    >
      <Text style={styles.messageText}>{message.message}</Text>
      <View style={styles.metaRow}>
        <Text style={styles.date}>{formatDateDMYHM(message.createdAt || "")}</Text>
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
    elevation: 3,
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
