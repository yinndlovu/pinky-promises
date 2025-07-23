// external
import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useQuery, useQueryClient } from "@tanstack/react-query";

// screen content
import SetMonthlyGift from "./SetMonthlyGift";
import ReceivedGift from "./ReceivedGift";
import PastGiftsList from "./PastGiftsList";
import ClaimedGiftModal from "../../components/modals/ClaimedGiftModal";
import UpdateMonthlyGiftModal from "../../components/modals/UpdateMonthlyGiftModal";

// internal
import {
  getOldestUnclaimedGift,
  claimMonthlyGift,
  getLastFiveClaimedGifts,
} from "../../services/monthlyGiftService";
import {
  getSetMonthlyGift,
  updateSetMonthlyGift,
} from "../../services/setMonthlyGiftService";
import { useAuth } from "../../contexts/AuthContext";

const GiftsScreen = () => {
  // variables
  const insets = useSafeAreaInsets();
  const HEADER_HEIGHT = 60;
  const { user } = useAuth();
  const userId = user?.id;
  const queryClient = useQueryClient();

  // use states
  const [error, setError] = useState<string | null>(null);
  const [claiming, setClaiming] = useState(false);
  const [claimedGift, setClaimedGift] = useState<any>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [modalLoading, setModalLoading] = useState(false);
  const [monthlyGiftModalVisible, setMonthlyGiftModalVisible] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // refresh screen
  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await Promise.all([
        refetchGift(),
        refetchPastGifts(),
        refetchSetMonthlyGift(),
      ]);
    } finally {
      setRefreshing(false);
    }
  };

  // fetch functions
  const {
    data: gift,
    isLoading: giftLoading,
    refetch: refetchGift,
  } = useQuery({
    queryKey: ["unclaimedGift"],
    queryFn: async () => {
      const token = await AsyncStorage.getItem("token");

      if (!token) {
        setError("No token found");
        return;
      }

      return await getOldestUnclaimedGift(token);
    },
    staleTime: 1000 * 60 * 60, // 10 minutes
  });

  // Past Gifts
  const {
    data: pastGifts = [],
    isLoading: pastGiftsLoading,
    refetch: refetchPastGifts,
  } = useQuery({
    queryKey: ["pastGifts"],
    queryFn: async () => {
      const token = await AsyncStorage.getItem("token");

      if (!token) {
        setError("No token found");
        return;
      }

      const gifts = await getLastFiveClaimedGifts(token);
      return gifts.map((gift: any) => ({
        id: gift.id,
        giftName: gift.name,
        receivedAt:
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
          }),
        claimedAt:
          new Date(gift.claimDate).toLocaleDateString("en-GB", {
            day: "numeric",
            month: "short",
            year: "numeric",
          }) +
          " " +
          new Date(gift.claimDate).toLocaleTimeString("en-GB", {
            hour: "2-digit",
            minute: "2-digit",
            hour12: false,
          }),
      }));
    },
    staleTime: 1000 * 60 * 60 * 24,
  });

  const {
    data: setMonthlyGift,
    isLoading: setMonthlyGiftLoading,
    refetch: refetchSetMonthlyGift,
  } = useQuery({
    queryKey: ["setMonthlyGift", userId],
    queryFn: async () => {
      const token = await AsyncStorage.getItem("token");

      if (!token || !userId) {
        return;
      }

      return await getSetMonthlyGift(token, userId);
    },
    enabled: !!userId,
    staleTime: 1000 * 60 * 60 * 24, // 24 hours
  });

  // handlers
  const handleClaim = async () => {
    if (!gift) {
      return;
    }

    try {
      setClaiming(true);

      const token = await AsyncStorage.getItem("token");

      if (!token) {
        setError("No token found");
        return;
      }

      const result = await claimMonthlyGift(token, gift.id);
      setClaimedGift(result.gift);
      setModalVisible(true);

      setTimeout(() => {
        queryClient.invalidateQueries({ queryKey: ["unclaimedGift"] });
        queryClient.invalidateQueries({ queryKey: ["pastGifts"] });
      }, 1000);
    } catch (err: any) {
      setError(err?.response?.data?.message || "Failed to claim gift");
    } finally {
      setClaiming(false);
    }
  };

  const handleSaveSetGift = async (giftName: string) => {
    setModalLoading(true);

    try {
      const token = await AsyncStorage.getItem("token");

      if (!token) {
        return;
      }

      await updateSetMonthlyGift(token, giftName);
      await queryClient.invalidateQueries({
        queryKey: ["setMonthlyGift", userId],
      });
      setMonthlyGiftModalVisible(false);
    } catch (err: any) {
      setError(err?.response?.data?.message || "Failed to save set gift");
    } finally {
      setModalLoading(false);
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: "#23243a" }}>
      <View
        style={{
          backgroundColor: "#23243a",
          paddingTop: insets.top,
          height: HEADER_HEIGHT + insets.top,
          justifyContent: "center",
          alignItems: "center",
          position: "relative",
          zIndex: 2,
        }}
      >
        <Text
          style={{
            fontSize: 20,
            color: "#fff",
            letterSpacing: 0,
          }}
        >
          Presents
        </Text>
      </View>
      <ScrollView
        contentContainerStyle={[styles.container, { paddingTop: insets.top }]}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={["#e03487"]}
            tintColor="#e03487"
            progressBackgroundColor="#23243a"
          />
        }
      >
        <SetMonthlyGift
          giftName={setMonthlyGift?.setMonthlyGift || "No present set"}
          onChange={() => setMonthlyGiftModalVisible(true)}
          buttonText={setMonthlyGift?.setMonthlyGift ? "Change" : "Add"}
        />
        {giftLoading ? (
          <View
            style={{ alignItems: "center", marginTop: 8, marginBottom: 12 }}
          >
            <ActivityIndicator size="small" color="#e03487" />
          </View>
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
            onClaim={handleClaim}
            claiming={claiming}
          />
        ) : (
          <Text
            style={{
              color: "#b0b3c6",
              textAlign: "center",
              marginTop: 8,
              marginBottom: 12,
            }}
          >
            You have not received any present yet
          </Text>
        )}
        <PastGiftsList gifts={pastGifts} />
      </ScrollView>

      <ClaimedGiftModal
        visible={modalVisible}
        giftName={claimedGift?.name || ""}
        value={claimedGift?.value || ""}
        message={claimedGift?.message || ""}
        onClose={() => setModalVisible(false)}
      />

      <UpdateMonthlyGiftModal
        visible={monthlyGiftModalVisible}
        initialGiftName={setMonthlyGift?.setMonthlyGift || ""}
        onClose={() => setMonthlyGiftModalVisible(false)}
        onSave={handleSaveSetGift}
        loading={modalLoading}
      />
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
});

export default GiftsScreen;
