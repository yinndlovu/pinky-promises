// external
import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  Dimensions,
} from "react-native";

// internal
import { formatDateDMYHM } from "../../../../utils/formatDate";
import {
  StoredMessage,
  PartnerMessageStorageProps,
} from "../../../../interfaces/MessageStorage";
import { getTrimmedText } from "../../../../helpers/profileHelpers";

const screenWidth = Dimensions.get("window").width;

export default function PartnerMessageStorage({
  name,
  messages,
  onPress,
}: PartnerMessageStorageProps) {
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

const styles = StyleSheet.create({
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
    color: "#b0b3c6",
    fontSize: 15,
    marginTop: 5,
  },
  headerText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#b0b3c6",
    marginBottom: 1,
  },
  plusButton: {
    backgroundColor: "#e03487",
    borderRadius: 20,
    width: 26,
    height: 26,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 8,
  },
  plusText: {
    color: "#fff",
    fontSize: 16,
    lineHeight: 24,
    marginTop: -2,
  },
  listContent: {},
  card: {
    backgroundColor: "#23243a",
    borderRadius: 14,
    marginBottom: 12,
    marginRight: 12,
    marginTop: 16,
    width: Math.min(screenWidth * 0.75, 300),
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
    borderWidth: 0.7,
    borderColor: "#2f3149ff",
  },
  title: {
    color: "#dfdfdfff",
    fontSize: 15,
    fontWeight: "700",
    marginBottom: 6,
    marginTop: 6,
    paddingHorizontal: 10,
  },
  messageText: {
    color: "#d8d8d8ff",
    fontSize: 14,
    paddingHorizontal: 10,
    marginBottom: 4,
    fontWeight: "500",
  },
  date: {
    color: "#b0b3c6",
    fontSize: 11,
    textAlign: "left",
    padding: 9,
  },
});
