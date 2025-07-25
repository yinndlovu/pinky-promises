// external
import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  TextInput,
  FlatList,
  Text,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  TouchableOpacity,
  Modal,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useNavigation, useRoute } from "@react-navigation/native";

// internal
import { getPartner } from "../../services/partnerService";
import { getSpecialDates } from "../../services/specialDateService";
import { useAuth } from "../../contexts/AuthContext";
import { DEEPSEEK_KEY } from "../../configuration/config";
import { getAllFavoriteMemories } from "../../services/favoriteMemoriesService";
import { getNotes } from "../../services/notesService";
import { getLoveLanguage } from "../../services/loveLanguageService";
import { getUserFavorites } from "../../services/favoritesService";
import { getAboutUser } from "../../services/aboutUserService";
import {
  saveKeyDetail,
  fetchKeyDetails,
} from "../../services/ai/aiKeyDetailsService";
import { FAVORITE_LABELS } from "../../helpers/profileHelpers";
import { ChatMessage } from "../../types/Message";

// screen content
import styles from "./styles/ChatScreen.styles";
import ConfirmationModal from "../../components/modals/ConfirmationModal";

// chats database
import {
  createTable,
  fetchMessages,
  saveMessage,
  deleteOldMessages,
  deleteAllMessages,
} from "../../database/chatdb";

