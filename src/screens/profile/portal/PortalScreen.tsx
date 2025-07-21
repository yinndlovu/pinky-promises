// external
import React, { useState } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  RefreshControl,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

// internal
import {
  sweetMessagesSent,
  sweetMessagesReceived,
  ventMessagesSent,
  ventMessagesReceived,
} from "../../../types/staticMessages";
import { Message } from "../../../types/types";

// screen content
import SweetMessagesSection from "./SweetMessagesSection";
import VentMessagesSection from "./VentMessagesSection";
import ConfirmationModal from "../../../components/modals/ConfirmationModal";
import MessageInputModal from "../../../components/modals/MessageInputModal";
import ViewMessageModal from "../../../components/modals/ViewMessageModal";

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

  // refresh screen
  const onRefresh = async () => {
    setRefreshing(true);
    setRefreshing(false);
  };

  // handlers
  const handleDelete = () => {
    setConfirmVisible(false);
  };

  const handleLongPress = (msg: Message) => {
    setSelectedMessage(msg);
    setConfirmVisible(true);
  };

  const handleOpenInputModal = (type: "sweet" | "vent") => {
    setInputType(type);
    setInputModalVisible(true);
  };

  const handleSendMessage = (text: string) => {
    setInputModalVisible(false);
  };

  const handleViewMessage = (msg: string, type: "sweet" | "vent") => {
    setViewedMessage(msg.text);
    setViewType(type);
    setViewModalVisible(true);
  };

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
          onAdd={() => handleOpenInputModal("sweet")}
          onViewMessage={(msg) => handleViewMessage(msg, "sweet")}
        />
        <VentMessagesSection
          sent={ventMessagesSent}
          received={ventMessagesReceived}
          onLongPress={handleLongPress}
          onAdd={() => handleOpenInputModal("vent")}
          onViewMessage={(msg) => handleViewMessage(msg, "vent")}
        />
        <ConfirmationModal
          visible={confirmVisible}
          message="Delete this message?"
          onConfirm={handleDelete}
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
        />
        <ViewMessageModal
  visible={viewModalVisible}
  onClose={() => setViewModalVisible(false)}
  message={viewedMessage}
  type={viewType}
/>
      </ScrollView>
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
});
