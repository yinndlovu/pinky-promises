// external
import { useState, useEffect, useMemo } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  Text,
  ActivityIndicator,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useQueryClient } from "@tanstack/react-query";
import NetInfo from "@react-native-community/netinfo";

// internal
import {
  sendSweetMessage,
  viewSweetMessage,
  deleteSweetMessage,
} from "../../../services/api/portal/sweetMessageService";
import {
  ventToPartner,
  viewVentMessage,
  deleteVentMessage,
} from "../../../services/api/portal/ventMessageService";
import { Message } from "../../../types/Message";
import { useAuth } from "../../../contexts/AuthContext";
import useToken from "../../../hooks/useToken";
import { useTheme } from "../../../theme/ThemeContext";
import { usePortal } from "../../../hooks/usePortal";
import { usePortalSelector } from "../../../hooks/usePortalSelector";

// screen content
import SweetMessagesSection from "../components/SweetMessagesSection";
import VentMessagesSection from "../components/VentMessagesSection";
import ConfirmationModal from "../../../components/modals/selection/ConfirmationModal";
import MessageInputModal from "../../../components/modals/input/MessageInputModal";
import ViewMessageModal from "../../../components/modals/output/ViewMessageModal";
import AlertModal from "../../../components/modals/output/AlertModal";
import Shimmer from "../../../components/skeletons/Shimmer";

// types
type Props = NativeStackScreenProps<any, any>;

export default function PortalScreen({ navigation }: Props) {
  // variables
  const insets = useSafeAreaInsets();
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const token = useToken();
  const { theme } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);

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
  const [viewLoading, setViewLoading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [loading, setLoading] = useState(false);

  // fetch portal data
  const {
    data: _portalData,
    isLoading: portalDataLoading,
    refetch: refetchPortalData,
  } = usePortal(token, user?.id);

  // select portal data from selector
  const sweetMessagesSent =
    usePortalSelector(user?.id, (portal) => portal?.sentSweetMessages) || [];
  const sweetMessagesReceived =
    usePortalSelector(user?.id, (portal) => portal?.receivedSweetMessages) ||
    [];
  const unseenSweetMessage =
    usePortalSelector(user?.id, (portal) => portal?.unseenSweetMessage) || null;
  const unseenVentMessage =
    usePortalSelector(user?.id, (portal) => portal?.unseenVentMessage) || null;
  const ventMessagesSent =
    usePortalSelector(user?.id, (portal) => portal?.sentVentMessages) || [];

  // handlers
  const handleDelete = async () => {
    try {
      if (!token) {
        setToastMessage("Your session has expired. Log in and retry.");
        return;
      }
      if (!selectedMessage) {
        return;
      }

      setDeleting(true);

      if (inputType === "sweet") {
        await deleteSweetMessage(token, selectedMessage.id);
        await queryClient.invalidateQueries({
          queryKey: ["portal", user?.id],
        });
        await queryClient.invalidateQueries({
          queryKey: ["sentSweetMessages", user?.id],
        });

        setToastMessage("Sweet message deleted");
      } else {
        await deleteVentMessage(token, selectedMessage.id);
        await queryClient.invalidateQueries({
          queryKey: ["portal", user?.id],
        });

        setToastMessage("Vent message deleted");
      }

      setDeleting(false);
      setConfirmVisible(false);
    } catch (err: any) {
      setToastMessage(err.response?.data?.error || "Failed to delete message");
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
        sweetMessagesSent.some((m: Message) => m.id === msg.id)) ||
      (inputType === "vent" &&
        ventMessagesSent.some((m: Message) => m.id === msg.id));

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
    if (!token) {
      setToastMessage("Your session has expired. Log in again and retry.");
      return;
    }

    setLoading(true);
    try {
      if (inputType === "sweet") {
        await sendSweetMessage(token, text);
        await queryClient.invalidateQueries({
          queryKey: ["portal", user?.id],
        });
        await queryClient.invalidateQueries({
          queryKey: ["sentSweetMessages", user?.id],
        });

        setAlertMessage("Message stored for your baby to find.");
        setAlertTitle("Message Stored");
      } else {
        await ventToPartner(token, text);
        await queryClient.invalidateQueries({
          queryKey: ["portal", user?.id],
        });

        setAlertTitle("Vented Successfully");
        setAlertMessage("Vent message stored for your baby to see.");
      }

      await queryClient.invalidateQueries({
        queryKey: ["portal", user?.id],
      });

      setInputModalVisible(false);
      setShowSuccess(true);
    } catch (err: any) {
      setToastMessage(
        err.response?.data?.error || "Failed to send sweet message"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleViewMessage = async (msg: Message, type: "sweet" | "vent") => {
    if (!token) {
      setToastMessage("Your session has expired. Log in again and retry.");
      return;
    }

    setViewLoading(true);
    try {
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

      await queryClient.invalidateQueries({
        queryKey: ["home", user?.id],
      });
      await queryClient.invalidateQueries({
        queryKey: ["portal", user?.id],
      });
    } catch (err: any) {
      setToastMessage(err.response?.data?.error || "Failed to load message");
    } finally {
      setViewLoading(false);
    }
  };

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

  if (portalDataLoading) {
    <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <ScrollView
        contentContainerStyle={[styles.container, { paddingTop: insets.top }]}
        showsVerticalScrollIndicator={false}
      >
        <Shimmer
          radius={8}
          height={30}
          style={{ width: "100%", marginTop: 15 }}
        />
        <View style={{ height: 12 }} />
        <Shimmer radius={8} height={55} style={{ width: "100%" }} />
        <View style={{ height: 12 }} />
        <Shimmer radius={8} height={55} style={{ width: "100%" }} />
        <View style={{ height: 12 }} />
        <Shimmer radius={8} height={55} style={{ width: "100%" }} />
        <View style={{ height: 12 }} />
        <Shimmer radius={8} height={55} style={{ width: "100%" }} />
        <View style={{ height: 12 }} />
        <Shimmer
          radius={8}
          height={55}
          style={{ width: "100%", marginBottom: 40 }}
        />
      </ScrollView>
    </View>;
  }

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
          <Text style={{ color: theme.colors.text, textAlign: "center" }}>
            You are offline
          </Text>
        </View>
      )}
      <ScrollView
        contentContainerStyle={[styles.container, { paddingTop: insets.top }]}
        showsVerticalScrollIndicator={false}
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
            backgroundColor: theme.colors.absoluteFillObject,
            justifyContent: "center",
            alignItems: "center",
            zIndex: 1000,
          }}
        >
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text
            style={{
              color: theme.colors.text,
              marginTop: 16,
              fontWeight: "bold",
            }}
          >
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

const createStyles = (theme: ReturnType<typeof useTheme>["theme"]) =>
  StyleSheet.create({
    container: {
      paddingHorizontal: 16,
      paddingBottom: 150,
      alignItems: "stretch",
      backgroundColor: theme.colors.background,
      minHeight: "100%",
    },
    loadingOverlay: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: theme.colors.absoluteFillObject,
      justifyContent: "center",
      alignItems: "center",
      borderRadius: 16,
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
