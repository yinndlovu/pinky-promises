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

// internal
import {
  getReceivedSweetMessages,
  viewSweetMessage,
} from "../../../services/sweetMessageService";
import ViewMessageModal from "../../../components/modals/output/ViewMessageModal";
import { Message } from "../../../types/Message";
import { formatDateDMY } from "../../../helpers/formatDateHelper";

const ReceivedMessagesScreen = () => {
  // use states
  const [viewModalVisible, setViewModalVisible] = useState(false);
  const [viewedMessage, setViewedMessage] = useState<string>("");
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");

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
    queryKey: ["lastSixReceivedMessages"],
    queryFn: async () => {
      const token = await AsyncStorage.getItem("token");

      if (!token) {
        throw new Error("Session expired, please log in again");
      }

      const res = await getReceivedSweetMessages(token);

      return (res.sweets || res);
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
      if (!token) return;

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
  separator: {
    height: 1,
    backgroundColor: "#393a4a",
    opacity: 0.5,
    marginVertical: 8,
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

export default ReceivedMessagesScreen;
