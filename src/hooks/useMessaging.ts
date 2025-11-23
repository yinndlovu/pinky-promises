// external
import { useState, useEffect, useCallback, useRef } from "react";
import { useFocusEffect } from "@react-navigation/native";

// internal
import { useSocket } from "../contexts/SocketContext";
import {
  getPartnerMessages,
  sendPartnerMessage,
  deleteAllPartnerMessages,
  PartnerMessage,
} from "../services/api/chat/messagingService";
import useToken from "./useToken";
import { useAuth } from "../contexts/AuthContext";

// variables
const TYPING_THROTTLE_MS = 2000;
const TYPING_TIMEOUT_MS = 3000;

export function useMessaging() {
  // variables
  const token = useToken();
  const { socket } = useSocket();
  const { user } = useAuth();

  // use states
  const [messages, setMessages] = useState<PartnerMessage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [partnerTyping, setPartnerTyping] = useState(false);
  const [partnerActiveInChat, setPartnerActiveInChat] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // use refs
  const typingTimeout = useRef<NodeJS.Timeout | null>(null);
  const lastTypingEmit = useRef<number>(0);

  // fetch messages from backend
  const fetchMessages = useCallback(async () => {
    if (!token) {
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      const data = await getPartnerMessages(token);
      if (data.messages) {
        const formattedMessages = data.messages.reverse();
        setMessages(formattedMessages);
      }
    } catch (err: any) {
      console.error("Failed to fetch messages:", err);
      setError(err?.response?.data?.error || "Failed to load messages");
    } finally {
      setIsLoading(false);
    }
  }, [token]);

  // use effects
  useEffect(() => {
    fetchMessages();
  }, [fetchMessages]);

  // focus effects
  useFocusEffect(
    useCallback(() => {
      if (socket?.connected) {
        // Emit that we're active in chat
        socket.emit("messaging:activeInChat", { active: true });

        return () => {
          // Emit that we're no longer active when screen loses focus
          socket.emit("messaging:activeInChat", { active: false });
        };
      }
    }, [socket])
  );

  // socket event listeners
  useEffect(() => {
    if (!socket) {
      return;
    }

    const onPartnerMessage = (data: {
      message: PartnerMessage;
      type: string;
    }) => {
      setMessages((prev) => {
        const exists = prev.some((m) => m.id === data.message.id);
        if (exists) return prev;
        return [data.message, ...prev];
      });
      setIsSending(false);
    };

    const onPartnerMessages = (data: { messages: PartnerMessage[] }) => {
      if (data.messages) {
        const formattedMessages = data.messages.reverse();
        setMessages(formattedMessages);
      }
    };

    const onPartnerMessageError = (data: { error: string }) => {
      console.error("Messaging error:", data.error);
      setError(data.error);
      setIsSending(false);
    };

    const onPartnerTyping = () => {
      setPartnerTyping(true);
      if (typingTimeout.current) {
        clearTimeout(typingTimeout.current);
      }
      typingTimeout.current = setTimeout(() => {
        setPartnerTyping(false);
      }, TYPING_TIMEOUT_MS);
    };

    const onPartnerActiveInChat = (data: { active: boolean }) => {
      setPartnerActiveInChat(data.active);
    };

    socket.on("messaging:message", onPartnerMessage);
    socket.on("messaging:messages", onPartnerMessages);
    socket.on("messaging:error", onPartnerMessageError);
    socket.on("messaging:new", onPartnerMessage);
    socket.on("messaging:partnerTyping", onPartnerTyping);
    socket.on("messaging:partnerActiveInChat", onPartnerActiveInChat);

    return () => {
      socket.off("messaging:message", onPartnerMessage);
      socket.off("messaging:messages", onPartnerMessages);
      socket.off("messaging:error", onPartnerMessageError);
      socket.off("messaging:new", onPartnerMessage);
      socket.off("messaging:partnerTyping", onPartnerTyping);
      socket.off("messaging:partnerActiveInChat", onPartnerActiveInChat);
      if (typingTimeout.current) {
        clearTimeout(typingTimeout.current);
      }
    };
  }, [socket]);

  // send message
  const sendMessage = useCallback(
    async (text: string, partnerId?: number) => {
      if (!text.trim() || !token) {
        return;
      }

      const timestamp = Date.now();
      const userMessage: PartnerMessage = {
        id: timestamp,
        text: text.trim(),
        senderId: user?.id || 0,
        receiverId: partnerId || 0,
        timestamp,
      };

      // optimistic update
      setMessages((prev) => [userMessage, ...prev]);
      setIsSending(true);
      setError(null);

      try {
        if (socket?.connected) {
          socket.emit("messaging:send", { message: text.trim() });
        } else {
          const data = await sendPartnerMessage(token, text.trim());
          if (data.message) {
            setMessages((prev) => {
              const filtered = prev.filter((m) => m.id !== timestamp);
              return [data.message, ...filtered];
            });
          }
          setIsSending(false);
        }
      } catch (err: any) {
        console.error("Send message error:", err);
        setError(err?.response?.data?.error || "Failed to send message");
        // remove optimistic message on error
        setMessages((prev) => prev.filter((m) => m.id !== timestamp));
        setIsSending(false);
      }
    },
    [token, socket, user?.id]
  );

  // emit typing indicator
  const emitTyping = useCallback(() => {
    const now = Date.now();
    if (
      socket?.connected &&
      now - lastTypingEmit.current > TYPING_THROTTLE_MS
    ) {
      socket.emit("messaging:typing");
      lastTypingEmit.current = now;
    }
  }, [socket]);

  // delete all messages
  const deleteAllMessages = useCallback(async () => {
    if (!token) {
      return;
    }

    try {
      await deleteAllPartnerMessages(token);
      setMessages([]);
      setError(null);
    } catch (err: any) {
      console.error("Delete error:", err);
      setError(err?.response?.data?.error || "Failed to delete messages");
    }
  }, [token]);

  // clear error
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  return {
    messages,
    isLoading,
    isSending,
    partnerTyping,
    partnerActiveInChat,
    error,
    sendMessage,
    emitTyping,
    deleteAllMessages,
    refetch: fetchMessages,
  };
}
