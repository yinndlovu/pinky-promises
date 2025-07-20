// external
import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  TextInput,
  FlatList,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  TouchableOpacity,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useSafeAreaInsets } from "react-native-safe-area-context";

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

// chats database
import {
  createTable,
  fetchMessages,
  saveMessage,
  deleteOldMessages,
} from "../../database/chatdb";

type Message = {
  id: string;
  text: string;
  sender: string;
  timestamp: number;
};

export default function ChatScreen() {
  // variables
  const { user } = useAuth();
  const userId = user?.id;
  const insets = useSafeAreaInsets();
  const EXTRA_KEYBOARD_PADDING = 50;
  const LAST_CLEANUP_KEY = "lastCleanupDate";

  // use states
  const [partnerName, setPartnerName] = useState<string>("");
  const [partnerId, setPartnerId] = useState<string>("");
  const [specialDates, setSpecialDates] = useState<any[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState<string>("");
  const [isSending, setIsSending] = useState(false);
  const [favoriteMemories, setFavoriteMemories] = useState<any[]>([]);
  const [notes, setNotes] = useState<any[]>([]);
  const [loveLanguage, setLoveLanguage] = useState<string>("");
  const [aboutUser, setAboutUser] = useState<string>("");
  const [favorites, setFavorites] = useState<any[]>([]);

  // use states (partner data)
  const [partnerLoveLanguage, setPartnerLoveLanguage] = useState<string>("");
  const [partnerFavorites, setPartnerFavorites] = useState<any[]>([]);
  const [aboutPartner, setAboutPartner] = useState<string>("");

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

  // helpers
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

    return favoriteMemories.map((m) => m.title).join(", ");
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
    if (!favorites.length) {
      return "None set";
    }

    return favorites.map((f) => f.name).join(", ");
  }, [favorites]);

  // helpers (partner)
  const getFormattedPartnerLoveLanguage = useCallback(() => {
    return partnerLoveLanguage || "Not set";
  }, [partnerLoveLanguage]);

  const getFormattedPartnerFavorites = useCallback(() => {
    if (!partnerFavorites.length) {
      return "None set";
    }

    return partnerFavorites.map((f) => f.name).join(", ");
  }, [partnerFavorites]);

  const getFormattedAboutPartner = useCallback(() => {
    return aboutPartner || "Not set";
  }, [aboutPartner]);

  // AI call
  const getBotResponse = async (message: string) => {
    const systemPrompt = `
    Your name is Lily, and a helpful assistant (more like a mascot) for ${
      user?.name || "User"
    }. Their partner's name is ${
      partnerName || "Partner"
    }, they are a couple using the Pinky Promises app.
    Text them back in lowercase letters only.
    Show excitement by adding extra letters where necessary, like "heyyy"
    Make your texts as short as possible.
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
    Favorites for ${partnerName || "Partner"}: ${getFormattedPartnerFavorites()}.
    More about ${user?.name || "User"}: ${getFormattedAboutUser()}.
    More about ${partnerName || "Partner"}: ${getFormattedAboutPartner()}
    Answer questions about their relationship, memories, special dates, favorites, love langauges, and more. 
    Be warm, personal, and supportive.
    Keep your messages short and as human as possible.
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
    const userMessage: Message = {
      id: timestamp.toString(),
      text: inputText,
      sender: "You",
      timestamp,
    };

    setMessages((prev) => [userMessage, ...prev]);
    setInputText("");
    setIsSending(true);
    await saveMessage(
      userMessage.id,
      userMessage.text,
      userMessage.sender,
      userMessage.timestamp
    );

    const aiText = await getBotResponse(inputText);

    const botTimestamp = Date.now();
    const botReply: Message = {
      id: (botTimestamp + 1).toString(),
      text: aiText || "sorry, i didn’t quite get that. please try again.",
      sender: "Lily",
      timestamp: botTimestamp,
    };

    setMessages((prev) => [botReply, ...prev]);
    setIsSending(false);

    await saveMessage(
      botReply.id,
      botReply.text,
      botReply.sender,
      botReply.timestamp
    );
  };

  const shouldShowSender = (index: number) => {
    if (index === messages.length - 1) {
      return true;
    }

    return messages[index + 1]?.sender !== messages[index].sender;
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
          renderItem={({ item, index }) => (
            <View style={{ marginBottom: 2 }}>
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
              <Text style={item.sender === "You" ? styles.user : styles.bot}>
                {item.text}
              </Text>
            </View>
          )}
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
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  header: {
    height: 56,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#23243a",
    borderBottomWidth: 1,
    borderBottomColor: "#393a4a",
    zIndex: 10,
  },
  headerText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 20,
    letterSpacing: 1,
    textAlign: "center",
  },
  container: {
    flex: 1,
    backgroundColor: "#23243a",
  },
  typingIndicatorWrapper: {
    position: "relative",
    marginBottom: 10,
    alignSelf: "flex-start",
    marginLeft: 12,
  },
  typingIndicatorText: {
    color: "#b0b3c6",
    fontSize: 14,
    fontStyle: "italic",
    marginBottom: 2,
  },
  inputBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#23243a",
    paddingHorizontal: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: "#393a4a",
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#393a4a",
    padding: 10,
    borderRadius: 8,
    color: "#fff",
    backgroundColor: "#1b1c2e",
    marginRight: 8,
  },
  user: {
    alignSelf: "flex-end",
    backgroundColor: "#e03487",
    color: "#fff",
    padding: 10,
    margin: 4,
    borderRadius: 14,
    maxWidth: "80%",
  },
  bot: {
    alignSelf: "flex-start",
    backgroundColor: "#393a4a",
    color: "#fff",
    padding: 10,
    margin: 4,
    borderRadius: 14,
    maxWidth: "80%",
  },
  senderLabel: {
    fontSize: 12,
    marginBottom: 2,
    marginLeft: 4,
    marginRight: 4,
    color: "#b0b3c6",
    fontWeight: "500",
  },
  senderLabelUser: {
    alignSelf: "flex-end",
    color: "#e03487",
    marginRight: 12,
    fontWeight: "bold",
  },
  senderLabelBot: {
    marginLeft: 12,
    alignSelf: "flex-start",
    color: "#b0b3c6",
    fontWeight: "bold",
  },
  sendButton: {
    backgroundColor: "#e03487",
    borderRadius: 8,
    paddingVertical: 9,
    paddingHorizontal: 12,
    marginLeft: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  sendButtonDisabled: {
    backgroundColor: "#a94c7c",
    opacity: 0.6,
  },
  sendButtonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
});
