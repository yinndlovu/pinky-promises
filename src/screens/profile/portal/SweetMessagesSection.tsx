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
          <Text style={styles.bannerText}>You have a sweet message!</Text>
          <TouchableOpacity style={styles.viewButton}>
            <Text style={styles.viewButtonText}>View</Text>
          </TouchableOpacity>
        </View>
      )}
      <Text style={styles.subTitle}>Most recent sent</Text>
      {sent[0] ? (
        <MessageList messages={[sent[0]]} onLongPress={onLongPress} />
      ) : (
        <Text style={styles.emptyText}>You haven't recently sent any sweet message</Text>
      )}
      <View style={styles.row}>
        <Text style={styles.subTitle}>Last six sent</Text>
        <TouchableOpacity style={styles.viewAllButton} onPress={onViewAllSent}>
          <Text style={styles.viewAllButtonText}>View all</Text>
        </TouchableOpacity>
      </View>
      {sent.length > 0 ? (
        <MessageList messages={sent.slice(0, 6)} onLongPress={onLongPress} />
      ) : (
        <Text style={styles.emptyText}>You haven't sent any sweet messages</Text>
      )}

      <View style={styles.row}>
        <Text style={styles.subTitle}>Last six received</Text>
        <TouchableOpacity
          style={styles.viewAllButton}
          onPress={onViewAllReceived}
        >
          <Text style={styles.viewAllButtonText}>View all</Text>
        </TouchableOpacity>
      </View>
      {received.length > 0 ? (
        <MessageList
          messages={received.slice(0, 6)}
          onLongPress={onLongPress}
        />
      ) : (
        <Text style={styles.emptyText}>Aww, you haven't received these yet</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginTop: 0,
    color: "#dce0f7",
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
  emptyText: {
    color: "#b0b3c6",
    fontStyle: "italic",
    marginVertical: 8,
    marginLeft: 8,
  },
});
