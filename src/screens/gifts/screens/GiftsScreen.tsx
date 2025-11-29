// external
import React, { useState, useEffect, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useQueryClient } from "@tanstack/react-query";
import NetInfo from "@react-native-community/netinfo";
import { Feather, Ionicons } from "@expo/vector-icons";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";

// screen content
import SetMonthlyGift from "../components/SetMonthlyGift";
import ReceivedGift from "../components/ReceivedGift";
import PastGiftsList from "../components/PastGiftsList";
import ClaimedGiftModal from "../../../components/modals/output/ClaimedGiftModal";
import UpdateMonthlyGiftModal from "../../../components/modals/input/UpdateMonthlyGiftModal";
import AlertModal from "../../../components/modals/output/AlertModal";

// internal
import {
  formatDateDMY,
  formatTime,
} from "../../../utils/formatters/formatDate";
import {
  claimMonthlyGift,
  updateSetMonthlyGift,
} from "../../../services/api/gifts/giftsService";

// internal (hooks)
import { useGifts } from "../../../hooks/useGifts";
import { useGiftsSelector } from "../../../hooks/useGiftsSelector";
import { useTheme } from "../../../theme/ThemeContext";
import useToken from "../../../hooks/useToken";
import { useAuth } from "../../../contexts/AuthContext";

// types
type Props = NativeStackScreenProps<any>;

