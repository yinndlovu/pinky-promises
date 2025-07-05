import React from "react";
import { View, Text, StyleSheet, ScrollView } from "react-native";
import SetMonthlyGift from "./SetMonthlyGift";
import ReceivedGift from "./ReceivedGift";
import PastGiftsList from "./PastGiftsList";

const pastGifts = [
  {
    id: "1",
    giftName: "Chocolate Box",
    receivedAt: "2024-05-15 13:20",
    claimedAt: "2024-05-15 14:00",
  },
  {
    id: "2",
    giftName: "Movie Night",
    receivedAt: "2024-04-10 18:00",
    claimedAt: "2024-04-10 18:30",
  },
  {
    id: "3",
    giftName: "Spa Voucher",
    receivedAt: "2024-03-12 09:10",
    claimedAt: "2024-03-12 10:00",
  },
  {
    id: "4",
    giftName: "Book Set",
    receivedAt: "2024-02-14 11:45",
    claimedAt: "2024-02-14 12:10",
  },
  {
    id: "5",
    giftName: "Coffee Date",
    receivedAt: "2024-01-20 16:00",
    claimedAt: "2024-01-20 16:20",
  },
  {
    id: "6",
    giftName: "Surprise Cake",
    receivedAt: "2023-12-25 20:00",
    claimedAt: "2023-12-25 20:30",
  },
];

const GiftsScreen = () => (
  <View style={{ flex: 1, backgroundColor: "#23243a" }}>
    <ScrollView
      contentContainerStyle={styles.container}
      showsVerticalScrollIndicator={false}
    >
      <Text style={styles.headerTitle}>Presents</Text>
      <SetMonthlyGift giftName="Roses" onChange={() => {}} />
      <ReceivedGift
        giftName="Roses"
        receivedAt="01 Jun 2025 00:00"
        onClaim={() => {}}
      />
      <PastGiftsList gifts={pastGifts} />
    </ScrollView>
  </View>
);

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingTop: 60,
    paddingBottom: 32,
    alignItems: "stretch",
    backgroundColor: "#23243a",
    minHeight: "100%",
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#fff",
    letterSpacing: 1,
    alignSelf: "center",
    marginBottom: 36,
  },
});

export default GiftsScreen;