export default function ChatScreen() {
  // variables
  const { user } = useAuth();
  const userId = user?.id;
  const insets = useSafeAreaInsets();
  const EXTRA_KEYBOARD_PADDING = 50;
  const LAST_CLEANUP_KEY = "lastCleanupDate";
  const navigation = useNavigation();
  const route = useRoute();

  // use states
  const [specialDates, setSpecialDates] = useState<any[]>([]);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState<string>("");
  const [isSending, setIsSending] = useState(false);
  const [showOptions, setShowOptions] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  // use states (users details)
  const [favoriteMemories, setFavoriteMemories] = useState<any[]>([]);
  const [notes, setNotes] = useState<any[]>([]);
  const [loveLanguage, setLoveLanguage] = useState<string>("");
  const [aboutUser, setAboutUser] = useState<string>("");
  const [favorites, setFavorites] = useState<any>({});
  const [keyDetails, setKeyDetails] = useState<any[]>([]);

  // use states (partner data)
  const [partnerLoveLanguage, setPartnerLoveLanguage] = useState<string>("");
  const [partnerFavorites, setPartnerFavorites] = useState<any>({});
  const [aboutPartner, setAboutPartner] = useState<string>("");
  const [partnerName, setPartnerName] = useState<string>("");
  const [partnerId, setPartnerId] = useState<string>("");

  // helpers
  function favoritesObjectToArray(
    favoritesObj: any
  ): { label: string; value: string }[] {
    return Object.entries(FAVORITE_LABELS)
      .map(([key, label]) =>
        favoritesObj && favoritesObj[key]
          ? { label, value: favoritesObj[key] }
          : null
      )
      .filter(Boolean) as { label: string; value: string }[];
  }

  // check if chats have been cleaned that day
  const runCleanupOncePerDay = async () => {
    try {
      const lastCleanup = await AsyncStorage.getItem(LAST_CLEANUP_KEY);
      const now = Date.now();
      const oneDayMs = 24 * 60 * 60 * 1000;

      if (!lastCleanup || now - Number(lastCleanup) > oneDayMs) {
        await deleteOldMessages();
        await AsyncStorage.setItem(LAST_CLEANUP_KEY, now.toString());
      } else {
      }
    } catch (error) {}
  };

  // fetch context
  const fetchContext = async () => {
    const token = await AsyncStorage.getItem("token");

    if (!token) {
      return;
    }

    try {
      const partner = await getPartner(token);
      setPartnerName(partner?.name || "");
      setPartnerId(partner?.id || "");
    } catch {}

    try {
      const dates = await getSpecialDates(token);
      setSpecialDates(dates || []);
    } catch {}

    try {
      const memories = await getAllFavoriteMemories(token);
      setFavoriteMemories(memories || []);
    } catch {}

    try {
      const notesData = await getNotes(token);
      setNotes(notesData || []);
    } catch {}

    try {
      const loveLang = await getLoveLanguage(token, userId);
      setLoveLanguage(loveLang || "");
    } catch {}

    try {
      const userAbout = await getAboutUser(token, userId);
      setAboutUser(userAbout || "");
    } catch {}

    try {
      const favs = await getUserFavorites(token, userId);
      setFavorites(favs || []);
    } catch {}
  };

  const fetchPartnerData = async () => {
    const token = await AsyncStorage.getItem("token");

    if (!token || !partnerId) {
      return;
    }

    try {
      const partnerLoveLang = await getLoveLanguage(token, partnerId);
      setPartnerLoveLanguage(partnerLoveLang || "");
    } catch {}

    try {
      const partnerFavs = await getUserFavorites(token, partnerId);
      setPartnerFavorites(partnerFavs || []);
    } catch {}

    try {
      const partnerAbout = await getAboutUser(token, partnerId);
      setAboutPartner(partnerAbout || "");
    } catch {}
  };

  // use effects
  useEffect(() => {
    fetchContext();
  }, []);

  useEffect(() => {
    if (partnerId) {
      fetchPartnerData();
    }
  }, [partnerId]);

  useEffect(() => {
    createTable();
    runCleanupOncePerDay();
    fetchMessages().then(setMessages);
  }, []);

  useEffect(() => {
    if (userId) {
      fetchKeyDetails(userId)
        .then(setKeyDetails)
        .catch(() => setKeyDetails([]));
    }
  }, [userId]);

  useEffect(() => {
    if ((route.params as any)?.showOptions) {
      setShowOptions(true);
      navigation.setParams({ showOptions: false } as any);
    }
  }, [route.params]);

  // helpers
  const getFormattedKeyDetails = useCallback(() => {
    if (!keyDetails.length) {
      return "None recorded.";
    }

    return keyDetails.map((d) => `${d.type}: ${d.key} = ${d.value}`).join("; ");
  }, [keyDetails]);

  const getFormattedSpecialDates = useCallback(() => {
    if (!specialDates.length) {
      return "None set";
    }

    return specialDates
      .map(
        (d) =>
          `${d.title}: ${new Date(d.date).toLocaleDateString("en-GB", {
            day: "2-digit",
            month: "short",
            year: "numeric",
          })}`
      )
      .join(", ");
  }, [specialDates]);

  const getFormattedAnniversary = useCallback(() => {
    const anniversary = specialDates.find((d) =>
      d.title.toLowerCase().includes("anniversary")
    );
    return anniversary
      ? new Date(anniversary.date).toLocaleDateString("en-GB", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        })
      : "Not set";
  }, [specialDates]);

  const getFormattedFavoriteMemories = useCallback(() => {
    if (!favoriteMemories.length) {
      return "None set";
    }

    return favoriteMemories.map((m) => m.memory).join(", ");
  }, [favoriteMemories]);

  const getFormattedNotes = useCallback(() => {
    if (!notes.length) {
      return "None set";
    }

    return notes.map((n) => n.content).join(" | ");
  }, [notes]);

  const getFormattedLoveLanguage = useCallback(() => {
    return loveLanguage || "Not set";
  }, [loveLanguage]);

  const getFormattedAboutUser = useCallback(() => {
    return aboutUser || "Not set";
  }, [aboutUser]);

  const getFormattedFavorites = useCallback(() => {
    const favArr = favoritesObjectToArray(favorites);
    if (!favArr.length) {
      return "None set";
    }

    return favArr.map((f) => `${f.label}: ${f.value}`).join(", ");
  }, [favorites]);

  // helpers (partner)
  const getFormattedPartnerLoveLanguage = useCallback(() => {
    return partnerLoveLanguage || "Not set";
  }, [partnerLoveLanguage]);

  const getFormattedPartnerFavorites = useCallback(() => {
    const favArr = favoritesObjectToArray(partnerFavorites);
    if (!favArr.length) {
      return "None set";
    }

    return favArr.map((f) => `${f.label}: ${f.value}`).join(", ");
  }, [partnerFavorites]);

  const getFormattedAboutPartner = useCallback(() => {
    return aboutPartner || "Not set";
  }, [aboutPartner]);

  // handlers
  const handleDelete = async () => {
    await deleteAllMessages();
    setMessages([]);
    setShowConfirm(false);
  };

  // AI call
  const getBotResponse = async (message: string) => {
    const todayString = new Date().toLocaleDateString("en-GB", {
      weekday: "long",
      day: "2-digit",
      month: "short",
      year: "numeric",
    });

    const systemPrompt = `
    Your name is Lily, and a helpful assistant (more like a mascot) for ${
      user?.name || "User"
    }. Their partner's name is ${
      partnerName || "Partner"
    }, they are a couple using the Pinky Promises app.
    Today is: ${todayString}
    Currently, you're talking to just ${
      user?.name || "User"
    }, so avoid addressing this 
    user as if it's the two of them with their partner.
    So say things like "heyyy ${user?.name || "User"}" not "heyyy 
    ${user?.name || "User"} & ${partnerName || "Partner"}" because 
    it's just ${user?.name || "User"} chatting with you.
    Text them back in lowercase letters only.
    Show excitement by adding extra letters where necessary, like "heyyy"
    Make your texts as short as possible, and avoid using too much emojis, a little is fine.
    Sound human, like their best friend rather than an AI.
    Their anniversary is ${getFormattedAnniversary()}.
    Special dates: ${getFormattedSpecialDates()}.
    Favorite memories: ${getFormattedFavoriteMemories()}.
    Notes: ${getFormattedNotes()}.
    Love language for : ${getFormattedLoveLanguage()}.
    Favorites: ${getFormattedFavorites()}.
    Love language for ${
      partnerName || "Partner"
    }: ${getFormattedPartnerLoveLanguage()}.
    Favorites for ${
      partnerName || "Partner"
    }: ${getFormattedPartnerFavorites()}.
    More about ${user?.name || "User"}: ${getFormattedAboutUser()}.
    More about ${partnerName || "Partner"}: ${getFormattedAboutPartner()}
    Answer questions about their relationship, memories, special dates, favorites, 
    love langauges, and more. 
    Be warm, personal, and supportive.
    Keep your messages short and as human as possible.
    Key details recorded: ${getFormattedKeyDetails()} - Key details are just
    things you have learned about them and for you to keep in mind.
    Don't just bring up things you know about them every time, especially 
    for no reason. Bring things up when it's relevant to the conversation or have to. 
    This goes for everything, including dates, favorites, etc.
    If the user shares a new key detail (like a favorite, special date, or 
    relationship milestone, essentially something worth remembering), respond as normal, 
    but also include a JSON object at the end of your response with the format:
    {"record": {"type": "...", "key": "...", "value": "..."}}
    If there's nothing to record, do not include this object.
    `.trim();

    const history = [...messages].reverse().map((m) => ({
      role: m.sender === "You" ? "user" : "assistant",
      content: m.text,
    }));

    const apiMessages = [
      { role: "system", content: systemPrompt },
      ...history,
      { role: "user", content: message },
    ];

    try {
      const response = await fetch(
        "https://openrouter.ai/api/v1/chat/completions",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${DEEPSEEK_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: "deepseek/deepseek-r1:free",
            messages: apiMessages,
          }),
        }
      );

      const data = await response.json();
      return data?.choices?.[0]?.message?.content?.trim();
    } catch (error) {
      return "Sorry, something went wrong. Please try again.";
    }
  };

  // handlers
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

    setMessages((prev) => [userMessage, ...prev]);
    setInputText("");
    setIsSending(true);

    try {
      await saveMessage(
        userMessage.id,
        userMessage.text,
        userMessage.sender,
        userMessage.timestamp
      );
    } catch (err: any) {}

    const aiText = await getBotResponse(inputText);

    let record = null;
    let messageText = aiText;
    try {
      const match = aiText.match(/\{[\s\S]*"record"[\s\S]*\}/);

      if (match) {
        const json = JSON.parse(match[0]);
        record = json.record;
        messageText = aiText.replace(match[0], "").trim();
      }
    } catch (e) {}

    const botTimestamp = Date.now();
    const botReply: ChatMessage = {
      id: (botTimestamp + 1).toString(),
      text: messageText || "sorry, i didn’t quite get that. please try again.",
      sender: "Lily",
      timestamp: botTimestamp,
    };

    setMessages((prev) => [botReply, ...prev]);
    setIsSending(false);

    try {
      await saveMessage(
        botReply.id,
        botReply.text,
        botReply.sender,
        botReply.timestamp
      );
    } catch (err: any) {}

    const token = await AsyncStorage.getItem("token");

    if (!token) {
      return;
    }

    if (record && partnerId && token) {
      await saveKeyDetail({ ...record, userId, partnerId, token });

      try {
        const details = await fetchKeyDetails(token);
        setKeyDetails(details);
      } catch {}
    }
  };

  const shouldShowSender = (index: number) => {
    if (index === messages.length - 1) {
      return true;
    }

    return messages[index + 1]?.sender !== messages[index].sender;
  };

  // utils
  const getDayLabel = (timestamp: number) => {
    const now = new Date();
    const msgDate = new Date(timestamp);
    const diffTime = now.setHours(0, 0, 0, 0) - msgDate.setHours(0, 0, 0, 0);
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      return "Today";
    }

    if (diffDays === 1) {
      return "Yesterday";
    }

    if (diffDays > 1 && diffDays < 8) {
      return `${diffDays} days ago`;
    }

    return msgDate.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const getTimeLabel = (timestamp: number) => {
    const msgDate = new Date(timestamp);
    return msgDate.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#23243a" }}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={0}
      >
        <FlatList
          data={messages}
          inverted
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ paddingTop: 24, paddingBottom: 60 }}
          renderItem={({ item, index }) => {
            const currentDay = getDayLabel(item.timestamp);
            const prevMsg = messages[index + 1];
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
        />
        {isSending && (
          <View style={styles.typingIndicatorWrapper}>
            <Text style={styles.typingIndicatorText}>Lily is typing...</Text>
          </View>
        )}
        <View
          style={[
            styles.inputBar,
            { paddingBottom: insets.bottom + 8 + EXTRA_KEYBOARD_PADDING },
          ]}
        >
          <TextInput
            style={styles.input}
            placeholder="Type your message..."
            placeholderTextColor="#b0b3c6"
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
      </KeyboardAvoidingView>
      <Modal
        visible={showOptions}
        transparent
        animationType="fade"
        onRequestClose={() => setShowOptions(false)}
      >
        <TouchableOpacity
          style={{
            flex: 1,
            backgroundColor: "rgba(0,0,0,0.2)",
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
              backgroundColor: "#23243a",
              borderRadius: 8,
              padding: 8,
              minWidth: 120,
              shadowColor: "#000",
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
              <Text style={{ color: "#e03487", fontWeight: "bold" }}>
                Delete
              </Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>

      <ConfirmationModal
        visible={showConfirm}
        message="Are you sure you want to delete all chat messages?"
        confirmText="Delete"
        cancelText="Cancel"
        onConfirm={handleDelete}
        onCancel={() => setShowConfirm(false)}
        onClose={() => setShowConfirm(false)}
      />
    </SafeAreaView>
  );
}
