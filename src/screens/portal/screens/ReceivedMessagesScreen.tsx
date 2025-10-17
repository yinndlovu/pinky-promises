// external
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { useQuery } from "@tanstack/react-query";

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

// content
import LoadingSpinner from "../../../components/loading/LoadingSpinner";

const ReceivedMessagesScreen = () => {
  // variables
  const { user } = useAuth();
  const token = useToken();

  // use states
  const [viewModalVisible, setViewModalVisible] = useState(false);
  const [viewedMessage, setViewedMessage] = useState<string>("");
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [showToast, setShowToast] = useState(false);

  // use states (processing)
  const [refreshing, setRefreshing] = useState(false);
  const [viewLoading, setViewLoading] = useState(false);

  // fetch functions
  const {
    data: messages = [],
    isLoading: messagesLoading,
    error,
    refetch: refetchMessages,
  } = useQuery<Message[]>({
    queryKey: ["lastSixReceivedMessages", user?.id],
    queryFn: async () => {
      const res = await getReceivedSweetMessages(token);

      return res.sweets || res;
    },
    enabled: !!user?.id && !!token,
    staleTime: 1000 * 60 * 10,
  });

  // handlers
  const handleViewMessage = async (msg: Message) => {
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
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [toastMessage]);

  // refresh screen
  const onRefresh = async () => {
    setRefreshing(true);
    await refetchMessages();
    setRefreshing(false);
  };

  return (
    <View style={{ flex: 1, backgroundColor: "#23243a" }}>
      <Text
        style={{
          color: "#fff",
          fontSize: 15,
          fontWeight: "600",
          margin: 16,
          textAlign: "center",
        }}
      >
        These are all the sweet messages you received
      </Text>
      {messagesLoading ? (
        <ActivityIndicator color="#e03487" style={{ marginTop: 40 }} />
      ) : error ? (
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
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor="#e03487"
              colors={["#e03487"]}
              progressBackgroundColor="#23243a"
            />
          }
          ListEmptyComponent={
            <Text
              style={{ color: "#b0b3c6", textAlign: "center", marginTop: 40 }}
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

const styles = StyleSheet.create({
  centered: {
    flex: 1,
    backgroundColor: "#23243a",
    alignItems: "center",
    justifyContent: "center",
  },
  memoryItem: {
    backgroundColor: "#1b1c2e",
    borderRadius: 12,
    padding: 16,
    marginBottom: 10,
  },
  memoryText: {
    color: "#fff",
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
    color: "#b0b3c6",
    fontSize: 12,
  },
  separator: {
    height: 1,
    backgroundColor: "#393a4a",
    opacity: 0.5,
    marginVertical: 8,
  },
  toast: {
    position: "absolute",
    bottom: 10,
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
});

export default ReceivedMessagesScreen;
