// external
import React, { createContext, useContext, useEffect, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import AsyncStorage from "@react-native-async-storage/async-storage";
import EventSource from "react-native-sse";

// internal
import { BASE_URL } from "../configuration/config";
import { useAuth } from "./AuthContext";
import useToken from "../hooks/useToken";

// interfaces
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
  // use states
  const [isConnected, setIsConnected] = useState(false);
  const [eventSource, setEventSource] = useState<EventSource | null>(null);
  const [reconnectAttempts, setReconnectAttempts] = useState(0);

  // variables
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const token = useToken();

  if (!token) {
    return;
  }

  const connectSSE = async () => {
    try {
      const url = `${BASE_URL}/events?token=${token}`;
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
              queryClient.setQueryData(
                ["unseenInteractions", user?.id],
                (old: any) => {
                  if (!old) {
                    return [data.data];
                  }

                  return [data.data, ...old];
                }
              );
              queryClient.invalidateQueries({
                queryKey: ["recentActivities", user?.id],
              });
              break;

            case "partnerStatusUpdate":
              queryClient.setQueryData(["partnerStatus", user?.id], data.data);
              queryClient.invalidateQueries({
                queryKey: ["recentActivities", user?.id],
              });
              break;

            case "partnerMoodUpdate":
              queryClient.setQueryData(["partnerMood", user?.id], data.data);
              queryClient.invalidateQueries({
                queryKey: ["recentActivities", user?.id],
              });
              break;

            case "newVentMessage":
              queryClient.invalidateQueries({
                queryKey: ["portalActivityCount", user?.id],
              });
              queryClient.invalidateQueries({
                queryKey: ["unseenVentMessage", user?.id],
              });
              break;

            case "newSweetMessage":
              queryClient.invalidateQueries({
                queryKey: ["portalActivityCount", user?.id],
              });
              queryClient.invalidateQueries({
                queryKey: ["unseenSweetMessage", user?.id],
              });
              queryClient.invalidateQueries({
                queryKey: ["recentActivities", user?.id],
              });
              break;

            case "newGiftReceived":
              queryClient.invalidateQueries({
                queryKey: ["unclaimedGift", user?.id],
              });
              break;

            case "updateFavorites":
              queryClient.setQueryData(
                ["partnerFavorites", user?.id],
                data.data
              );
              queryClient.invalidateQueries({
                queryKey: ["recentActivities", user?.id],
              });
              break;

            case "newSpecialDate":
              queryClient.invalidateQueries({
                queryKey: ["specialDates", user?.id],
              });
              queryClient.invalidateQueries({
                queryKey: ["recentActivities", user?.id],
              });
              break;

            case "updateSpecialDate":
              queryClient.invalidateQueries({
                queryKey: ["specialDates", user?.id],
              });
              queryClient.invalidateQueries({
                queryKey: ["recentActivities", user?.id],
              });
              break;

            case "deleteSpecialDate":
              queryClient.invalidateQueries({
                queryKey: ["specialDates", user?.id],
              });
              queryClient.invalidateQueries({
                queryKey: ["recentActivities", user?.id],
              });
              break;

            case "newFavoriteMemory":
              queryClient.invalidateQueries({
                queryKey: ["recentFavoriteMemories", user?.id],
              });
              queryClient.invalidateQueries({
                queryKey: ["allFavoriteMemories", user?.id],
              });
              queryClient.invalidateQueries({
                queryKey: ["recentActivities", user?.id],
              });
              break;

            case "deleteFavoriteMemory":
              queryClient.invalidateQueries({
                queryKey: ["recentFavoriteMemories", user?.id],
              });
              queryClient.invalidateQueries({
                queryKey: ["allFavoriteMemories", user?.id],
              });
              queryClient.invalidateQueries({
                queryKey: ["recentActivities", user?.id],
              });
              break;

            case "updateFavoriteMemory":
              queryClient.invalidateQueries({
                queryKey: ["recentFavoriteMemories", user?.id],
              });
              queryClient.invalidateQueries({
                queryKey: ["allFavoriteMemories", user?.id],
              });
              queryClient.invalidateQueries({
                queryKey: ["recentActivities", user?.id],
              });
              break;

            case "updateAbout":
              queryClient.setQueryData(["partnerAbout", user?.id], data.data);
              queryClient.invalidateQueries({
                queryKey: ["recentActivities", user?.id],
              });
              break;

            case "updateStoredMessages":
              queryClient.invalidateQueries({
                queryKey: ["partnerStoredMessages", user?.id],
              });
              break;

            case "storedMessages":
              queryClient.invalidateQueries({
                queryKey: ["partnerStoredMessages", user?.id],
              });
              break;

            case "addTimelineRecord":
              queryClient.invalidateQueries({
                queryKey: ["timeline", user?.id],
              });

              queryClient.invalidateQueries({
                queryKey: ["recentActivities", user?.id],
              });
              break;

            case "ping":
              break;

            default:
          }
        } catch (error) {}
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
    const delay = Math.min(1000 * Math.pow(4, reconnectAttempts), 30000);
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
