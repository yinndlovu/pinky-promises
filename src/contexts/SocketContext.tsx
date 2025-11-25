// external
import React, {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { AppState, AppStateStatus } from "react-native";
import io, { Socket } from "socket.io-client";
import { useQueryClient } from "@tanstack/react-query";

// internal
import { BASE_URL } from "../configuration/config";
import { useAuth } from "./AuthContext";
import useToken from "../hooks/useToken";

// types
type SocketCtx = {
  socket: Socket | null;
  isConnected: boolean;
  reconnect: () => void;
};

const SocketContext = createContext<SocketCtx | null>(null);

export const useSocket = () => {
  const ctx = useContext(SocketContext);

  if (!ctx) {
    throw new Error("useSocket must be used within SocketProvider");
  }

  return ctx;
};

export const SocketProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  // use states
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  // use refs
  const isConnecting = useRef(false);
  const appState = useRef(AppState.currentState);

  // variables
  const { user } = useAuth();
  const token = useToken();
  const partnerId = user?.partnerId;
  const queryClient = useQueryClient();

  const connect = () => {
    if (!token || isConnecting.current || socket?.connected) {
      return;
    }

    isConnecting.current = true;

    const s = io(BASE_URL.replace(/\/api$/, ""), {
      transports: ["websocket"],
      forceNew: true,
      reconnection: true,
      reconnectionAttempts: Infinity,
      reconnectionDelay: 1000,
      auth: { token },
    });

    s.on("connect", () => {
      setIsConnected(true);
      isConnecting.current = false;
      refetchCriticalData();
    });

    s.on("disconnect", () => {
      setIsConnected(false);
    });

    s.on(
      "partnerMoodUpdate",
      (data: {
        mood: string;
        userId: string;
        description: string;
        recentActivity?: {
          id: string;
          description: string;
          createdAt: string;
        };
      }) => {
        if (partnerId && String(partnerId) === String(data.userId)) {
          queryClient.setQueryData(["home", user?.id], (old: any) => {
            if (!old) {
              return old;
            }
            return {
              ...old,
              partnerMood: {
                mood: data.mood,
                description: data.description,
                userId: data.userId,
              },
            };
          });
        }

        queryClient.setQueryData(["home", user?.id], (old: any) => {
          if (!old) {
            return old;
          }

          const existingActivities = Array.isArray(old.recentActivities)
            ? old.recentActivities
            : [];

          const updatedActivities = data.recentActivity
            ? [
                data.recentActivity,
                ...existingActivities.filter(
                  (activity: any) => activity.id !== data.recentActivity?.id
                ),
              ]
            : existingActivities;

          return {
            ...old,
            recentActivities: updatedActivities,
          };
        });
      }
    );

    s.on(
      "partnerStatusUpdate",
      (data: {
        statusData: {
          id: string;
          userId: string;
          isAtHome: boolean;
          updatedAt: string;
          unreachable: boolean;
          distance?: number | null;
          batteryLevel?: number | null;
          userLocation?: string | null;
          timezoneOffset?: number | null;
        };
        recentActivity?: {
          id: string;
          description: string;
          createdAt: string;
        };
      }) => {
        const { statusData, recentActivity } = data;

        if (partnerId && String(partnerId) === String(statusData.userId)) {
          queryClient.setQueryData(["home", user?.id], (old: any) => {
            if (!old) {
              return old;
            }

            const existingActivities = Array.isArray(old.recentActivities)
              ? old.recentActivities
              : [];

            const updatedActivities = recentActivity
              ? [
                  recentActivity,
                  ...existingActivities.filter(
                    (activity: any) => activity.id !== recentActivity.id
                  ),
                ]
              : existingActivities;

            return {
              ...old,
              partnerStatus: statusData,
              recentActivities: updatedActivities,
            };
          });
        }
      }
    );

    s.on(
      "newInteraction",
      (data: {
        id: string;
        action: string;
        userId: string;
        partnerId: string;
        createdAt: string;
        seen: boolean;
        recentActivity?: {
          id: string;
          description: string;
          createdAt: string;
        };
      }) => {
        if (!user?.id) {
          return;
        }

        const recentActivity = data.recentActivity;

        queryClient.setQueryData(["home", user?.id], (old: any) => {
          if (!old) {
            return old;
          }

          const existingActivities = Array.isArray(old.recentActivities)
            ? old.recentActivities
            : [];

          const updatedActivities = recentActivity
            ? [
                recentActivity,
                ...existingActivities.filter(
                  (activity: any) => activity.id !== recentActivity.id
                ),
              ]
            : existingActivities;

          const unseenInteractions = Array.isArray(old.unseenInteractions)
            ? old.unseenInteractions
            : [];

          const updatedUnseen = unseenInteractions.some(
            (interaction: any) => interaction.id === data.id
          )
            ? unseenInteractions
            : [data, ...unseenInteractions];

          return {
            ...old,
            unseenInteractions: updatedUnseen,
            recentActivities: updatedActivities,
          };
        });
      }
    );

    s.on(
      "newVentMessage",
      (data: {
        id: string;
        message: string;
        createdAt: string;
        userId: string;
        userName: string;
      }) => {
        if (!user?.id) {
          return;
        }

        queryClient.invalidateQueries({
          queryKey: ["unseenVentMessage", user.id],
        });
        queryClient.invalidateQueries({
          queryKey: ["recentActivities", user.id],
        });
        queryClient.invalidateQueries({
          queryKey: ["portalActivityCount", user.id],
        });
      }
    );

    s.on(
      "newSweetMessage",
      (data: {
        id: string;
        message: string;
        createdAt: string;
        userId: string;
        userName: string;
      }) => {
        if (!user?.id || String(data.userId) !== String(partnerId)) {
          return;
        }

        queryClient.invalidateQueries({
          queryKey: ["unseenVentMessage", user.id],
        });
        queryClient.invalidateQueries({
          queryKey: ["portalActivityCount", user.id],
        });

        queryClient.setQueryData<any[]>(
          ["sentSweetMessages", user.id],
          (old) => {
            if (!old || !Array.isArray(old)) {
              return [data];
            }

            if (old.some((x) => x.id === data.id)) {
              return old;
            }

            return [data, ...old];
          }
        );

        queryClient.invalidateQueries({
          queryKey: ["recentActivities", user.id],
        });
      }
    );

    s.on("addTimelineRecord", (data: { newRecord: any }) => {
      if (!user?.id) {
        return;
      }

      // Update old query for backward compatibility
      queryClient.setQueryData<any[]>(["timeline", user.id], (old) => {
        if (!old || !Array.isArray(old)) {
          return [data.newRecord];
        }

        if (old.some((x) => x.id === data.newRecord.id)) {
          return old;
        }

        return [data.newRecord, ...old];
      });

      // Update home cache
      queryClient.setQueryData(["home", user?.id], (old: any) => {
        if (!old) return old;
        const existingTimeline = old.timeline || [];
        if (existingTimeline.some((x: any) => x.id === data.newRecord.id)) {
          return old;
        }
        return {
          ...old,
          timeline: [data.newRecord, ...existingTimeline],
        };
      });
    });

    s.on(
      "newNotification",
      (n: {
        id: string;
        title: string;
        body: string;
        type: string;
        seen: boolean;
        createdAt: string;
        userId: string;
      }) => {
        if (!user?.id || String(n.userId) !== String(user.id)) {
          return;
        }

        queryClient.setQueryData(["home", user.id], (old: any) => {
          if (!old) {
            return old;
          }

          const existingNotifications = Array.isArray(old.notifications)
            ? old.notifications
            : [];

          if (existingNotifications.some((x: any) => x.id === n.id)) {
            return old;
          }

          return {
            ...old,
            notifications: [n, ...existingNotifications],
          };
        });
      }
    );

    s.on("favoritesUpdate", (data: { updated: any }) => {
      if (partnerId && String(partnerId) == data.updated.userId) {
        queryClient.invalidateQueries({ queryKey: ["favorites", partnerId] });
        queryClient.invalidateQueries({
          queryKey: ["recentActivities", user.id],
        });
      }
    });

    s.on(
      "createSpecialDate",
      (data: {
        id: string;
        date: string;
        title: string;
        description: string;
        userId: string;
        partnerId: string;
      }) => {
        if (!user?.id || String(data.partnerId) !== String(user.id)) {
          return;
        }

        queryClient.invalidateQueries({
          queryKey: ["specialDates", user.id],
        });
        queryClient.invalidateQueries({
          queryKey: ["upcomingSpecialDate", user.id],
        });
        queryClient.invalidateQueries({
          queryKey: ["recentActivities", user.id],
        });
      }
    );

    s.on(
      "updateSpecialDate",
      (data: {
        id: string;
        date: string;
        title: string;
        description: string;
        userId: string;
        partnerId: string;
      }) => {
        if (!user.id || String(data.partnerId) !== String(user.id)) {
          return;
        }

        queryClient.invalidateQueries({
          queryKey: ["specialDates", user.id],
        });
        queryClient.invalidateQueries({
          queryKey: ["upcomingSpecialDate", user.id],
        });
        queryClient.invalidateQueries({
          queryKey: ["recentActivities", user.id],
        });
      }
    );

    s.on(
      "deleteSpecialDate",
      (data: {
        id: string;
        date: string;
        title: string;
        description: string;
        userId: string;
        partnerId: string;
      }) => {
        if (!user.id || String(data.partnerId) !== String(user.id)) {
          return;
        }

        queryClient.invalidateQueries({
          queryKey: ["specialDates", user.id],
        });
        queryClient.invalidateQueries({
          queryKey: ["upcomingSpecialDate", user.id],
        });
        queryClient.invalidateQueries({
          queryKey: ["recentActivities", user.id],
        });
      }
    );

    s.on(
      "storeMessage",
      (data: {
        id: string;
        title: string;
        message: string;
        createdAt: string;
        updatedAt: string;
        userId: string;
        partnerId: string;
      }) => {
        if (!user.id || String(data.partnerId) !== String(user.id)) {
          return;
        }

        queryClient.setQueryData<any[]>(
          ["partnerStoredMessages", user.id],
          (old) => {
            if (!old || !Array.isArray(old)) {
              return [data];
            }

            if (old.some((x) => x.id === data.id)) {
              return old;
            }

            return [data, ...old];
          }
        );

        queryClient.invalidateQueries({
          queryKey: ["recentActivities", user.id],
        });
      }
    );

    s.on(
      "updateStoredMessage",
      (data: {
        id: string;
        title: string;
        message: string;
        createdAt: string;
        updatedAt: string;
        userId: string;
        partnerId: string;
      }) => {
        if (!user.id || String(data.partnerId) !== String(user.id)) {
          return;
        }

        queryClient.setQueryData<any[]>(
          ["partnerStoredMessages", user.id],
          (old) => {
            if (!old || !Array.isArray(old)) {
              return [data];
            }

            const existingIndex = old.findIndex((x) => x.id === data.id);

            if (existingIndex !== -1) {
              const updated = [...old];
              updated[existingIndex] = data;
              return updated;
            }

            return [data, ...old];
          }
        );

        queryClient.invalidateQueries({
          queryKey: ["recentActivities", user.id],
        });
      }
    );

    s.on(
      "deleteStoredMessage",
      (data: {
        id: string;
        title: string;
        message: string;
        createdAt: string;
        updatedAt: string;
        userId: string;
        partnerId: string;
      }) => {
        if (!user.id || String(data.partnerId) !== String(user.id)) {
          return;
        }

        queryClient.setQueryData<any[]>(
          ["partnerStoredMessages", user.id],
          (old) => {
            if (!old || !Array.isArray(old)) {
              return [];
            }

            return old.filter((x) => x.id !== data.id);
          }
        );

        queryClient.invalidateQueries({
          queryKey: ["recentActivities", user.id],
        });
      }
    );

    s.on(
      "updateLoveLanguage",
      (data: { userId: string; loveLanguage: string }) => {
        if (partnerId && String(partnerId) === String(data.userId)) {
          queryClient.setQueryData(
            ["loveLanguage", partnerId],
            data.loveLanguage
          );
          queryClient.invalidateQueries({
            queryKey: ["recentActivities", user.id],
          });
        }
      }
    );

    s.on(
      "createFavoriteMemory",
      (data: {
        id: string;
        memory: string;
        date: string;
        author: string;
        partnerId: string;
        userId: string;
        createdAt: string;
        updatedAt: string;
      }) => {
        if (!user.id || String(data.partnerId) !== String(user.id)) {
          return;
        }

        // Update old queries for backward compatibility
        queryClient.setQueryData<any[]>(
          ["allFavoriteMemories", user.id],
          (old) => {
            if (!old || !Array.isArray(old)) {
              return [data];
            }

            if (old.some((x) => x.id === data.id)) {
              return old;
            }

            return [data, ...old];
          }
        );

        queryClient.setQueryData<any[]>(
          ["recentFavoriteMemories", user.id],
          (old) => {
            if (!old || !Array.isArray(old)) {
              return [data];
            }

            if (old.some((x) => x.id === data.id)) {
              return old;
            }

            return [data, ...old];
          }
        );

        // Update home cache
        queryClient.setQueryData(["home", user?.id], (old: any) => {
          if (!old) return old;
          const existingMemories = old.favoriteMemories || [];
          if (existingMemories.some((x: any) => x.id === data.id)) {
            return old;
          }
          return {
            ...old,
            favoriteMemories: [data, ...existingMemories],
          };
        });
      }
    );

    s.on(
      "deleteFavoriteMemory",
      (data: {
        id: string;
        memory: string;
        date: string;
        author: string;
        partnerId: string;
        userId: string;
        createdAt: string;
        updatedAt: string;
      }) => {
        if (!user.id || String(data.partnerId) !== String(user.id)) {
          return;
        }

        // Update old queries for backward compatibility
        queryClient.setQueryData<any[]>(
          ["allFavoriteMemories", user.id],
          (old) => {
            if (!old || !Array.isArray(old)) {
              return [];
            }

            return old.filter((x) => x.id !== data.id);
          }
        );

        queryClient.setQueryData<any[]>(
          ["recentFavoriteMemories", user.id],
          (old) => {
            if (!old || !Array.isArray(old)) {
              return [];
            }

            return old.filter((x) => x.id !== data.id);
          }
        );

        // Update home cache
        queryClient.setQueryData(["home", user?.id], (old: any) => {
          if (!old) return old;
          return {
            ...old,
            favoriteMemories: (old.favoriteMemories || []).filter(
              (x: any) => x.id !== data.id
            ),
          };
        });
      }
    );

    s.on(
      "updateFavoriteMemory",
      (data: {
        id: string;
        memory: string;
        date: string;
        author: string;
        partnerId: string;
        userId: string;
        createdAt: string;
        updatedAt: string;
      }) => {
        if (!user.id || String(data.partnerId) !== String(user.id)) {
          return;
        }

        queryClient.setQueryData<any[]>(
          ["recentFavoriteMemories", user.id],
          (old) => {
            if (!old || !Array.isArray(old)) {
              return [data];
            }

            const existingIndex = old.findIndex((x) => x.id === data.id);

            if (existingIndex !== -1) {
              const updated = [...old];
              updated[existingIndex] = data;
              return updated;
            }

            return [data, ...old];
          }
        );

        queryClient.setQueryData<any[]>(
          ["allFavoriteMemories", user.id],
          (old) => {
            if (!old || !Array.isArray(old)) {
              return [data];
            }

            const existingIndex = old.findIndex((x) => x.id === data.id);

            if (existingIndex !== -1) {
              const updated = [...old];
              updated[existingIndex] = data;
              return updated;
            }

            return [data, ...old];
          }
        );

        queryClient.invalidateQueries({
          queryKey: ["recentActivities", user.id],
        });
      }
    );

    s.on("updateAbout", (data: { aboutUser: any }) => {
      if (partnerId && String(partnerId) === String(data.aboutUser.userId)) {
        queryClient.setQueryData(["about", partnerId], data.aboutUser.about);
        queryClient.invalidateQueries({
          queryKey: ["recentActivities", user.id],
        });
      }
    });

    setSocket(s);
  };

  const disconnect = () => {
    if (socket) {
      socket.removeAllListeners();
      socket.disconnect();
      setSocket(null);
      setIsConnected(false);
    }
  };

  const reconnect = () => {
    disconnect();
    connect();
  };

  const refetchCriticalData = () => {
    if (!user?.id) {
      return;
    }

    queryClient.invalidateQueries({ queryKey: ["home", user?.id] });

    // Also invalidate old queries for backward compatibility
    const tasks: Promise<unknown>[] = [];

    if (partnerId) {
      tasks.push(
        queryClient.invalidateQueries({ queryKey: ["partnerMood", partnerId] }),
        queryClient.invalidateQueries({ queryKey: ["status", partnerId] })
      );
    }

    tasks.push(
      queryClient.invalidateQueries({
        queryKey: ["unseenInteractions", user.id],
      }),
      queryClient.invalidateQueries({
        queryKey: ["recentActivities", user.id],
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
        queryKey: ["timeline", user.id],
      }),
      queryClient.invalidateQueries({
        queryKey: ["notifications", user.id],
      })
    );
    Promise.allSettled(tasks);
  };

  useEffect(() => {
    if (token && user?.id) {
      connect();
    }

    return () => {
      disconnect();
    };
  }, [token, user?.id]);

  const handleAppStateChange = (next: AppStateStatus) => {
    if (
      (appState.current === "inactive" || appState.current === "background") &&
      next === "active"
    ) {
      if (!token || !user?.id) {
        appState.current = next;
        return;
      }

      reconnect();
      refetchCriticalData();
    }

    appState.current = next;
  };

  useEffect(() => {
    const sub = AppState.addEventListener("change", handleAppStateChange);

    return () => {
      sub.remove();
    };
  }, []);

  return (
    <SocketContext.Provider value={{ socket, isConnected, reconnect }}>
      {children}
    </SocketContext.Provider>
  );
};