const GiftsScreen: React.FC<Props> = ({ navigation }) => {
  // variables
  const insets = useSafeAreaInsets();
  const HEADER_HEIGHT = 60;
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const token = useToken();
  const { theme } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);

  // use states
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [showToast, setShowToast] = useState(false);
  const [claiming, setClaiming] = useState(false);
  const [claimedGift, setClaimedGift] = useState<any>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [modalLoading, setModalLoading] = useState(false);
  const [monthlyGiftModalVisible, setMonthlyGiftModalVisible] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [alertTitle, setAlertTitle] = useState("");
  const [alertMessage, setAlertMessage] = useState("");
  const [isOnline, setIsOnline] = useState(true);

  // fetch data
  const {
    data: _giftsData,
    isLoading: giftsLoading,
    refetch: refetchGifts,
    isError: giftsError,
  } = useGifts(token, user?.id);

  // select the data
  const gift =
    useGiftsSelector(user?.id, (gifts) => gifts?.unclaimedGift) || null;
  const setMonthlyGift =
    useGiftsSelector(user?.id, (gifts) => gifts?.setMonthlyGift) || null;
  const pastGifts =
    useGiftsSelector(user?.id, (gifts) => gifts?.claimedGifts) || [];

  // use effects
  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state) => {
      setIsOnline(!!state.isConnected);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (toastMessage) {
      setShowToast(true);
      const timer = setTimeout(() => {
        setShowToast(false);
        setToastMessage(null);
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [toastMessage]);

  // handlers
  const handleClaim = async () => {
    if (!gift) {
      return;
    }

    if (!token) {
      setToastMessage("Your session has expired. Log in again and retry.");
      return;
    }

    try {
      setClaiming(true);

      const result = await claimMonthlyGift(token, gift.id);
      setClaimedGift(result.gift);
      setModalVisible(true);

      setTimeout(() => {
        queryClient.invalidateQueries({
          queryKey: ["gifts", user?.id],
        });
      }, 1000);
    } catch (err: any) {
      setToastMessage(err.response?.data?.error || "Failed to open present");
    } finally {
      setClaiming(false);
    }
  };

  const handleSaveSetGift = async (giftName: string) => {
    if (!token) {
      setToastMessage("Your session has expired. Log in again and retry.");
      return;
    }

    setModalLoading(true);
    try {
      await updateSetMonthlyGift(token, giftName);
      await queryClient.invalidateQueries({
        queryKey: ["gifts", user?.id],
      });
      setMonthlyGiftModalVisible(false);

      setAlertTitle("Favorite Present Set");
      setAlertMessage("You have set your favorite present");
      setShowSuccess(true);
    } catch (err: any) {
      setToastMessage(
        err.response?.data?.error || "Failed to save favorite present"
      );
    } finally {
      setModalLoading(false);
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
      {!isOnline && (
        <View
          style={{
            backgroundColor: "red",
            position: "absolute",
            top: insets.top,
            left: 0,
            right: 0,
            zIndex: 10,
            paddingVertical: 2,
          }}
        >
          <Text style={{ color: "white", textAlign: "center" }}>
            You are offline
          </Text>
        </View>
      )}
      <View
        style={{
          backgroundColor: theme.colors.background,
          paddingTop: insets.top,
          height: HEADER_HEIGHT + insets.top,
          justifyContent: "center",
          alignItems: "center",
          position: "relative",
          zIndex: 2,
        }}
      >
        <TouchableOpacity
          style={{
            position: "absolute",
            top: insets.top + (HEADER_HEIGHT - 36) / 2,
            left: 18,
            zIndex: 10,
            backgroundColor: theme.colors.background,
            borderRadius: 20,
            padding: 8,
            shadowColor: theme.colors.shadow,
            shadowOpacity: 0.1,
            shadowRadius: 4,
          }}
          // onPress={() => navigation.navigate("GameListScreen")}
        >
          <Ionicons
            name="game-controller-outline"
            size={22}
            color={theme.colors.text}
          />
        </TouchableOpacity>
        <Text
          style={{
            fontSize: 20,
            color: theme.colors.text,
            letterSpacing: 0,
          }}
        >
          Presents
        </Text>

        <TouchableOpacity
          style={{
            position: "absolute",
            top: insets.top + (HEADER_HEIGHT - 36) / 2,
            right: 18,
            zIndex: 10,
            backgroundColor: theme.colors.background,
            borderRadius: 20,
            padding: 8,
            shadowColor: theme.colors.shadow,
            shadowOpacity: 0.1,
            shadowRadius: 4,
          }}
          onPress={() => navigation.navigate("CartScreen")}
        >
          <Feather name="shopping-cart" size={22} color={theme.colors.text} />
        </TouchableOpacity>
      </View>
      <ScrollView
        contentContainerStyle={[styles.container, { paddingTop: insets.top }]}
        showsVerticalScrollIndicator={false}
      >
        <SetMonthlyGift
          giftName={setMonthlyGift?.setMonthlyGift || "No present set"}
          onChange={() => setMonthlyGiftModalVisible(true)}
          buttonText={setMonthlyGift?.setMonthlyGift ? "Change" : "Add"}
        />
        {gift ? (
          <ReceivedGift
            giftName={gift.name}
            receivedAt={
              formatDateDMY(gift.createdAt) + " " + formatTime(gift.createdAt)
            }
            onClaim={handleClaim}
            claiming={claiming}
          />
        ) : (
          <Text
            style={{
              color: theme.colors.muted,
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

      <AlertModal
        visible={showSuccess}
        type="success"
        title={alertTitle}
        message={alertMessage}
        buttonText="Great"
        onClose={() => setShowSuccess(false)}
      />

      {showToast && (
        <View style={styles.toast}>
          <Text style={styles.toastText}>{toastMessage}</Text>
        </View>
      )}
    </View>
  );
};

const createStyles = (theme: ReturnType<typeof useTheme>["theme"]) =>
  StyleSheet.create({
    container: {
      paddingHorizontal: 16,
      paddingTop: 20,
      paddingBottom: 32,
      alignItems: "stretch",
      backgroundColor: theme.colors.background,
      minHeight: "100%",
    },
    toast: {
      position: "absolute",
      bottom: 10,
      left: 20,
      right: 20,
      backgroundColor: theme.colors.primary,
      padding: 14,
      borderRadius: 10,
      alignItems: "center",
      zIndex: 100,
      shadowColor: theme.colors.shadow,
      shadowOpacity: 0.2,
      shadowRadius: 8,
      elevation: 8,
    },
    toastText: {
      color: theme.colors.text,
      fontWeight: "bold",
      fontSize: 16,
    },
    centered: {
      flex: 1,
      backgroundColor: theme.colors.background,
      alignItems: "center",
      justifyContent: "center",
    },
  });

export default GiftsScreen;
