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
          <Text>You have a vent message!</Text>
          <TouchableOpacity style={styles.viewButton}>
            <Text>View</Text>
          </TouchableOpacity>
        </View>
      )}
      <Text style={styles.subTitle}>Most Recent Sent</Text>
      {sent[0] && (
        <MessageList messages={[sent[0]]} onLongPress={onLongPress} />
      )}
      <Text style={styles.subTitle}>Sent (Last 6)</Text>
      <MessageList messages={sent.slice(0, 6)} onLongPress={onLongPress} />
    </View>
  );
}

const styles = StyleSheet.create({
  sectionTitle: { 
    fontSize: 20, 
    fontWeight: "bold", 
    marginTop: 16,
    marginBottom: 10,
    color: "#b0b3c6",
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
    backgroundColor: "#e1f0ff",
    padding: 10,
    borderRadius: 8,
    marginVertical: 8,
  },
  viewButton: {
    marginLeft: 10,
    backgroundColor: "#b6d6ff",
    padding: 6,
    borderRadius: 6,
  },
});
