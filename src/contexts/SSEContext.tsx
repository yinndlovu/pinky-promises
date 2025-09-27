// external
import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useRef,
} from "react";
import { useQueryClient } from "@tanstack/react-query";
import EventSource from "react-native-sse";
import { AppState, AppStateStatus } from "react-native";

// internal
import { BASE_URL } from "../configuration/config";
import { useAuth } from "./AuthContext";
import useToken from "../hooks/useToken";
import usePartnerId from "../hooks/usePartnerId";
import { SSEContextType } from "../interfaces/SSEContextType";

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
  const [wasBackgrounded, setWasBackgrounded] = useState(false);

  const appState = useRef(AppState.currentState);
  const backgroundTime = useRef<number | null>(null);

  const queryClient = useQueryClient();
  const { user } = useAuth();
  const token = useToken();
  const partnerId = usePartnerId();

  const refetchCriticalData = async () => {
    if (!user?.id || !partnerId) {
      return;
    }

    try {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: ["recentActivities", user.id],
        }),
        queryClient.invalidateQueries({
          queryKey: ["unseenInteractions", user.id],
        }),
        queryClient.invalidateQueries({
          queryKey: ["status", partnerId],
        }),
        queryClient.invalidateQueries({
          queryKey: ["partnerMood", partnerId],
        }),
        queryClient.invalidateQueries({
          queryKey: ["portalActivityCount", user.id],
        }),
        queryClient.invalidateQueries({
          queryKey: ["unseenVentMessage", user.id],
        }),
        queryClient.invalidateQueries({
          queryKey: ["unseenSweetMessage", user.id],
        }),
        queryClient.invalidateQueries({
          queryKey: ["unclaimedGift", user.id],
        }),
      ]);
    } catch (error) {
      console.error("Error refetching critical data:", error);
    }
  };

  const connectSSE = async () => {
    try {
      const url = `${BASE_URL}/events?token=${token}`;
      const es = new EventSource(url);

      es.addEventListener("open", () => {
        setIsConnected(true);
        setReconnectAttempts(0);
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
              queryClient.setQueryData(["status", partnerId], data.data);
              queryClient.invalidateQueries({
                queryKey: ["recentActivities", user?.id],
              });
              break;

            case "partnerMoodUpdate":
              queryClient.setQueryData(["partnerMood", partnerId], data.data);
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
              queryClient.setQueryData(["favorites", partnerId], data.data);
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
              queryClient.setQueryData(["about", partnerId], data.data);
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

  const handleAppStateChange = (nextAppState: AppStateStatus) => {
    if (
      appState.current.match(/inactive|background/) &&
      nextAppState === "active"
    ) {
      console.log("App has come to the foreground");

      const backgroundDuration = backgroundTime.current
        ? Date.now() - backgroundTime.current
        : 0;

      if (!isConnected) {
        setReconnectAttempts(0);
        reconnect();
      }

      if (backgroundDuration > 15000) {
        console.log(
          `App was backgrounded for ${backgroundDuration}ms, refetching data`
        );
        setWasBackgrounded(true);

        setTimeout(() => {
          refetchCriticalData();
          setWasBackgrounded(false);
        }, 2000);
      }

      backgroundTime.current = null;
    } else if (nextAppState.match(/inactive|background/)) {
      console.log("App is going to background");
      backgroundTime.current = Date.now();
    }

    appState.current = nextAppState;
  };

  useEffect(() => {
    if (!token) {
      return;
    }

    connectSSE();

    const subscription = AppState.addEventListener(
      "change",
      handleAppStateChange
    );

    return () => {
      subscription.remove();
      disconnectSSE();
    };
  }, [token]);

  return (
    <SSEContext.Provider
      value={{
        isConnected,
        reconnect,
        wasBackgrounded,
        refetchCriticalData,
      }}
    >
      {children}
    </SSEContext.Provider>
  );
};
