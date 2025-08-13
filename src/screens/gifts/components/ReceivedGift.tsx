// external
import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { FontAwesome6 } from "@expo/vector-icons";

// internal
import { ReceivedGiftProps } from "../../../types/Gift";

const ReceivedGift: React.FC<ReceivedGiftProps> = ({
  giftName,
  receivedAt,
  onClaim,
  claiming,
}) => (
  <View style={styles.card}>
    <View style={styles.row}>
      <FontAwesome6
        name="gift"
        size={22}
        color="#e03487"
        style={{ marginRight: 10 }}
      />
      <Text style={styles.title}>You received a present</Text>
    </View>
    <Text style={styles.giftName}>{giftName}</Text>
    <Text style={styles.dateText}>{receivedAt}</Text>
    <TouchableOpacity
      style={styles.claimButton}
      onPress={onClaim}
      disabled={claiming}
    >
      {claiming ? (
        <ActivityIndicator color="#fff" />
      ) : (
        <Text style={styles.claimButtonText}>Open</Text>
      )}
    </TouchableOpacity>
  </View>
);

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#23243a",
    borderRadius: 14,
    padding: 20,
    shadowColor: "#000",
    shadowOpacity: 0.5,
    shadowRadius: 4,
    elevation: 4,
    marginBottom: 24,
    alignItems: "flex-start",
    width: "100%",
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  title: {
    color: "#fff",
    fontSize: 17,
    fontWeight: "bold",
    letterSpacing: 0.5,
  },
  giftName: {
    color: "#e03487",
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 6,
    marginLeft: 2,
  },
  dateText: {
    color: "#b0b3c6",
    fontSize: 13,
    marginBottom: 16,
    marginLeft: 2,
  },
  claimButton: {
    backgroundColor: "#e03487",
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 28,
    alignItems: "center",
    alignSelf: "flex-start",
  },
  claimButtonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
    letterSpacing: 1,
  },
});

export default ReceivedGift;
