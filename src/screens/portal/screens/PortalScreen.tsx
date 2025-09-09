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
import NetInfo from "@react-native-community/netinfo";

// internal
import {
  sendSweetMessage,
  getLastUnseenSweetMessage,
  viewSweetMessage,
  getSentSweetMessages,
  getReceivedSweetMessages,
  deleteSweetMessage,
} from "../../../services/api/portal/sweetMessageService";
import {
  ventToPartner,
  getLastUnseenVentMessage,
  viewVentMessage,
  getSentVentMessages,
  getReceivedVentMessages,
  deleteVentMessage,
} from "../../../services/api/portal/ventMessageService";
import { Message } from "../../../types/Message";
import { useAuth } from "../../../contexts/AuthContext";

// screen content
import SweetMessagesSection from "../components/SweetMessagesSection";
import VentMessagesSection from "../components/VentMessagesSection";
import ConfirmationModal from "../../../components/modals/selection/ConfirmationModal";
import MessageInputModal from "../../../components/modals/input/MessageInputModal";
import ViewMessageModal from "../../../components/modals/output/ViewMessageModal";
import AlertModal from "../../../components/modals/output/AlertModal";

// types
type Props = NativeStackScreenProps<any, any>;

export default function PortalScreen({ navigation }: Props) {
  // variables
  const insets = useSafeAreaInsets();
  const queryClient = useQueryClient();
  const { user } = useAuth();

  // use states
  const [selectedMessage, setSelectedMessage] = useState<Message | undefined>(
    undefined
  );
  const [inputType, setInputType] = useState<"sweet" | "vent">("sweet");
  const [viewedMessage, setViewedMessage] = useState<string>("");
  const [viewType, setViewType] = useState<"sweet" | "vent" | null>(null);
  const [isOnline, setIsOnline] = useState(true);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [showToast, setShowToast] = useState(false);

  // use states (modals)
  const [showSuccess, setShowSuccess] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");
  const [alertTitle, setAlertTitle] = useState("");
  const [viewModalVisible, setViewModalVisible] = useState(false);
  const [confirmVisible, setConfirmVisible] = useState(false);
  const [inputModalVisible, setInputModalVisible] = useState(false);

  // use states (processing)
  const [refreshing, setRefreshing] = useState(false);
  const [viewLoading, setViewLoading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [loading, setLoading] = useState(false);

  // fetch functions
  const {
    data: unseenSweetMessage,
    isLoading: unseenSweetMessageLoading,
    refetch: refetchUnseenSweetMessage,
  } = useQuery({
    queryKey: ["unseenSweetMessage", user?.id],
    queryFn: async () => {
      const token = await AsyncStorage.getItem("token");

      if (!token) {
        setToastMessage("Session expired, please log in again");
        return [];
      }

      const unseenSweet = await getLastUnseenSweetMessage(token);
      return unseenSweet.sweet || null;
    },
    staleTime: 0,
  });

  const {
    data: unseenVentMessage,
    isLoading: unseenVentMessageLoading,
    refetch: refetchUnseenVentMessage,
  } = useQuery({
    queryKey: ["unseenVentMessage", user?.id],
    queryFn: async () => {
      const token = await AsyncStorage.getItem("token");

      if (!token) {
        return [];
      }

      const unseenVent = await getLastUnseenVentMessage(token);
      return unseenVent.vent || null;
    },
    staleTime: 0,
  });

  const {
    data: sweetMessagesSent = [],
    isLoading: sweetMessagesSentLoading,
    refetch: refetchSweetMessagesSent,
  } = useQuery<Message[]>({
    queryKey: ["sweetMessagesSent", user?.id],
    queryFn: async () => {
      const token = await AsyncStorage.getItem("token");

      if (!token) {
        return [];
      }

      const sentSweet = await getSentSweetMessages(token);
      return sentSweet.sweets || sentSweet;
    },
    staleTime: 1000 * 60 * 60,
  });

  const {
    data: sweetMessagesReceived = [],
    isLoading: sweetMessagesReceivedLoading,
    refetch: refetchSweetMessagesReceived,
  } = useQuery<Message[]>({
    queryKey: ["sweetMessagesReceived", user?.id],
    queryFn: async () => {
      const token = await AsyncStorage.getItem("token");

      if (!token) {
        return [];
      }

      const receivedSweet = await getReceivedSweetMessages(token);
      return receivedSweet.sweets || receivedSweet;
    },
    staleTime: 1000 * 60 * 60,
  });

  const {
    data: ventMessagesSent = [],
    isLoading: ventMessagesSentLoading,
    refetch: refetchVentMessagesSent,
  } = useQuery<Message[]>({
    queryKey: ["ventMessagesSent", user?.id],
    queryFn: async () => {
      const token = await AsyncStorage.getItem("token");

      if (!token) {
        return [];
      }

      const sentVent = await getSentVentMessages(token);
      return sentVent.vents || sentVent;
    },
    staleTime: 1000 * 60 * 60,
  });

  const {
    data: ventMessagesReceived = [],
    isLoading: ventMessagesReceivedLoading,
    refetch: refetchVentMessagesReceived,
  } = useQuery<Message[]>({
    queryKey: ["ventMessagesReceived", user?.id],
    queryFn: async () => {
      const token = await AsyncStorage.getItem("token");

      if (!token) {
        return [];
      }

      const receivedVent = await getReceivedVentMessages(token);
      return receivedVent.vents || receivedVent;
    },
    staleTime: 1000 * 60 * 60,
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
          queryKey: ["sweetMessagesSent", user?.id],
        });

        setToastMessage("Sweet message deleted");
      } else {
        await deleteVentMessage(token, selectedMessage.id);
        await queryClient.invalidateQueries({
          queryKey: ["ventMessagesSent", user?.id],
        });

        setToastMessage("Vent message deleted");
      }

      setDeleting(false);
      setConfirmVisible(false);
    } catch (err: any) {
      setToastMessage(
        err?.response?.data?.message || "Failed to delete message"
      );
      setDeleting(false);
      setConfirmVisible(false);
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
          queryKey: ["sweetMessagesSent", user?.id],
        });

        setAlertMessage("Message stored for your baby to find");
        setAlertTitle("Message Stored");
      } else {
        await ventToPartner(token, text);
        await queryClient.invalidateQueries({
          queryKey: ["ventMessagesSent", user?.id],
        });

        setAlertTitle("Vented Successfully");
        setAlertMessage("Vent message stored for your baby to see");
      }

      await queryClient.invalidateQueries({
        queryKey: ["recentActivities", user?.id],
      });

      setInputModalVisible(false);
      setShowSuccess(true);
    } catch (err: any) {
      setToastMessage(
        err?.response?.data?.message || "Failed to send sweet message"
      );
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
    } catch (err: any) {
      setToastMessage(err?.response?.data?.message || "Failed to load message");
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

  // use effects
  useEffect(() => {
    if (!viewModalVisible && viewType) {
      queryClient.invalidateQueries({
        queryKey: [
          viewType === "sweet" ? "unseenSweetMessage" : "unseenVentMessage", user?.id
        ],
      });

      queryClient.invalidateQueries({
        queryKey: [
          viewType === "sweet" ? "sweetMessagesSent" : "ventMessagesSent", user?.id
        ],
      });

      queryClient.invalidateQueries({
        queryKey: [
          viewType === "sweet"
            ? "sweetMessagesReceived"
            : "ventMessagesReceived",
            user?.id
        ],
      });
      setViewType(null);
    }
  }, [viewModalVisible]);

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
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [toastMessage]);

  {
    deleting && (
      <View style={styles.loadingOverlay}>
        <ActivityIndicator size="large" color="#e03487" />
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: "#23243a" }}>
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
          onViewAllSent={() => navigation.navigate("SentMessagesScreen")}
          onViewAllReceived={() =>
            navigation.navigate("ReceivedMessagesScreen")
          }
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
          visible={showSuccess}
          type="success"
          title={alertTitle}
          message={alertMessage}
          buttonText="Great"
          onClose={() => setShowSuccess(false)}
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

      {showToast && (
        <View style={styles.toast}>
          <Text style={styles.toastText}>{toastMessage}</Text>
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
  toast: {
    position: "absolute",
    bottom: 60,
    left: 20,
    right: 20,
    backgroundColor: "#e03487",
    padding: 14,
    borderRadius: 10,
    alignItems: "center",
    zIndex: 100,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
  },
  toastText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
  centered: {
    flex: 1,
    backgroundColor: "#23243a",
    alignItems: "center",
    justifyContent: "center",
  },
});
