// external
import React, { useState, useEffect } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  RefreshControl,
  Text,
  ActivityIndicator,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useQuery, useQueryClient } from "@tanstack/react-query";

// internal
import {
  sendSweetMessage,
  getLastUnseenSweetMessage,
  viewSweetMessage,
  getSentSweetMessages,
  getReceivedSweetMessages,
  deleteSweetMessage,
} from "../../services/sweetMessageService";
import {
  ventToPartner,
  getLastUnseenVentMessage,
  viewVentMessage,
  getSentVentMessages,
  getReceivedVentMessages,
  deleteVentMessage,
} from "../../services/ventMessageService";
import { Message } from "../../types/Message";

// screen content
import SweetMessagesSection from "./SweetMessagesSection";
import VentMessagesSection from "./VentMessagesSection";
import ConfirmationModal from "../../components/modals/ConfirmationModal";
import MessageInputModal from "../../components/modals/MessageInputModal";
import ViewMessageModal from "../../components/modals/ViewMessageModal";
import AlertModal from "../../components/modals/AlertModal";

type Props = NativeStackScreenProps<any, any>;

export default function PortalScreen({ navigation }: Props) {
  // variables
  const insets = useSafeAreaInsets();
  const queryClient = useQueryClient();

  // use states
  const [confirmVisible, setConfirmVisible] = useState(false);
  const [selectedMessage, setSelectedMessage] = useState<Message | undefined>(
    undefined
  );
  const [refreshing, setRefreshing] = useState(false);
  const [inputModalVisible, setInputModalVisible] = useState(false);
  const [inputType, setInputType] = useState<"sweet" | "vent">("sweet");
  const [viewModalVisible, setViewModalVisible] = useState(false);
  const [viewedMessage, setViewedMessage] = useState<string>("");
  const [viewType, setViewType] = useState<"sweet" | "vent">("sweet");
  const [loading, setLoading] = useState(false);
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");
  const [viewLoading, setViewLoading] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // fetch functions
  const {
    data: unseenSweetMessage,
    isLoading: unseenSweetMessageLoading,
    refetch: refetchUnseenSweetMessage,
  } = useQuery({
    queryKey: ["unseenSweetMessage"],
    queryFn: async () => {
      const token = await AsyncStorage.getItem("token");

      if (!token) {
        return [];
      }

      const unseenSweet = await getLastUnseenSweetMessage(token);
      return unseenSweet.sweet || null;
    },
    staleTime: 1000 * 60 * 5,
  });

  const {
    data: unseenVentMessage,
    isLoading: unseenVentMessageLoading,
    refetch: refetchUnseenVentMessage,
  } = useQuery({
    queryKey: ["unseenVentMessage"],
    queryFn: async () => {
      const token = await AsyncStorage.getItem("token");

      if (!token) {
        return [];
      }

      const unseenVent = await getLastUnseenVentMessage(token);
      return unseenVent.vent || null;
    },
    staleTime: 1000 * 60 * 5,
  });

  const {
    data: sweetMessagesSent = [],
    isLoading: sweetMessagesSentLoading,
    refetch: refetchSweetMessagesSent,
  } = useQuery<Message[]>({
    queryKey: ["sweetMessagesSent"],
    queryFn: async () => {
      const token = await AsyncStorage.getItem("token");

      if (!token) {
        return [];
      }

      const sentSweet = await getSentSweetMessages(token);
      return sentSweet.sweets || sentSweet;
    },
    staleTime: 1000 * 60 * 5,
  });

  const {
    data: sweetMessagesReceived = [],
    isLoading: sweetMessagesReceivedLoading,
    refetch: refetchSweetMessagesReceived,
  } = useQuery<Message[]>({
    queryKey: ["sweetMessagesReceived"],
    queryFn: async () => {
      const token = await AsyncStorage.getItem("token");

      if (!token) {
        return [];
      }

      const receivedSweet = await getReceivedSweetMessages(token);
      return receivedSweet.sweets || receivedSweet;
    },
    staleTime: 1000 * 60 * 5,
  });

  const {
    data: ventMessagesSent = [],
    isLoading: ventMessagesSentLoading,
    refetch: refetchVentMessagesSent,
  } = useQuery<Message[]>({
    queryKey: ["ventMessagesSent"],
    queryFn: async () => {
      const token = await AsyncStorage.getItem("token");

      if (!token) {
        return [];
      }

      const sentVent = await getSentVentMessages(token);
      return sentVent.vents || sentVent;
    },
    staleTime: 1000 * 60 * 5,
  });

  const {
    data: ventMessagesReceived = [],
    isLoading: ventMessagesReceivedLoading,
    refetch: refetchVentMessagesReceived,
  } = useQuery<Message[]>({
    queryKey: ["ventMessagesReceived"],
    queryFn: async () => {
      const token = await AsyncStorage.getItem("token");

      if (!token) {
        return [];
      }

      const receivedVent = await getReceivedVentMessages(token);
      return receivedVent.vents || receivedVent;
    },
    staleTime: 1000 * 60 * 5,
  });

  // handlers
  const handleDelete = async () => {
    try {
      if (!selectedMessage) {
        return;
      }

      setDeleting(true);

      const token = await AsyncStorage.getItem("token");

      if (!token) {
        return;
      }

      if (inputType === "sweet") {
        await deleteSweetMessage(token, selectedMessage.id);
        await queryClient.invalidateQueries({
          queryKey: ["sweetMessagesSent"],
        });

        setAlertMessage("Sweet message deleted");
      } else {
        await deleteVentMessage(token, selectedMessage.id);
        await queryClient.invalidateQueries({
          queryKey: ["ventMessagesSent"],
        });

        setAlertMessage("Vent message deleted");
      }

      setDeleting(false);
      setConfirmVisible(false);
      setAlertVisible(true);
    } catch (err: any) {
      setAlertMessage(
        err?.response?.data?.message || "Failed to delete message"
      );
      setDeleting(false);
      setConfirmVisible(false);
      setAlertVisible(true);
    } finally {
      setDeleting(false);
      setConfirmVisible(false);
    }
  };

  const handleLongPress = (msg: Message) => {
    const isSent =
      (inputType === "sweet" &&
        sweetMessagesSent.some((m) => m.id === msg.id)) ||
      (inputType === "vent" && ventMessagesSent.some((m) => m.id === msg.id));

    if (!isSent) {
      return;
    }

    setSelectedMessage(msg);
    setConfirmVisible(true);
  };

  const handleOpenInputModal = (type: "sweet" | "vent") => {
    setInputType(type);
    setInputModalVisible(true);
  };

  const handleSendMessage = async (text: string) => {
    setLoading(true);
    try {
      const token = await AsyncStorage.getItem("token");

      if (!token) {
        return;
      }

      if (inputType === "sweet") {
        await sendSweetMessage(token, text);
        await queryClient.invalidateQueries({
          queryKey: ["sweetMessagesSent"],
        });

        setAlertMessage("Message stored for your baby to find");
      } else {
        await ventToPartner(token, text);
        await queryClient.invalidateQueries({
          queryKey: ["ventMessagesSent"],
        });

        setAlertMessage("Vent message stored for your baby to see");
      }

      setInputModalVisible(false);
      setAlertVisible(true);
    } catch (err: any) {
      setAlertMessage(
        err?.response?.data?.message || "Failed to send sweet message"
      );
      setAlertVisible(true);
    } finally {
      setLoading(false);
    }
  };

  const handleViewMessage = async (msg: Message, type: "sweet" | "vent") => {
    setViewLoading(true);
    try {
      const token = await AsyncStorage.getItem("token");

      if (!token) {
        return;
      }

      let messageData;

      if (type === "sweet") {
        const res = await viewSweetMessage(token, msg.id);
        messageData = res.sweet;

        await queryClient.invalidateQueries({
          queryKey: ["unseenSweetMessage"],
        });
      } else {
        const res = await viewVentMessage(token, msg.id);
        messageData = res.vent;

        await queryClient.invalidateQueries({
          queryKey: ["unseenVentMessage"],
        });
      }

      setViewedMessage(messageData);
      setViewType(type);
      setViewModalVisible(true);
    } catch (err: any) {
      setAlertMessage(err?.response?.data?.message || "Failed to load message");
      setAlertVisible(true);
    } finally {
      setViewLoading(false);
    }
  };

  // refresh screen
  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.all([
      refetchUnseenSweetMessage(),
      refetchUnseenVentMessage(),
      refetchSweetMessagesReceived(),
      refetchSweetMessagesSent(),
      refetchVentMessagesReceived(),
      refetchVentMessagesSent(),
    ]);
    setRefreshing(false);
  };

  {
    deleting && (
      <View style={styles.loadingOverlay}>
        <ActivityIndicator size="large" color="#e03487" />
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: "#23243a" }}>
      <ScrollView
        contentContainerStyle={[styles.container, { paddingTop: insets.top }]}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#e03487"
            colors={["#e03487"]}
            progressBackgroundColor="#23243a"
          />
        }
      >
        <SweetMessagesSection
          sent={sweetMessagesSent}
          received={sweetMessagesReceived}
          onLongPress={handleLongPress}
          onViewAllSent={() => navigation.navigate("LastSixSentScreen")}
          onViewAllReceived={() => navigation.navigate("LastSixReceivedScreen")}
          onAdd={() => {
            setInputType("sweet");
            handleOpenInputModal("sweet");
          }}
          onViewMessage={(msg) => handleViewMessage(msg, "sweet")}
          lastUnseen={unseenSweetMessage}
        />
        <VentMessagesSection
          sent={ventMessagesSent}
          received={ventMessagesReceived}
          onLongPress={handleLongPress}
          onAdd={() => {
            setInputType("vent");
            handleOpenInputModal("vent");
          }}
          onViewMessage={(msg) => handleViewMessage(msg, "vent")}
          lastUnseen={unseenVentMessage}
        />
        <ConfirmationModal
          visible={confirmVisible}
          message="Delete this message?"
          onConfirm={handleDelete}
          loading={deleting}
          onCancel={() => setConfirmVisible(false)}
          onClose={() => setConfirmVisible(false)}
          confirmText="Delete"
          cancelText="Cancel"
        />
        <MessageInputModal
          visible={inputModalVisible}
          onClose={() => setInputModalVisible(false)}
          onSend={handleSendMessage}
          type={inputType}
          loading={loading}
        />
        <ViewMessageModal
          visible={viewModalVisible}
          onClose={() => setViewModalVisible(false)}
          message={viewedMessage}
          type={viewType}
        />
        <AlertModal
          visible={alertVisible}
          message={alertMessage}
          onClose={() => setAlertVisible(false)}
        />
      </ScrollView>
      {viewLoading && (
        <View
          style={{
            ...StyleSheet.absoluteFillObject,
            backgroundColor: "rgba(35,36,58,0.7)",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 1000,
          }}
        >
          <ActivityIndicator size="large" color="#e03487" />
          <Text style={{ color: "#fff", marginTop: 16, fontWeight: "bold" }}>
            Loading message...
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingBottom: 150,
    alignItems: "stretch",
    backgroundColor: "#23243a",
    minHeight: "100%",
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(35,36,58,0.7)",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 16,
  },
});
