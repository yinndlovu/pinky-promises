import React, { createContext, useContext, useEffect, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { BASE_URL } from "../configuration/config";
import EventSource from "react-native-sse";

interface SSEContextType {
  isConnected: boolean;
  reconnect: () => void;
}

const SSEContext = createContext<SSEContextType | null>(null);

export const useSSE = () => {
  const context = useContext(SSEContext);

  if (!context) {
    throw new Error("useSSE must be used within an SSEProvider");
  }

  return context;
};

interface SSEProviderProps {
  children: React.ReactNode;
}

export const SSEProvider: React.FC<SSEProviderProps> = ({ children }) => {
  const [isConnected, setIsConnected] = useState(false);
  const [eventSource, setEventSource] = useState<EventSource | null>(null);
  const [reconnectAttempts, setReconnectAttempts] = useState(0);
  const queryClient = useQueryClient();

  const connectSSE = async () => {
    try {
      const token = await AsyncStorage.getItem("token");

      if (!token) {
        return;
      }

      const url = `${BASE_URL}/api/events?token=${token}`;
      const es = new EventSource(url);

      es.addEventListener("open", () => {
        setIsConnected(true);
      });

      es.addEventListener("message", (event) => {
        try {
          const data = JSON.parse(event.data || "{}");
          switch (data.type) {
            case "connected":
              break;

            case "newInteraction":
              queryClient.setQueryData(["unseenInteractions"], (old: any) => {
                if (!old) return [data.data];
                return [data.data, ...old];
              });
              queryClient.invalidateQueries({
                queryKey: ["recentActivities"],
              });
              break;

            case "partnerStatusUpdate":
              queryClient.setQueryData(["partnerStatus"], data.data);
              queryClient.invalidateQueries({
                queryKey: ["recentActivities"],
              });
              break;

            case "partnerMoodUpdate":
              queryClient.setQueryData(["partnerMood"], data.data);
              queryClient.invalidateQueries({
                queryKey: ["recentActivities"],
              });
              break;

            case "newVentMessage":
              queryClient.invalidateQueries({
                queryKey: ["portalActivityCount"],
              });
              queryClient.invalidateQueries({
                queryKey: ["unseenVentMessage"],
              });
              break;

            case "newSweetMessage":
              queryClient.invalidateQueries({
                queryKey: ["portalActivityCount"],
              });
              queryClient.invalidateQueries({
                queryKey: ["unseenSweetMessage"],
              });
              queryClient.invalidateQueries({
                queryKey: ["recentActivities"],
              });
              break;

            case "newGiftReceived":
              queryClient.invalidateQueries({
                queryKey: ["unclaimedGift"],
              });
              break;

            case "ping":
              break;

            default:
              console.log("Unknown SSE event type:", data.type);
          }
        } catch (error) {
          console.error("Error parsing SSE message:", error);
        }
      });

      es.addEventListener("error", (error) => {
        setIsConnected(false);

        setTimeout(() => {
          if (!isConnected) {
            reconnect();
          }
        }, 5000);
      });

      setEventSource(es);
    } catch (error) {
      setIsConnected(false);
    }
  };

  const disconnectSSE = () => {
    if (eventSource) {
      eventSource.close();
      setEventSource(null);
      setIsConnected(false);
    }
  };

  const reconnect = () => {
    disconnectSSE();
    const delay = Math.min(1000 * Math.pow(2, reconnectAttempts), 30000);
    setTimeout(() => {
      connectSSE();
      setReconnectAttempts((prev) => prev + 1);
    }, delay);
  };

  useEffect(() => {
    connectSSE();

    return () => {
      disconnectSSE();
    };
  }, []);

  return (
    <SSEContext.Provider value={{ isConnected, reconnect }}>
      {children}
    </SSEContext.Provider>
  );
};
