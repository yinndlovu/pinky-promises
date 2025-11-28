// external
import { useEffect, useState, useMemo } from "react";
import {
  View,
  ScrollView,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
} from "react-native";
import { useQuery } from "@tanstack/react-query";
import { useSafeAreaInsets } from "react-native-safe-area-context";

// internal
import {
  getReceivedSweetMessages,
  viewSweetMessage,
} from "../../../services/api/portal/sweetMessageService";
import ViewMessageModal from "../../../components/modals/output/ViewMessageModal";
import { Message } from "../../../types/Message";
import { formatDateDMY } from "../../../utils/formatters/formatDate";
import { useAuth } from "../../../contexts/AuthContext";
import useToken from "../../../hooks/useToken";
import { useTheme } from "../../../theme/ThemeContext";

// content
import LoadingSpinner from "../../../components/loading/LoadingSpinner";
import Shimmer from "../../../components/skeletons/Shimmer";

const ReceivedMessagesScreen = () => {
  // variables
  const { user } = useAuth();
  const token = useToken();
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const styles = useMemo(() => createStyles(theme), [theme]);

  // use states
  const [viewModalVisible, setViewModalVisible] = useState(false);
  const [viewedMessage, setViewedMessage] = useState<string>("");
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [showToast, setShowToast] = useState(false);

  // use states (processing)
  const [viewLoading, setViewLoading] = useState(false);

  // fetch functions
  const {
    data: messages = [],
    isLoading: messagesLoading,
    error,
    refetch: refetchMessages,
  } = useQuery<Message[]>({
    queryKey: ["receivedSweetMessages", user?.id],
    queryFn: async () => {
      const res = await getReceivedSweetMessages(token!);
      return res.sweets || res;
    },
    enabled: !!user?.id && !!token,
    staleTime: 1000 * 60 * 60,
  });

  // handlers
  const handleViewMessage = async (msg: Message) => {
    if (!token) {
      setToastMessage("Your session has expired. Log in again and retry.");
      return;
    }

    setViewLoading(true);
    try {
      const res = await viewSweetMessage(token, msg.id);
      setViewedMessage(res.sweet);
      setViewModalVisible(true);
    } catch (err: any) {
      setToastMessage(err?.response?.data?.message || "Failed to load message");
    } finally {
      setViewLoading(false);
    }
  };

  // use effects
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

  if (messagesLoading) {
    <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <ScrollView
        contentContainerStyle={{
          paddingTop: insets.top,
          backgroundColor: theme.colors.background,
          paddingHorizontal: 16,
        }}
        showsVerticalScrollIndicator={false}
      >
        <Shimmer
          radius={8}
          height={40}
          style={{ width: "100%", marginTop: 16 }}
        />
        <View style={{ height: 12 }} />
        <Shimmer radius={8} height={40} style={{ width: "100%" }} />
        <View style={{ height: 12 }} />
        <Shimmer radius={8} height={40} style={{ width: "100%" }} />
        <View style={{ height: 12 }} />
        <Shimmer radius={8} height={40} style={{ width: "100%" }} />
        <View style={{ height: 12 }} />
        <Shimmer radius={8} height={40} style={{ width: "100%" }} />
        <View style={{ height: 12 }} />
        <Shimmer radius={8} height={40} style={{ width: "100%" }} />
        <View style={{ height: 12 }} />
        <Shimmer radius={8} height={40} style={{ width: "100%" }} />
        <View style={{ height: 12 }} />
        <Shimmer
          radius={8}
          height={40}
          style={{ width: "100%", marginBottom: 40 }}
        />
      </ScrollView>
    </View>;
  }

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <Text
        style={{
          color: theme.colors.text,
          fontSize: 15,
          fontWeight: "600",
          margin: 16,
          textAlign: "center",
        }}
      >
        These are all the sweet messages you received
      </Text>
      {error ? (
        <Text style={{ color: "red", textAlign: "center", marginTop: 40 }}>
          {error.message || "Failed to load messages"}
        </Text>
      ) : (
        <FlatList
          data={messages}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ padding: 18, paddingBottom: 40 }}
          renderItem={({ item }) => (
            <TouchableOpacity
              onPress={() => handleViewMessage(item)}
              activeOpacity={0.7}
              style={styles.memoryItem}
            >
              <Text style={styles.memoryText}>{item.message}</Text>
              <View style={styles.metaRow}>
                <Text style={styles.metaText}>
                  {formatDateDMY(item.createdAt || "")}
                </Text>
              </View>
            </TouchableOpacity>
          )}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
          ListEmptyComponent={
            <Text
              style={{
                color: theme.colors.muted,
                textAlign: "center",
                marginTop: 40,
              }}
            >
              No received messages yet
            </Text>
          }
        />
      )}

      <ViewMessageModal
        visible={viewModalVisible}
        onClose={() => setViewModalVisible(false)}
        message={viewedMessage}
        type="sweet"
      />

      {viewLoading && (
        <View style={styles.centered}>
          <LoadingSpinner showMessage={false} size="small" />
        </View>
      )}

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
    centered: {
      flex: 1,
      backgroundColor: theme.colors.background,
      alignItems: "center",
      justifyContent: "center",
    },
    memoryItem: {
      backgroundColor: theme.colors.surfaceAlt,
      borderRadius: 12,
      padding: 16,
      marginBottom: 10,
    },
    memoryText: {
      color: theme.colors.text,
      fontSize: 15,
      lineHeight: 22,
      textAlign: "left",
      marginBottom: 6,
    },
    metaRow: {
      flexDirection: "row",
      justifyContent: "flex-end",
      marginBottom: 4,
    },
    metaText: {
      color: theme.colors.muted,
      fontSize: 12,
    },
    separator: {
      height: 1,
      backgroundColor: theme.colors.mutedAlt,
      opacity: 0.5,
      marginVertical: 8,
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
  });

export default ReceivedMessagesScreen;
