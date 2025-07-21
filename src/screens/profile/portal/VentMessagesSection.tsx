import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Message } from "../../../types/types";
import MessageList from "./MessageList";

interface Props {
  sent: Message[];
  received: Message[];
  onLongPress: (msg: Message) => void;
}

export default function VentMessagesSection({
  sent,
  received,
  onLongPress,
}: Props) {
  // variables
  const unviewed = received.find((m) => !m.viewed);

  return (
    <View>
      <Text style={styles.sectionTitle}>Vent Messages</Text>
      {unviewed && (
        <View style={styles.banner}>
          <Text style={styles.bannerText}>You have a vent message!</Text>
          <TouchableOpacity style={styles.viewButton}>
            <Text style={styles.viewButtonText}>View</Text>
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

const styles = StyleSheet.create({
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginTop: 16,
    marginBottom: 10,
    color: "#dce0f7",
  },
  subTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginTop: 12,
    color: "#b0b3c6",
  },
  banner: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#1b1c2e",
    padding: 20,
    borderRadius: 10,
    marginVertical: 10,
    justifyContent: "space-between",
  },
  bannerText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 16,
  },
  viewButton: {
    marginLeft: 12,
    backgroundColor: "#e03487", 
    paddingVertical: 7,
    paddingHorizontal: 18,
    borderRadius: 8,
  },
  viewButtonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 15,
  },
  emptyText: {
    color: "#b0b3c6",
    fontStyle: "italic",
    marginVertical: 8,
    marginLeft: 8,
  },
});
