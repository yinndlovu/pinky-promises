import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Message } from "../../../types/types";
import MessageList from "./MessageList";

interface Props {
  sent: Message[];
  received: Message[];
  onLongPress: (msg: Message) => void;
  onViewAllSent: () => void;
  onViewAllReceived: () => void;
}

export default function SweetMessagesSection({
  sent,
  received,
  onLongPress,
  onViewAllSent,
  onViewAllReceived,
}: Props) {
  // variables
  const unviewed = received.find((m) => !m.viewed);

  return (
    <View>
      <Text style={styles.sectionTitle}>Sweet Messages</Text>
      {unviewed && (
        <View style={styles.banner}>
          <Text>You have a sweet message!</Text>
          <TouchableOpacity style={styles.viewButton}>
            <Text>View</Text>
          </TouchableOpacity>
        </View>
      )}
      <Text style={styles.subTitle}>Most Recent Sent</Text>
      {sent[0] && (
        <MessageList messages={[sent[0]]} onLongPress={onLongPress} />
      )}
      <View style={styles.row}>
        <Text style={styles.subTitle}>Sent (Last 6)</Text>
        <TouchableOpacity style={styles.viewAllButton} onPress={onViewAllSent}>
          <Text style={styles.viewAllButtonText}>View All</Text>
        </TouchableOpacity>
      </View>
      <MessageList messages={sent.slice(0, 6)} onLongPress={onLongPress} />

      <View style={styles.row}>
        <Text style={styles.subTitle}>Received (Last 6)</Text>
        <TouchableOpacity
          style={styles.viewAllButton}
          onPress={onViewAllReceived}
        >
          <Text style={styles.viewAllButtonText}>View All</Text>
        </TouchableOpacity>
      </View>
      <MessageList messages={received.slice(0, 6)} onLongPress={onLongPress} />
    </View>
  );
}

const styles = StyleSheet.create({
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginTop: 0,
    color: "#b0b3c6",
    marginBottom: 10,
  },
  subTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginTop: 12,
    color: "#b0b3c6",
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 12,
    marginBottom: 4,
  },
  banner: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#ffe4e1",
    padding: 10,
    borderRadius: 8,
    marginVertical: 8,
  },
  viewButton: {
    marginLeft: 10,
    backgroundColor: "#ffb6b9",
    padding: 6,
    borderRadius: 6,
  },
  viewAllButton: {
    backgroundColor: "transparent",
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  viewAllButtonText: {
    color: "#e03487",
    fontWeight: "bold",
    fontSize: 15,
    letterSpacing: 0.5,
  },
});
