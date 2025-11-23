// external
import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import {
  View,
  TextInput,
  FlatList,
  Text,
  Platform,
  TouchableOpacity,
  Modal,
  KeyboardAvoidingView,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useNavigation, useRoute } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { SafeAreaView } from "react-native-safe-area-context";
import { KeyboardAwareFlatList } from "react-native-keyboard-aware-scroll-view";

// internal
import { getTimeLabel, getDayLabel } from "../../utils/formatters/chatLabels";
import { useSocket } from "../../contexts/SocketContext";
import {
  getChatMessages,
  deleteAllChatMessages,
} from "../../services/api/chat/chatService";
import { ChatMessage } from "../../types/Message";
import { createChatStyles } from "./styles/ChatScreen.styles";
import { useTheme } from "../../theme/ThemeContext";
import { sendChatMessage } from "../../services/api/chat/chatService";
import {
  createTable,
  fetchMessages,
  saveMessage,
  deleteOldMessages,
  deleteAllMessages,
} from "../../database/chatdb";

// screen content
import ConfirmationModal from "../../components/modals/selection/ConfirmationModal";

// hooks
import useToken from "../../hooks/useToken";

export default function ChatScreen() {
  // variables
  const insets = useSafeAreaInsets();
  const LAST_CLEANUP_KEY = "lastCleanupDate";
  const navigation = useNavigation();
  const route = useRoute();
  const token = useToken();
  const { theme } = useTheme();
  const { socket } = useSocket();
  const styles = useMemo(() => createChatStyles(theme), [theme]);
  const flatListRef = useRef<any>(null);

  // use states
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState<string>("");
  const [isSending, setIsSending] = useState(false);
  const [showOptions, setShowOptions] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  // check if chats have been cleaned that day
  const runCleanupOncePerDay = async () => {
    try {
      const lastCleanup = await AsyncStorage.getItem(LAST_CLEANUP_KEY);
      const now = Date.now();
      const oneDayMs = 24 * 60 * 60 * 1000;

      if (!lastCleanup || now - Number(lastCleanup) > oneDayMs) {
        await deleteOldMessages();
        await AsyncStorage.setItem(LAST_CLEANUP_KEY, now.toString());
      }
    } catch (error) {}
  };

  // fetch messages from backend
  const fetchMessagesFromBackend = useCallback(async () => {
    if (!token) {
      return;
    }

    try {
      const data = await getChatMessages(token);
      if (data.messages) {
        const formattedMessages = data.messages;
        setMessages(formattedMessages);

        // also save to local db for offline access
        for (const msg of formattedMessages) {
          try {
            await saveMessage(msg.id, msg.text, msg.sender, msg.timestamp);
          } catch (err) {}
        }
      }
    } catch (error) {
      console.error("Failed to fetch messages from backend:", error);
      // fallback to local messages
      const localMessages = await fetchMessages();
      setMessages(localMessages);
    }
  }, [token]);

  // use effects
  useEffect(() => {
    createTable();
    runCleanupOncePerDay();
    fetchMessagesFromBackend();
  }, [fetchMessagesFromBackend]);

  useEffect(() => {
    if ((route.params as any)?.showOptions) {
      setShowOptions(true);
      navigation.setParams({ showOptions: false } as any);
    }
  }, [route.params]);

  useEffect(() => {
    if (messages.length > 0) {
      flatListRef.current?.scrollToEnd({ animated: true });
    }
  }, [messages]);

  // socket event listeners
  useEffect(() => {
    if (!socket) {
      return;
    }

    const onChatMessage = (data: { message: ChatMessage; type: string }) => {
      setMessages((prev) => {
        // check if message already exists to avoid duplicates
        const exists = prev.some((m) => m.id === data.message.id);
        if (exists) {
          return prev;
        }

        if (data.message.sender === "You") {
          const recentUserMessage = prev[prev.length - 1];
          if (
            recentUserMessage?.sender === "You" &&
            recentUserMessage?.text === data.message.text &&
            Math.abs(recentUserMessage.timestamp - data.message.timestamp) <
              5000
          ) {
            return prev;
          }
        }

        return [...prev, data.message];
      });

      // save to local db
      saveMessage(
        data.message.id,
        data.message.text,
        data.message.sender,
        data.message.timestamp
      ).catch(() => {});
    };

    const onChatTyping = (data: { isTyping: boolean }) => {
      setIsSending(data.isTyping);
    };

    const onChatError = (data: { error: string }) => {
      console.error("Chat error:", data.error);
      setIsSending(false);
    };

    const onChatMessages = (data: { messages: ChatMessage[] }) => {
      if (data.messages) {
        const formattedMessages = data.messages;
        setMessages(formattedMessages);
      }
    };

    socket.on("chat:message", onChatMessage);
    socket.on("chat:typing", onChatTyping);
    socket.on("chat:error", onChatError);
    socket.on("chat:messages", onChatMessages);

    return () => {
      socket.off("chat:message", onChatMessage);
      socket.off("chat:typing", onChatTyping);
      socket.off("chat:error", onChatError);
      socket.off("chat:messages", onChatMessages);
    };
  }, [socket]);

  // handlers
  const handleDelete = async () => {
    try {
      if (token) {
        await deleteAllChatMessages(token);
      }
    } catch (error) {
      console.error("Delete error:", error);
    }

    await deleteAllMessages();
    setMessages([]);
    setShowConfirm(false);
  };

  const handleSend = async () => {
    if (inputText.trim() === "") {
      return;
    }

    const timestamp = Date.now();
    const userMessage: ChatMessage = {
      id: timestamp.toString(),
      text: inputText,
      sender: "You",
      timestamp,
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputText("");
    setIsSending(true);

    // save to local db
    try {
      await saveMessage(
        userMessage.id,
        userMessage.text,
        userMessage.sender,
        userMessage.timestamp
      );
    } catch (err: any) {}

    // send via socket if connected, otherwise fallback to http
    if (socket?.connected) {
      socket.emit("chat:send", { message: inputText });
    } else {
      try {
        const data = await sendChatMessage(token, inputText);

        if (data.userMessage && data.botReply) {
          setMessages((prev) => [...prev, data.botReply]);
          await saveMessage(
            data.botReply.id,
            data.botReply.text,
            data.botReply.sender,
            data.botReply.timestamp
          );
        }

        setIsSending(false);
      } catch (error) {
        console.error("Send message error:", error);
        setIsSending(false);
      }
    }
  };

  const shouldShowSender = (index: number) => {
    if (index === 0) {
      return true;
    }

    return messages[index - 1]?.sender !== messages[index].sender;
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={insets.bottom + 8}
      >
        <KeyboardAwareFlatList
          ref={flatListRef}
          data={messages}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ paddingBottom: 80 }}
          renderItem={({ item, index }) => {
            const currentDay = getDayLabel(item.timestamp);
            const prevMsg = index > 0 ? messages[index - 1] : null;
            const prevDay = prevMsg ? getDayLabel(prevMsg.timestamp) : null;
            const showDayLabel = currentDay !== prevDay;

            return (
              <View style={{ marginBottom: 2 }}>
                {showDayLabel && (
                  <View style={styles.dayLabelWrapper}>
                    <Text style={styles.dayLabel}>{currentDay}</Text>
                  </View>
                )}
                {shouldShowSender(index) && (
                  <Text
                    style={[
                      styles.senderLabel,
                      item.sender === "You"
                        ? styles.senderLabelUser
                        : styles.senderLabelBot,
                    ]}
                  >
                    {item.sender}
                  </Text>
                )}
                <View style={{ flexDirection: "row", alignItems: "flex-end" }}>
                  <Text
                    style={item.sender === "You" ? styles.user : styles.bot}
                  >
                    {item.text}
                  </Text>
                  <Text style={styles.timeLabel}>
                    {getTimeLabel(item.timestamp)}
                  </Text>
                </View>
              </View>
            );
          }}
          enableOnAndroid={true}
          extraScrollHeight={100}
          keyboardOpeningTime={0}
        />
        {isSending && (
          <View style={styles.typingIndicatorWrapper}>
            <Text style={styles.typingIndicatorText}>Lily is typing...</Text>
          </View>
        )}
        <View
          style={[
            styles.inputBar,
            {
              bottom: insets.bottom + 8,
              left: 0,
              right: 0,
            },
          ]}
        >
          <TextInput
            style={styles.input}
            placeholder="Type your message..."
            placeholderTextColor={theme.colors.muted}
            value={inputText}
            onChangeText={setInputText}
            editable={!isSending}
          />
          <TouchableOpacity
            style={[
              styles.sendButton,
              isSending || inputText.trim() === ""
                ? styles.sendButtonDisabled
                : null,
            ]}
            onPress={handleSend}
            disabled={isSending || inputText.trim() === ""}
            activeOpacity={0.7}
          >
            <Text style={styles.sendButtonText}>Send</Text>
          </TouchableOpacity>
        </View>
        <Modal
          visible={showOptions}
          transparent
          animationType="fade"
          onRequestClose={() => setShowOptions(false)}
        >
          <TouchableOpacity
            style={{
              flex: 1,
              backgroundColor: theme.colors.modalOverlay,
              justifyContent: "flex-start",
              alignItems: "flex-end",
              paddingTop: 50,
              paddingRight: 20,
            }}
            activeOpacity={1}
            onPressOut={() => setShowOptions(false)}
          >
            <View
              style={{
                backgroundColor: theme.colors.background,
                borderRadius: 8,
                padding: 8,
                minWidth: 120,
                shadowColor: theme.colors.shadow,
                shadowOpacity: 0.2,
                shadowRadius: 8,
                elevation: 4,
              }}
            >
              <TouchableOpacity
                onPress={() => {
                  setShowOptions(false);
                  setShowConfirm(true);
                }}
                style={{ paddingVertical: 10, paddingHorizontal: 16 }}
              >
                <Text
                  style={{ color: theme.colors.primary, fontWeight: "bold" }}
                >
                  Clear chat
                </Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        </Modal>
      </KeyboardAvoidingView>

      <ConfirmationModal
        visible={showConfirm}
        message="Are you sure you want to delete all chat messages?"
        confirmText="Clear"
        cancelText="Cancel"
        onConfirm={handleDelete}
        onCancel={() => setShowConfirm(false)}
        onClose={() => setShowConfirm(false)}
      />
    </SafeAreaView>
  );
}
