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

// internal
import {
  sendSweetMessage,
  getLastUnseenSweetMessage,
  viewSweetMessage,
  getSentSweetMessages,
  getReceivedSweetMessages,
  deleteSweetMessage,
} from "../../../services/sweetMessageService";
import {
  ventToPartner,
  getLastUnseenVentMessage,
  viewVentMessage,
  getSentVentMessages,
  getReceivedVentMessages,
  deleteVentMessage,
} from "../../../services/ventMessageService";

// screen content
import SweetMessagesSection from "./SweetMessagesSection";
import VentMessagesSection from "./VentMessagesSection";
import ConfirmationModal from "../../../components/modals/ConfirmationModal";
import MessageInputModal from "../../../components/modals/MessageInputModal";
import ViewMessageModal from "../../../components/modals/ViewMessageModal";
import AlertModal from "../../../components/modals/AlertModal";

// types
type Message = {
  id: string;
  message?: string;
  seen?: boolean;
  createdAt?: string;
  updatedAt?: string;
};

export default function PortalScreen() {
  // variables
  const insets = useSafeAreaInsets();

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
  const [lastUnseenSweet, setLastUnseenSweet] = useState<Message | null>(null);
  const [lastUnseenVent, setLastUnseenVent] = useState<Message | null>(null);
  const [viewLoading, setViewLoading] = useState(false);
  const [sweetMessagesSent, setSweetMessagesSent] = useState<Message[]>([]);
  const [sweetMessagesReceived, setSweetMessagesReceived] = useState<Message[]>(
    []
  );
  const [ventMessagesSent, setVentMessagesSent] = useState<Message[]>([]);
  const [ventMessagesReceived, setVentMessagesReceived] = useState<Message[]>(
    []
  );
  const [deleting, setDeleting] = useState(false);

  // refresh screen
  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.all([
      fetchUnseenMessages(),
      fetchAllSweetMessages(),
      fetchAllVentMessages(),
    ]);
    setRefreshing(false);
  };

  // use effects
  useEffect(() => {
    fetchUnseenMessages();
    fetchAllSweetMessages();
    fetchAllVentMessages();
  }, []);

  // fetch functions
  const fetchUnseenMessages = async () => {
    try {
      const token = await AsyncStorage.getItem("token");

      if (!token) {
        return;
      }

      const sweetRes = await getLastUnseenSweetMessage(token);
      setLastUnseenSweet(sweetRes.sweet || null);

      const ventRes = await getLastUnseenVentMessage(token);
      setLastUnseenVent(ventRes.vent || null);
    } catch (err) {
      setLastUnseenSweet(null);
      setLastUnseenVent(null);
    }
  };

  const fetchAllSweetMessages = async () => {
    try {
      const token = await AsyncStorage.getItem("token");

      if (!token) {
        return;
      }

      const sentSweet = await getSentSweetMessages(token);
      setSweetMessagesSent(sentSweet.sweets || sentSweet);

      const receivedSweet = await getReceivedSweetMessages(token);
      setSweetMessagesReceived(receivedSweet.sweets || receivedSweet);
    } catch (err) {}
  };

  const fetchAllVentMessages = async () => {
    try {
      const token = await AsyncStorage.getItem("token");

      if (!token) {
        return;
      }

      const sentVent = await getSentVentMessages(token);
      setVentMessagesSent(sentVent.vents || sentVent);

      const receivedVent = await getReceivedVentMessages(token);
      setVentMessagesReceived(receivedVent.vents || receivedVent);
    } catch (err) {}
  };

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
        setAlertMessage("Sweet message deleted");
      } else {
        await deleteVentMessage(token, selectedMessage.id);
        setAlertMessage("Vent message deleted");
      }

      setDeleting(false);
      setConfirmVisible(false);
      setAlertVisible(true);
      await fetchAllSweetMessages();
      await fetchAllVentMessages();
    } catch (err) {
      setAlertMessage("Failed to delete message");
      setDeleting(false);
      setConfirmVisible(false);
      setAlertVisible(true);
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
        setAlertMessage("Message stored for your baby to find");
      } else {
        await ventToPartner(token, text);
        setAlertMessage("Vent message stored for your baby to see");
      }

      await fetchAllSweetMessages();
      await fetchAllVentMessages();
      setInputModalVisible(false);
      setAlertVisible(true);
    } catch (err: any) {
      setAlertMessage(err?.message || "Failed to send sweet message");
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
      } else {
        const res = await viewVentMessage(token, msg.id);
        messageData = res.vent;
      }

      setViewedMessage(messageData);
      setViewType(type);
      setViewModalVisible(true);

      fetchUnseenMessages();
    } catch (err) {
      setAlertMessage("Failed to load message");
      setAlertVisible(true);
    } finally {
      setViewLoading(false);
    }
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
          onViewAllSent={() => {}}
          onViewAllReceived={() => {}}
          onAdd={() => {
            setInputType("sweet");
            handleOpenInputModal("sweet");
          }}
          onViewMessage={(msg) => handleViewMessage(msg, "sweet")}
          lastUnseen={lastUnseenSweet}
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
          lastUnseen={lastUnseenVent}
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
