import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, ScrollView } from "react-native";
import SetMonthlyGift from "./SetMonthlyGift";
import ReceivedGift from "./ReceivedGift";
import PastGiftsList from "./PastGiftsList";
import { getOldestUnclaimedGift } from "../../services/monthlyGiftService";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useSafeAreaInsets } from "react-native-safe-area-context";

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

const GiftsScreen = () => {
  const insets = useSafeAreaInsets();
  const [gift, setGift] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchGift = async () => {
    try {
      setLoading(true);
      setError(null);

      const token = await AsyncStorage.getItem("token");

      if (!token) {
        return;
      }

      const unclaimedGift = await getOldestUnclaimedGift(token);
      setGift(unclaimedGift);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGift();
  }, []);

  return (
    <View style={{ flex: 1, backgroundColor: "#23243a" }}>
      <ScrollView
        contentContainerStyle={[styles.container, { paddingTop: insets.top }]}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.headerTitle}>Presents</Text>
        <SetMonthlyGift giftName="Roses" onChange={() => {}} />
        {loading ? (
          <Text style={{ color: "#fff" }}>Loading...</Text>
        ) : error ? (
          <Text style={{ color: "red" }}>{error}</Text>
        ) : gift ? (
          <ReceivedGift
            giftName={gift.name}
            receivedAt={
              new Date(gift.createdAt).toLocaleDateString("en-GB", {
                day: "numeric",
                month: "short",
                year: "numeric",
              }) +
              " " +
              new Date(gift.createdAt).toLocaleTimeString("en-GB", {
                hour: "2-digit",
                minute: "2-digit",
                hour12: false,
              })
            }
            onClaim={() => {}}
          />
        ) : (
          <Text style={{ color: "#fff" }}>No unclaimed gifts found.</Text>
        )}
        <PastGiftsList gifts={pastGifts} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 32,
    alignItems: "stretch",
    backgroundColor: "#23243a",
    minHeight: "100%",
  },
  headerTitle: {
    fontSize: 20,
    color: "#fff",
    letterSpacing: 0,
    alignSelf: "center",
    marginBottom: 36,
    paddingTop: 20,
  },
});

export default GiftsScreen;
