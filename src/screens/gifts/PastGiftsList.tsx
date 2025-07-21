// external
import React from "react";
import { View, Text, StyleSheet, FlatList } from "react-native";
import { Feather } from "@expo/vector-icons";

// types
type PastGift = {
  id: string;
  giftName: string;
  receivedAt: string;
  claimedAt: string;
};

type Props = {
  gifts: PastGift[];
};

const PastGiftsList: React.FC<Props> = ({ gifts }) => (
  <View style={styles.container}>
    <Text style={styles.title}>Past Received Presents</Text>
    <FlatList
      data={gifts}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => (
        <View style={styles.row}>
          <Feather name="gift" size={20} color="#e03487" style={styles.icon} />
          <View style={styles.details}>
            <Text style={styles.giftName}>{item.giftName}</Text>
            <Text style={styles.detailText}>
              <Text style={styles.label}>Received: </Text>
              {item.receivedAt}
            </Text>
            <Text style={styles.detailText}>
              <Text style={styles.label}>Claimed: </Text>
              {item.claimedAt}
            </Text>
          </View>
        </View>
      )}
      ItemSeparatorComponent={() => <View style={styles.separator} />}
      scrollEnabled={false}
      ListEmptyComponent={
        <Text style={{ color: "#b0b3c6", textAlign: "center", marginTop: 8 }}>
          You haven't opened any presents yet
        </Text>
      }
    />
  </View>
);

const styles = StyleSheet.create({
  container: {
    width: "100%",
    marginTop: 8,
    marginBottom: 8,
  },
  title: {
    fontSize: 15,
    color: "#b0b3c6",
    fontWeight: "bold",
    marginBottom: 10,
    marginLeft: 2,
    letterSpacing: 0.5,
    textTransform: "uppercase",
  },
  row: {
    flexDirection: "row",
    alignItems: "flex-start",
    paddingVertical: 10,
    paddingHorizontal: 2,
  },
  icon: {
    marginRight: 12,
    marginTop: 2,
  },
  details: {
    flex: 1,
  },
  giftName: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 2,
  },
  detailText: {
    color: "#b0b3c6",
    fontSize: 13,
    marginBottom: 1,
  },
  label: {
    color: "#e03487",
    fontWeight: "bold",
  },
  separator: {
    height: 6,
  },
});

export default PastGiftsList;
