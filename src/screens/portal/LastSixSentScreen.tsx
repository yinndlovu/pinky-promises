// external
import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useQuery } from "@tanstack/react-query";
import { useSafeAreaInsets } from "react-native-safe-area-context";

// internal
import {
  getSentSweetMessages,
  viewSweetMessage,
} from "../../services/sweetMessageService";
import { Message } from "../../types/Message";

// content
import ViewMessageModal from "../../components/modals/ViewMessageModal";

const LastSixSentScreen = () => {
  // variables
  const insets = useSafeAreaInsets();

  // use states
  const [refreshing, setRefreshing] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [viewLoading, setViewLoading] = useState(false);
  const [viewModalVisible, setViewModalVisible] = useState(false);
  const [viewedMessage, setViewedMessage] = useState<string>("");
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");

  const {
    data: messages = [],
    isLoading: messagesLoading,
    error,
    refetch: refetchMessages,
  } = useQuery<Message[]>({
    queryKey: ["lastSixSentMessages"],
    queryFn: async () => {
      const token = await AsyncStorage.getItem("token");

      if (!token) {
        throw new Error("Session expired, please log in again");
      }

      const res = await getSentSweetMessages(token);
      return (res.sweets || res).slice(0, 6);
    },
    staleTime: 1000 * 60 * 10,
  });

  const onRefresh = async () => {
    setRefreshing(true);
    await refetchMessages();
    setRefreshing(false);
  };

  const handleViewMessage = async (msg: Message) => {
    setViewLoading(true);

    try {
      const token = await AsyncStorage.getItem("token");

      if (!token) {
        return;
      }

      const res = await viewSweetMessage(token, msg.id);
      setViewedMessage(res.sweet);
      setViewModalVisible(true);
    } catch (err: any) {
      setAlertMessage(err?.response?.data?.message || "Failed to load message");
      setAlertVisible(true);
    } finally {
      setViewLoading(false);
    }
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) {
      return "";
    }

    const date = new Date(dateStr);
    return date.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  return (
    <View style={{ flex: 1, backgroundColor: "#23243a" }}>
      <Text
        style={{
          color: "#fff",
          fontSize: 15,
          fontWeight: "600",
          margin: 18,
          textAlign: "center",
        }}
      >
        These are the last six sweet messages you sent
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
                  {formatDate(item.createdAt || "")}
                </Text>
              </View>
            </TouchableOpacity>
          )}
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
              No sent messages yet
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

      {alertVisible && (
        <View style={styles.toast}>
          <Text style={styles.toastText}>{alertMessage}</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
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
  toast: {
    position: "absolute",
    bottom: 20,
    left: 20,
    right: 20,
    backgroundColor: "#e03487",
    padding: 16,
    borderRadius: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  toastText: {
    color: "#fff",
    textAlign: "center",
    fontSize: 16,
    fontWeight: "bold",
  },
});

export default LastSixSentScreen;
