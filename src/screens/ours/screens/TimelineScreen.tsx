// external
import { useState, useEffect, useMemo } from "react";
import {
  View,
  ScrollView,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  TextInput,
  FlatList,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { useMutation, useQueryClient } from "@tanstack/react-query";

// internal
import { createTimelineRecord } from "../../../services/api/ours/timelineService";
import { formatDateYearly } from "../../../utils/formatters/formatDate";
import { useAuth } from "../../../contexts/AuthContext";
import useToken from "../../../hooks/useToken";
import { useTimeline } from "../../../hooks/useTimeline";
import { useTheme } from "../../../theme/ThemeContext";

// content
import Shimmer from "../../../components/skeletons/Shimmer";

const TimelineScreen = () => {
  // variables
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const token = useToken();
  const { theme } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);

  // use states
  const [modalVisible, setModalVisible] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [showToast, setShowToast] = useState(false);

  // data
  const {
    data: timeline = [],
    refetch: refetchTimeline,
    isLoading: isTimelineLoading,
  } = useTimeline(token, user?.id);

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

  // handlers
  const addTimelineMutation = useMutation({
    mutationFn: async (record: string) => {
      if (!token) {
        setToastMessage("Your session has expired. Log in again and retry.");
        return;
      }
      return await createTimelineRecord(token, record);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["timeline", user?.id] });
      queryClient.invalidateQueries({
        queryKey: ["recentActivities", user?.id],
      });

      setModalVisible(false);
      setToastMessage("New timeline event added");
      setInputValue("");
    },
    onError: (err: any) => {
      setError(err.response?.data?.error || "Failed to add timeline event");
    },
  });

  const handleAddEvent = () => {
    if (inputValue.trim()) {
      addTimelineMutation.mutate(inputValue.trim());
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          paddingTop: 12,
          paddingHorizontal: 18,
          paddingBottom: 18,
          backgroundColor: theme.colors.background,
        }}
      >
        <Text
          style={{ color: theme.colors.text, fontSize: 17, fontWeight: "bold" }}
        >
          This is your relationship timeline
        </Text>
        <TouchableOpacity
          onPress={() => setModalVisible(true)}
          style={{
            backgroundColor: theme.colors.primary,
            borderRadius: 20,
            padding: 8,
            marginLeft: 12,
          }}
        >
          <Feather name="plus" size={15} color={theme.colors.text} />
        </TouchableOpacity>
      </View>

      {isTimelineLoading ? (
        <ScrollView
          contentContainerStyle={{
            paddingTop: 12,
            backgroundColor: theme.colors.background,
            paddingHorizontal: 16,
          }}
          showsVerticalScrollIndicator={false}
        >
          <Shimmer radius={8} height={70} style={{ width: "100%" }} />
          <View style={{ height: 12 }} />
          <Shimmer radius={8} height={70} style={{ width: "100%" }} />
          <View style={{ height: 12 }} />
          <Shimmer radius={8} height={70} style={{ width: "100%" }} />
          <View style={{ height: 12 }} />
          <Shimmer radius={8} height={70} style={{ width: "100%" }} />
          <View style={{ height: 12 }} />
          <Shimmer radius={8} height={70} style={{ width: "100%" }} />
          <View style={{ height: 12 }} />
          <Shimmer radius={8} height={70} style={{ width: "100%" }} />
          <View style={{ height: 12 }} />
          <Shimmer radius={8} height={70} style={{ width: "100%" }} />
          <View style={{ height: 12 }} />
          <Shimmer radius={8} height={70} style={{ width: "100%" }} />
          <View style={{ height: 12 }} />
          <Shimmer radius={8} height={70} style={{ width: "100%" }} />
        </ScrollView>
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
            <Text
              style={{
                color: theme.colors.muted,
                textAlign: "center",
                marginTop: 40,
              }}
            >
              No events yet. Tap + to add your first event
            </Text>
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
              placeholderTextColor={theme.colors.muted}
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
                <Text
                  style={{ color: theme.colors.primary, fontWeight: "bold" }}
                >
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
                        ? theme.colors.primary
                        : theme.colors.primaryMuted,
                    marginLeft: 10,
                    opacity:
                      inputValue.trim() && !addTimelineMutation.isPending
                        ? 1
                        : 0.7,
                  },
                ]}
                disabled={!inputValue.trim() || addTimelineMutation.isPending}
              >
                <Text style={{ color: theme.colors.text, fontWeight: "bold" }}>
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
    timelineItem: {
      backgroundColor: theme.colors.surfaceAlt,
      borderRadius: 10,
      padding: 14,
      marginBottom: 14,
    },
    timelineText: {
      color: theme.colors.text,
      fontSize: 16,
    },
    timelineDate: {
      color: theme.colors.muted,
      fontSize: 12,
      marginTop: 6,
      textAlign: "right",
    },
    modalOverlay: {
      flex: 1,
      backgroundColor: theme.colors.modalOverlay,
      justifyContent: "center",
      alignItems: "center",
      padding: 24,
    },
    modalContent: {
      backgroundColor: theme.colors.background,
      borderRadius: 16,
      padding: 24,
      width: "100%",
      maxWidth: 400,
    },
    modalTitle: {
      color: theme.colors.text,
      fontSize: 18,
      fontWeight: "bold",
      marginBottom: 16,
    },
    input: {
      backgroundColor: theme.colors.surfaceAlt,
      color: theme.colors.text,
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

export default TimelineScreen;
