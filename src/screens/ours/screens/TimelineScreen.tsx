// external
import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  TextInput,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  RefreshControl,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

// internal
import {
  getTimeline,
  createTimelineRecord,
} from "../../../services/timelineService";
import { formatDateYearly } from "../../../helpers/formatDateHelper";

const TimelineScreen = () => {
  // variables
  const insets = useSafeAreaInsets();
  const queryClient = useQueryClient();

  // use states
  const [modalVisible, setModalVisible] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  // fetch functions
  const {
    data: timeline = [],
    isLoading: isTimelineLoading,
    refetch: refetchTimeline,
  } = useQuery({
    queryKey: ["timeline"],
    queryFn: async () => {
      const token = await AsyncStorage.getItem("token");

      if (!token) {
        throw new Error("Session expired, please log in again");
      }

      return await getTimeline(token);
    },
    staleTime: 1000 * 60 * 10,
  });

  const addTimelineMutation = useMutation({
    mutationFn: async (record: string) => {
      const token = await AsyncStorage.getItem("token");

      if (!token) {
        throw new Error("Session expired, please log in again");
      }

      return await createTimelineRecord(token, record);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["timeline"] });
      setModalVisible(false);
      setInputValue("");
    },
    onError: (err: any) => {
      setError(err?.message || "Failed to add timeline event");
    },
  });

  const handleAddEvent = () => {
    if (inputValue.trim()) {
      addTimelineMutation.mutate(inputValue.trim());
    }
  };

  // refresh screen
  const onRefresh = async () => {
    setRefreshing(true);
    await refetchTimeline();
    setRefreshing(false);
  };

  return (
    <View style={{ flex: 1, backgroundColor: "#23243a" }}>
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          paddingTop: 12,
          paddingHorizontal: 18,
          paddingBottom: 18,
          backgroundColor: "#23243a",
        }}
      >
        <Text style={{ color: "#fff", fontSize: 17, fontWeight: "bold" }}>
          This is your relationship timeline
        </Text>
        <TouchableOpacity
          onPress={() => setModalVisible(true)}
          style={{
            backgroundColor: "#e03487",
            borderRadius: 20,
            padding: 8,
            marginLeft: 12,
          }}
        >
          <Feather name="plus" size={15} color="#fff" />
        </TouchableOpacity>
      </View>

      {isTimelineLoading ? (
        <Text style={{ color: "#aaa", textAlign: "center", marginTop: 40 }}>
          Loading...
        </Text>
      ) : (
        <FlatList
          data={Array.isArray(timeline) ? timeline : []}
          keyExtractor={(item, idx) => item.id?.toString() || idx.toString()}
          contentContainerStyle={{ padding: 18 }}
          renderItem={({ item }) => (
            <View style={styles.timelineItem}>
              <Text style={styles.timelineText}>{item.record}</Text>
              <Text style={styles.timelineDate}>
                {item.createdAt ? formatDateYearly(item.createdAt) : ""}
              </Text>
            </View>
          )}
          ListEmptyComponent={
            <Text style={{ color: "#aaa", textAlign: "center", marginTop: 40 }}>
              No events yet. Tap + to add your first event
            </Text>
          }
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor="#e03487"
              colors={["#e03487"]}
              progressBackgroundColor="#23243a"
            />
          }
        />
      )}

      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setModalVisible(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          style={styles.modalOverlay}
        >
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Add a timeline event</Text>
            <TextInput
              style={styles.input}
              placeholder="What happened?"
              placeholderTextColor="#b0b3c6"
              value={inputValue}
              onChangeText={setInputValue}
              multiline
            />
            <View style={{ flexDirection: "row", justifyContent: "flex-end" }}>
              <TouchableOpacity
                onPress={() => setModalVisible(false)}
                style={[
                  styles.modalButton,
                  {
                    backgroundColor: "transparent",
                  },
                ]}
              >
                <Text style={{ color: "#e03487", fontWeight: "bold" }}>
                  Cancel
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleAddEvent}
                style={[
                  styles.modalButton,
                  {
                    backgroundColor:
                      inputValue.trim() && !addTimelineMutation.isPending
                        ? "#e03487"
                        : "#a0225c",
                    marginLeft: 10,
                    opacity:
                      inputValue.trim() && !addTimelineMutation.isPending
                        ? 1
                        : 0.7,
                  },
                ]}
                disabled={!inputValue.trim() || addTimelineMutation.isPending}
              >
                <Text style={{ color: "#fff", fontWeight: "bold" }}>
                  {addTimelineMutation.isPending ? "Adding..." : "Add"}
                </Text>
              </TouchableOpacity>
            </View>
            {error && (
              <Text style={{ color: "red", marginTop: 10 }}>{error}</Text>
            )}
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  timelineItem: {
    backgroundColor: "#1b1c2e",
    borderRadius: 10,
    padding: 14,
    marginBottom: 14,
  },
  timelineText: {
    color: "#fff",
    fontSize: 16,
  },
  timelineDate: {
    color: "#b0b3c6",
    fontSize: 12,
    marginTop: 6,
    textAlign: "right",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  modalContent: {
    backgroundColor: "#23243a",
    borderRadius: 16,
    padding: 24,
    width: "100%",
    maxWidth: 400,
  },
  modalTitle: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 16,
  },
  input: {
    backgroundColor: "#1b1c2e",
    color: "#fff",
    borderRadius: 8,
    padding: 12,
    minHeight: 60,
    marginBottom: 18,
    fontSize: 16,
  },
  modalButton: {
    paddingVertical: 10,
    paddingHorizontal: 22,
    borderRadius: 8,
  },
});

export default TimelineScreen;
