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

  // use states
  const [gift, setGift] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [claiming, setClaiming] = useState(false);
  const [claimedGift, setClaimedGift] = useState<any>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [pastGifts, setPastGifts] = useState<any[]>([]);
  const [setMonthlyGift, setSetMonthlyGift] = useState<string | null>(null);
  const [modalLoading, setModalLoading] = useState(false);
  const [monthlyGiftModalVisible, setMonthlyGiftModalVisible] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // refresh screen
  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await Promise.all([
        fetchGift(),
        fetchPastGifts(),
        fetchSetGift && fetchSetGift(),
      ]);
    } finally {
      setRefreshing(false);
    }
  };

  // fetch functions
  const fetchGift = async () => {
    try {
      setLoading(true);
      setError(null);

      const token = await AsyncStorage.getItem("token");

      if (!token) {
        setError("No token found");
        setGift(null);

        return;
      }

      const unclaimedGift = await getOldestUnclaimedGift(token);
      setGift(unclaimedGift);
    } catch (err: any) {
      if (err.response && err.response.status === 404) {
        setGift(null);
        setError(null);
      } else {
        setError(err.message);
        setGift(null);
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchPastGifts = async () => {
    try {
      const token = await AsyncStorage.getItem("token");

      if (!token) {
        setPastGifts([]);
        return;
      }

      const gifts = await getLastFiveClaimedGifts(token);
      setPastGifts(
        gifts.map((gift: any) => ({
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
        }))
      );
    } catch {
      setPastGifts([]);
    }
  };

  const fetchSetGift = async () => {
    try {
      const token = await AsyncStorage.getItem("token");

      if (!token || !userId) {
        return;
      }

      const result = await getSetMonthlyGift(token, userId);
      setSetMonthlyGift(result?.setMonthlyGift || null);
    } catch {
      setSetMonthlyGift(null);
    }
  };

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

      await fetchGift();
      await fetchPastGifts();
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
      setSetMonthlyGift(giftName);
      setMonthlyGiftModalVisible(false);
    } catch (err: any) {
      setError(err?.response?.data?.message || "Failed to save set gift");
    } finally {
      setModalLoading(false);
  };

  // use effects
  useEffect(() => {
    fetchSetGift();
  }, []);

  useEffect(() => {
    fetchGift();
    fetchPastGifts();
  }, []);

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
          giftName={setMonthlyGift || "No present set"}
          onChange={() => setMonthlyGiftModalVisible(true)}
          buttonText={setMonthlyGift ? "Change" : "Add"}
        />
        {loading ? (
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
        initialGiftName={setMonthlyGift || ""}
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
