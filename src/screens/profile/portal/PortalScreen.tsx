import React, { useState } from "react";
import { View, StyleSheet, ScrollView } from "react-native";
import {
  sweetMessagesSent,
  sweetMessagesReceived,
  ventMessagesSent,
  ventMessagesReceived,
} from "../../../types/staticMessages";
import { Message } from "../../../types/types";
import SweetMessagesSection from "./SweetMessagesSection";
import VentMessagesSection from "./VentMessagesSection";
import ConfirmationModal from "../../../components/modals/ConfirmationModal";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function PortalScreen() {
  // variables
  const insets = useSafeAreaInsets();

  // use states
  const [confirmVisible, setConfirmVisible] = useState(false);
  const [selectedMessage, setSelectedMessage] = useState<Message | undefined>(
    undefined
  );

  // handlers
  const handleDelete = () => {
    setConfirmVisible(false);
  };

  const handleLongPress = (msg: Message) => {
    setSelectedMessage(msg);
    setConfirmVisible(true);
  };

  return (
    <View style={{ flex: 1, backgroundColor: "#23243a" }}>
      <ScrollView
        contentContainerStyle={[styles.container, { paddingTop: insets.top }]}
        showsVerticalScrollIndicator={false}
      >
        <SweetMessagesSection
          sent={sweetMessagesSent}
          received={sweetMessagesReceived}
          onLongPress={handleLongPress}
          onViewAllSent={() => {}}
          onViewAllReceived={() => {}}
        />
        <VentMessagesSection
          sent={ventMessagesSent}
          received={ventMessagesReceived}
          onLongPress={handleLongPress}
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
