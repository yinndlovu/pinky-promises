// external
import { useState, useEffect, useMemo, useCallback } from "react";
import {
  View,
  TextInput,
  FlatList,
  Text,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
  Modal,
  StyleSheet,
} from "react-native";
import { Image } from "expo-image";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useNavigation, useRoute } from "@react-navigation/native";
import { SafeAreaView } from "react-native-safe-area-context";

// internal
import {
  getTimeLabel,
  getDayLabel,
} from "../../../utils/formatters/chatLabels";
import { useTheme } from "../../../theme/ThemeContext";
import { useAuth } from "../../../contexts/AuthContext";
import { useMessaging } from "../../../hooks/useMessaging";
import useToken from "../../../hooks/useToken";
import { useProfilePicture } from "../../../hooks/useProfilePicture";
import { buildCachedImageUrl } from "../../../utils/cache/imageCacheUtils";

// screen content
import LoadingSpinner from "../../../components/loading/LoadingSpinner";
import ConfirmationModal from "../../../components/modals/selection/ConfirmationModal";

export default function PartnerChatScreen() {
  // variables
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const route = useRoute();
  const { theme } = useTheme();
  const { user } = useAuth();
  const partnerId = (route.params as any)?.partnerId;
  const partnerName = (route.params as any)?.partnerName;
  const token = useToken();

  // socket hook
  const {
    messages,
    isLoading,
    isSending,
    partnerTyping,
    partnerActiveInChat,
    error,
    sendMessage,
    emitTyping,
    deleteAllMessages,
  } = useMessaging();

  // use states
  const [inputText, setInputText] = useState<string>("");
  const [showOptions, setShowOptions] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [avatarFetched, setAvatarFetched] = useState(false);

  const styles = useMemo(() => createMessagingStyles(theme), [theme]);

  // data
  const {
    avatarUri,
    profilePicUpdatedAt,
    fetchPicture: fetchPartnerPicture,
  } = useProfilePicture(partnerId?.toString() || "", token);

  // use effects
  useEffect(() => {
    if ((route.params as any)?.showOptions) {
      setShowOptions(true);
      navigation.setParams({ showOptions: false } as any);
    }
  }, [route.params, navigation]);

  useEffect(() => {
    if (token && partnerId) {
      Promise.resolve(fetchPartnerPicture()).finally(() =>
        setAvatarFetched(true)
      );
    }
  }, [partnerId, token]);

  useEffect(() => {
    if ((route.params as any)?.showOptions) {
      setShowOptions(true);
      navigation.setParams({ showOptions: false } as any);
    }
  }, [route.params, navigation]);

  // handlers
  const handleSend = useCallback(async () => {
    if (inputText.trim() === "") {
      return;
    }

    const text = inputText;
    setInputText("");
    await sendMessage(text, partnerId);
  }, [inputText, sendMessage, partnerId]);

  const handleChangeText = useCallback(
    (text: string) => {
      setInputText(text);
      emitTyping();
    },
    [emitTyping]
  );

  const handleDelete = useCallback(async () => {
    await deleteAllMessages();
    setShowConfirm(false);
  }, [deleteAllMessages]);

  // helpers
  const renderPartnerAvatar = () => {
    if (!partnerId) {
      return null;
    }

    if (avatarUri && profilePicUpdatedAt) {
      const timestamp = Math.floor(
        new Date(profilePicUpdatedAt).getTime() / 1000
      );
      const cachedImageUrl = buildCachedImageUrl(
        partnerId.toString(),
        timestamp
      );

      return (
        <Image
          source={{ uri: cachedImageUrl }}
          style={styles.headerAvatar}
          cachePolicy="disk"
          contentFit="cover"
          transition={200}
        />
      );
    }

    if (!avatarFetched) {
      return <View style={styles.headerAvatar} />;
    }

    return (
      <Image
        source={require("../../../assets/default-avatar-two.png")}
        style={styles.headerAvatar}
        cachePolicy="disk"
        contentFit="cover"
        transition={200}
      />
    );
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <LoadingSpinner size="medium" />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={0}
      >
        <View style={styles.header}>
          <View style={styles.headerContent}>
            {renderPartnerAvatar()}
            <View style={styles.headerTextContainer}>
              <Text style={styles.headerName}>{partnerName || "Partner"}</Text>
              {partnerActiveInChat && (
                <Text style={styles.activeStatus}>Active in chat</Text>
              )}
            </View>
          </View>
        </View>
        {error && (
          <View style={styles.errorBar}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        {partnerTyping && (
          <View style={styles.typingIndicatorWrapper}>
            <Text style={styles.typingIndicatorText}>Partner is typing...</Text>
          </View>
        )}

        <FlatList
          data={messages}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.messagesContainer}
          renderItem={({ item, index }) => {
            const currentDay = getDayLabel(item.timestamp);
            const prevMsg = index > 0 ? messages[index - 1] : null;
            const prevDay = prevMsg ? getDayLabel(prevMsg.timestamp) : null;
            const showDayLabel = currentDay !== prevDay;
            const isUser = item.senderId === user?.id;

            return (
              <View style={styles.messageWrapper}>
                {showDayLabel && (
                  <View style={styles.dayLabelWrapper}>
                    <Text style={styles.dayLabel}>{currentDay}</Text>
                  </View>
                )}
                <View
                  style={[
                    styles.messageContainer,
                    isUser
                      ? styles.messageContainerUser
                      : styles.messageContainerPartner,
                  ]}
                >
                  <View
                    style={[
                      styles.messageBubble,
                      isUser
                        ? styles.messageBubbleUser
                        : styles.messageBubblePartner,
                    ]}
                  >
                    <Text
                      style={[
                        styles.messageText,
                        isUser
                          ? styles.messageTextUser
                          : styles.messageTextPartner,
                      ]}
                    >
                      {item.text}
                    </Text>
                  </View>
                  <Text
                    style={[
                      styles.timeLabel,
                      isUser ? styles.timeLabelUser : styles.timeLabelPartner,
                    ]}
                  >
                    {getTimeLabel(item.timestamp)}
                  </Text>
                </View>
              </View>
            );
          }}
        />

        <View style={[styles.inputBar, { paddingBottom: insets.bottom }]}>
          <TextInput
            style={styles.input}
            placeholder="Type your message..."
            placeholderTextColor={theme.colors.muted}
            value={inputText}
            onChangeText={handleChangeText}
            editable={!isSending}
            multiline
            maxLength={500}
          />
          <TouchableOpacity
            style={[
              styles.sendButton,
              (isSending || inputText.trim() === "") &&
                styles.sendButtonDisabled,
            ]}
            onPress={handleSend}
            disabled={isSending || inputText.trim() === ""}
            activeOpacity={0.7}
          >
            <Text style={styles.sendButtonText}>Send</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>

      <Modal
        visible={showOptions}
        transparent
        animationType="fade"
        onRequestClose={() => setShowOptions(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPressOut={() => setShowOptions(false)}
        >
          <View style={styles.optionsMenu}>
            <TouchableOpacity
              onPress={() => {
                setShowOptions(false);
                setShowConfirm(true);
              }}
              style={styles.optionsItem}
            >
              <Text style={styles.optionsText}>Clear messages</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>

      <ConfirmationModal
        visible={showConfirm}
        message="Are you sure you want to delete all messages?"
        confirmText="Clear"
        cancelText="Cancel"
        onConfirm={handleDelete}
        onCancel={() => setShowConfirm(false)}
        onClose={() => setShowConfirm(false)}
      />
    </SafeAreaView>
  );
}

const createMessagingStyles = (theme: ReturnType<typeof useTheme>["theme"]) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    loadingContainer: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
    },
    header: {
      backgroundColor: theme.colors.background,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border,
      paddingVertical: 12,
      paddingHorizontal: 16,
    },
    headerContent: {
      flexDirection: "row",
      alignItems: "center",
    },
    headerAvatar: {
      width: 40,
      height: 40,
      borderRadius: 20,
      borderWidth: 1,
      borderColor: theme.colors.border,
      marginRight: 12,
    },
    headerTextContainer: {
      flex: 1,
    },
    headerName: {
      fontSize: 18,
      fontWeight: "bold",
      color: theme.colors.text,
      marginBottom: 2,
    },
    activeStatus: {
      fontSize: 12,
      color: theme.colors.primary,
      fontWeight: "500",
    },
    errorBar: {
      backgroundColor: theme.colors.surfaceAlt,
      paddingVertical: 8,
      paddingHorizontal: 16,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border,
    },
    errorText: {
      color: "#ff4444",
      fontSize: 13,
      textAlign: "center",
    },
    typingIndicatorWrapper: {
      paddingHorizontal: 16,
      paddingVertical: 8,
      backgroundColor: theme.colors.surfaceAlt,
    },
    typingIndicatorText: {
      color: theme.colors.primary,
      fontSize: 13,
      fontStyle: "italic",
    },
    messagesContainer: {
      paddingTop: 16,
      paddingBottom: 16,
      paddingHorizontal: 12,
    },
    messageWrapper: {
      marginBottom: 8,
    },
    dayLabelWrapper: {
      alignItems: "center",
      marginVertical: 12,
    },
    dayLabel: {
      backgroundColor: theme.colors.surfaceAlt,
      color: theme.colors.muted,
      paddingHorizontal: 12,
      paddingVertical: 4,
      borderRadius: 12,
      fontSize: 12,
      fontWeight: "600",
      overflow: "hidden",
    },
    senderLabel: {
      fontSize: 12,
      marginBottom: 4,
      marginHorizontal: 12,
      fontWeight: "600",
    },
    senderLabelUser: {
      alignSelf: "flex-end",
      color: theme.colors.primary,
    },
    senderLabelPartner: {
      alignSelf: "flex-start",
      color: theme.colors.muted,
    },
    messageContainer: {
      marginHorizontal: 12,
    },
    messageContainerUser: {
      alignItems: "flex-end",
    },
    messageContainerPartner: {
      alignItems: "flex-start",
    },
    messageRow: {
      flexDirection: "row",
      alignItems: "flex-end",
      marginHorizontal: 12,
    },
    messageRowUser: {
      justifyContent: "flex-end",
    },
    messageRowPartner: {
      justifyContent: "flex-start",
    },
    messageBubble: {
      maxWidth: "75%",
      paddingVertical: 10,
      paddingHorizontal: 14,
      borderRadius: 18,
    },
    messageBubbleUser: {
      alignSelf: "flex-end",
      backgroundColor: theme.colors.primary,
      borderBottomRightRadius: 4,
    },
    messageBubblePartner: {
      alignSelf: "flex-start",
      backgroundColor: theme.colors.surfaceAlt,
      borderBottomLeftRadius: 4,
    },
    messageText: {
      fontSize: 15,
      lineHeight: 20,
    },
    messageTextUser: {
      color: "#ffffff",
    },
    messageTextPartner: {
      color: theme.colors.text,
    },
    timeLabel: {
      fontSize: 10,
      marginTop: 4,
      marginHorizontal: 4,
      opacity: 0.6,
    },
    timeLabelUser: {
      color: theme.colors.muted,
      textAlign: "right",
    },
    timeLabelPartner: {
      color: theme.colors.muted,
      textAlign: "left",
    },
    inputBar: {
      flexDirection: "row",
      alignItems: "flex-end",
      backgroundColor: theme.colors.background,
      paddingHorizontal: 12,
      paddingTop: 12,
      borderTopWidth: 1,
      borderTopColor: theme.colors.border,
    },
    input: {
      flex: 1,
      borderWidth: 1.5,
      borderColor: theme.colors.border,
      paddingVertical: 10,
      paddingHorizontal: 14,
      borderRadius: 20,
      color: theme.colors.text,
      backgroundColor: theme.colors.surfaceAlt,
      marginRight: 10,
      fontSize: 15,
      maxHeight: 100,
    },
    sendButton: {
      backgroundColor: theme.colors.primary,
      borderRadius: 20,
      paddingVertical: 10,
      paddingHorizontal: 20,
      justifyContent: "center",
      alignItems: "center",
      minWidth: 70,
    },
    sendButtonDisabled: {
      backgroundColor: theme.colors.primaryMuted,
      opacity: 0.5,
    },
    sendButtonText: {
      color: "#ffffff",
      fontWeight: "600",
      fontSize: 15,
    },
    modalOverlay: {
      flex: 1,
      backgroundColor: theme.colors.modalOverlay,
      justifyContent: "flex-start",
      alignItems: "flex-end",
      paddingTop: 50,
      paddingRight: 20,
    },
    optionsMenu: {
      backgroundColor: theme.colors.background,
      borderRadius: 12,
      padding: 8,
      minWidth: 160,
      shadowColor: theme.colors.shadow,
      shadowOpacity: 0.25,
      shadowRadius: 12,
      shadowOffset: { width: 0, height: 4 },
      elevation: 8,
    },
    optionsItem: {
      paddingVertical: 12,
      paddingHorizontal: 16,
    },
    optionsText: {
      color: theme.colors.primary,
      fontWeight: "600",
      fontSize: 15,
    },
  });
