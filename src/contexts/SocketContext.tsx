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
  const userIdKey = user?.id;

  const arrayify = (value: any) => (Array.isArray(value) ? value : []);

  const withPossibleKeys = (value: string | number | undefined | null) => {
    if (value === undefined || value === null) {
      return [];
    }

    const variants = new Set<string | number>();
    variants.add(value);

    const numeric = Number(value);
    if (!Number.isNaN(numeric)) {
      variants.add(numeric);
    }

    const stringified = String(value);
    variants.add(stringified);

    return Array.from(variants);
  };

  const setProfileData = (
    targetId: string | number | undefined | null,
    updater: (old: any) => any
  ) => {
    withPossibleKeys(targetId).forEach((key) => {
      queryClient.setQueryData(["profile", key], (old: any) => {
        if (!old) {
          return old;
        }
        return updater(old);
      });
    });
  };

  const setHomeData = (updater: (old: any) => any) => {
    if (userIdKey === undefined || userIdKey === null) {
      return;
    }

    queryClient.setQueryData(["home", userIdKey], (old: any) => {
      if (!old) {
        return old;
      }

      return updater(old);
    });
  };

  const setPortalData = (updater: (old: any) => any) => {
    if (userIdKey === undefined || userIdKey === null) {
      return;
    }

    queryClient.setQueryData(["portal", userIdKey], (old: any) => {
      if (!old) {
        return old;
      }

      return updater(old);
    });
  };

  const setOursData = (updater: (old: any) => any) => {
    if (userIdKey === undefined || userIdKey === null) {
      return;
    }

    queryClient.setQueryData(["ours", userIdKey], (old: any) => {
      if (!old) {
        return old;
      }

      return updater(old);
    });
  };

  const setAllFavoriteMemories = (updater: (old: any) => any) => {
    if (userIdKey === undefined || userIdKey === null) {
      return;
    }

    queryClient.setQueryData(["allFavoriteMemories", userIdKey], (old: any) => {
      if (!old) {
        return old;
      }

      return updater(old);
    });
  };

  const setReceivedSweetMessages = (updater: (old: any) => any) => {
    if (userIdKey === undefined || userIdKey === null) {
      return;
    }

    queryClient.setQueryData(
      ["receivedSweetMessages", userIdKey],
      (old: any) => {
        if (!old) {
          return old;
        }

        return updater(old);
      }
    );
  };

  const mergeCounts = (
    current: any,
    next?: any,
    delta?: { sweet?: number; vent?: number }
  ) => {
    if (next) {
      return next;
    }

    if (!delta) {
      return current;
    }

    const base = current || { total: 0, sweetTotal: 0, ventTotal: 0 };
    const totalDelta = (delta.sweet ?? 0) + (delta.vent ?? 0);

    return {
      ...base,
      total: (base.total ?? 0) + totalDelta,
      sweetTotal: (base.sweetTotal ?? 0) + (delta.sweet ?? 0),
      ventTotal: (base.ventTotal ?? 0) + (delta.vent ?? 0),
    };
  };

  const pushRecentActivity = (activity?: any) => {
    if (!activity) {
      return;
    }

    const normalized = {
      ...activity,
      activity: activity.activity || activity.activity || "",
    };

    setHomeData((old: any) => {
      const existing = arrayify(old.recentActivities);
      const filtered = existing.filter(
        (entry) => entry && String(entry.id) !== String(normalized.id)
      );

      return {
        ...old,
        recentActivities: [normalized, ...filtered].slice(0, 20),
      };
    });
  };

  const upsertById = (
    list: any,
    item: any,
    options?: { limit?: number; preserveExtras?: boolean }
  ) => {
    const arr = arrayify(list);
    const existing = arr.find(
      (entry) => entry && String(entry.id) === String(item.id)
    );
    const filtered = arr.filter(
      (entry) => entry && String(entry.id) !== String(item.id)
    );

    const nextItem =
      options?.preserveExtras && existing ? { ...existing, ...item } : item;

    const updated = [nextItem, ...filtered];

    if (typeof options?.limit === "number") {
      return updated.slice(0, options.limit);
    }

    return updated;
  };

  const replaceById = (list: any, item: any) => {
    const arr = arrayify(list);
    const idx = arr.findIndex(
      (entry) => entry && String(entry.id) === String(item.id)
    );

    if (idx === -1) {
      return upsertById(arr, item);
    }

    const next = [...arr];
    next[idx] = { ...next[idx], ...item };
    return next;
  };

  const removeById = (list: any, id: string | number) => {
    const arr = arrayify(list);
    return arr.filter((entry) => entry && String(entry.id) !== String(id));
  };

  const sortSpecialDates = (dates: any[]) =>
    [...dates].sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    );

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
          activity: string;
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
          activity: string;
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
          activity: string;
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
        count: {
          total: number;
          sweetTotal: number;
          ventTotal: number;
        } | null;
      }) => {
        if (!user?.id) {
          return;
        }

        const normalizedMessage = {
          id: data.id,
          message: data.message,
          createdAt: data.createdAt,
          seen: false,
          userId: data.userId,
          userName: data.userName,
        };

        setPortalData((old: any) => {
          if (!old) {
            return old;
          }

          return {
            ...old,
            unseenVentMessage: normalizedMessage,
          };
        });

        setHomeData((old: any) => {
          if (!old) {
            return old;
          }

          return {
            ...old,
            counts: mergeCounts(old.counts, data.count, { vent: 1 }),
          };
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
        recentActivity?: {
          id: string;
          activity: string;
          createdAt: string;
        };
      }) => {
        if (!user?.id || String(data.userId) !== String(partnerId)) {
          return;
        }

        const normalizedMessage = {
          id: data.id,
          message: data.message,
          createdAt: data.createdAt,
          seen: false,
          userId: data.userId,
          userName: data.userName,
        };

        setPortalData((old: any) => {
          if (!old) {
            return old;
          }

          return {
            ...old,
            receivedSweetMessages: upsertById(
              old.receivedSweetMessages,
              normalizedMessage,
              { limit: 6, preserveExtras: true }
            ),
            unseenSweetMessage: normalizedMessage,
          };
        });

        setReceivedSweetMessages((old: any) =>
          upsertById(old, normalizedMessage)
        );

        setHomeData((old: any) => {
          if (!old) {
            return old;
          }

          return {
            ...old,
            counts: mergeCounts(old.counts, undefined, { sweet: 1 }),
          };
        });

        pushRecentActivity(data.recentActivity);
      }
    );

    s.on("addTimelineRecord", (data: { newRecord: any }) => {
      if (!user?.id) {
        return;
      }

      queryClient.setQueryData<any[]>(["timeline", user.id], (old) => {
        if (!old || !Array.isArray(old)) {
          return [data.newRecord];
        }

        if (old.some((x) => x.id === data.newRecord.id)) {
          return old;
        }

        return [data.newRecord, ...old];
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

    s.on("favoritesUpdate", (data: { updated: any; recentActivity?: any }) => {
      if (!partnerId || String(partnerId) !== String(data.updated.userId)) {
        return;
      }

      setProfileData(data.updated.userId, (old: any) => {
        if (!old) {
          return old;
        }

        return {
          ...old,
          userFavorites: { ...(old.userFavorites || {}), ...data.updated },
        };
      });

      pushRecentActivity(data.recentActivity);
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
        upcomingSpecialDate?: any;
        recentActivity?: {
          id: string;
          activity: string;
          createdAt: string;
        };
      }) => {
        if (!user?.id || String(data.partnerId) !== String(user.id)) {
          return;
        }

        const newDate = {
          id: data.id,
          date: data.date,
          title: data.title,
          description: data.description,
          userId: data.userId,
          partnerId: data.partnerId,
        };

        setOursData((old: any) => {
          if (!old) {
            return old;
          }

          const dates = upsertById(old.specialDates, newDate, {
            preserveExtras: true,
          });
          return {
            ...old,
            specialDates: sortSpecialDates(dates),
          };
        });

        [data.userId, data.partnerId].forEach((targetId) =>
          setProfileData(targetId, (old: any) => {
            if (!old) {
              return old;
            }

            const dates = upsertById(old.specialDates, newDate, {
              preserveExtras: true,
            });
            return {
              ...old,
              specialDates: sortSpecialDates(dates),
            };
          })
        );

        setHomeData((old: any) => {
          if (!old) {
            return old;
          }

          return {
            ...old,
            upcomingSpecialDate:
              data.upcomingSpecialDate ?? old.upcomingSpecialDate,
          };
        });

        pushRecentActivity(data.recentActivity);
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
        upcomingSpecialDate?: any;
        recentActivity?: {
          id: string;
          activity: string;
          createdAt: string;
        };
      }) => {
        if (!user?.id || String(data.partnerId) !== String(user.id)) {
          return;
        }

        const updatedDate = {
          id: data.id,
          date: data.date,
          title: data.title,
          description: data.description,
          userId: data.userId,
          partnerId: data.partnerId,
        };

        setOursData((old: any) => {
          if (!old) {
            return old;
          }

          const dates = replaceById(old.specialDates, updatedDate);
          return {
            ...old,
            specialDates: sortSpecialDates(dates),
          };
        });

        [data.userId, data.partnerId].forEach((targetId) =>
          setProfileData(targetId, (old: any) => {
            if (!old) {
              return old;
            }

            const dates = replaceById(old.specialDates, updatedDate);
            return {
              ...old,
              specialDates: sortSpecialDates(dates),
            };
          })
        );

        setHomeData((old: any) => {
          if (!old) {
            return old;
          }

          return {
            ...old,
            upcomingSpecialDate:
              data.upcomingSpecialDate ?? old.upcomingSpecialDate,
          };
        });

        pushRecentActivity(data.recentActivity);
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
        upcomingSpecialDate?: any;
        recentActivity?: {
          id: string;
          activity: string;
          createdAt: string;
        };
      }) => {
        if (!user?.id || String(data.partnerId) !== String(user.id)) {
          return;
        }

        setOursData((old: any) => {
          if (!old) {
            return old;
          }

          const dates = removeById(old.specialDates, data.id);
          return {
            ...old,
            specialDates: sortSpecialDates(dates),
          };
        });

        [data.userId, data.partnerId].forEach((targetId) =>
          setProfileData(targetId, (old: any) => {
            if (!old) {
              return old;
            }

            const dates = removeById(old.specialDates, data.id);
            return {
              ...old,
              specialDates: sortSpecialDates(dates),
            };
          })
        );

        setHomeData((old: any) => {
          if (!old) {
            return old;
          }

          return {
            ...old,
            upcomingSpecialDate:
              data.upcomingSpecialDate ?? old.upcomingSpecialDate,
          };
        });

        pushRecentActivity(data.recentActivity);
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
        recentActivity?: {
          id: string;
          activity: string;
          createdAt: string;
        };
      }) => {
        if (!user?.id || String(data.partnerId) !== String(user.id)) {
          return;
        }

        const stored = {
          id: data.id,
          title: data.title,
          message: data.message,
          createdAt: data.createdAt,
          updatedAt: data.updatedAt,
          userId: data.userId,
          partnerId: data.partnerId,
        };

        setProfileData(data.userId, (old: any) => {
          if (!old) {
            return old;
          }

          return {
            ...old,
            storedMessages: upsertById(old.storedMessages, stored),
          };
        });

        pushRecentActivity(data.recentActivity);
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
        recentActivity?: {
          id: string;
          activity: string;
          createdAt: string;
        };
      }) => {
        if (!user?.id || String(data.partnerId) !== String(user.id)) {
          return;
        }

        const stored = {
          id: data.id,
          title: data.title,
          message: data.message,
          createdAt: data.createdAt,
          updatedAt: data.updatedAt,
          userId: data.userId,
          partnerId: data.partnerId,
        };

        setProfileData(data.userId, (old: any) => {
          if (!old) {
            return old;
          }

          return {
            ...old,
            storedMessages: replaceById(old.storedMessages, stored),
          };
        });

        pushRecentActivity(data.recentActivity);
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
        recentActivity?: {
          id: string;
          activity: string;
          createdAt: string;
        };
      }) => {
        if (!user?.id || String(data.partnerId) !== String(user.id)) {
          return;
        }

        setProfileData(data.userId, (old: any) => {
          if (!old) {
            return old;
          }

          return {
            ...old,
            storedMessages: removeById(old.storedMessages, data.id),
          };
        });

        pushRecentActivity(data.recentActivity);
      }
    );

    s.on(
      "updateLoveLanguage",
      (data: {
        userId: string;
        loveLanguage: string;
        recentActivity?: any;
      }) => {
        if (!partnerId || String(partnerId) !== String(data.userId)) {
          return;
        }

        setProfileData(data.userId, (old: any) => {
          if (!old) {
            return old;
          }

          return {
            ...old,
            loveLanguage: data.loveLanguage,
          };
        });

        pushRecentActivity(data.recentActivity);
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
        recentActivity?: {
          id: string;
          activity: string;
          createdAt: string;
        };
      }) => {
        if (!user?.id || String(data.partnerId) !== String(user.id)) {
          return;
        }

        const memory = {
          id: data.id,
          memory: data.memory,
          date: data.date,
          author: data.author,
          partnerId: data.partnerId,
          userId: data.userId,
          createdAt: data.createdAt,
          updatedAt: data.updatedAt,
        };

        setOursData((old: any) => {
          if (!old) {
            return old;
          }

          return {
            ...old,
            recentFavoriteMemories: upsertById(
              old.recentFavoriteMemories,
              memory,
              { limit: 6, preserveExtras: true }
            ),
          };
        });

        setAllFavoriteMemories((old: any) => upsertById(old, memory));
        pushRecentActivity(data.recentActivity);
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
        recentActivity?: {
          id: string;
          activity: string;
          createdAt: string;
        };
      }) => {
        if (!user?.id || String(data.partnerId) !== String(user.id)) {
          return;
        }

        setOursData((old: any) => {
          if (!old) {
            return old;
          }

          return {
            ...old,
            recentFavoriteMemories: removeById(
              old.recentFavoriteMemories,
              data.id
            ),
          };
        });

        setAllFavoriteMemories((old: any) => removeById(old, data.id));
        pushRecentActivity(data.recentActivity);
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
        if (!user?.id || String(data.partnerId) !== String(user.id)) {
          return;
        }

        const memory = {
          id: data.id,
          memory: data.memory,
          date: data.date,
          author: data.author,
          partnerId: data.partnerId,
          userId: data.userId,
          createdAt: data.createdAt,
          updatedAt: data.updatedAt,
        };

        setOursData((old: any) => {
          if (!old) {
            return old;
          }

          return {
            ...old,
            recentFavoriteMemories: replaceById(
              old.recentFavoriteMemories,
              memory
            ),
          };
        });

        setAllFavoriteMemories((old: any) => replaceById(old, memory));
      }
    );

    s.on("updateAbout", (data: { aboutUser: any; recentActivity?: any }) => {
      if (!partnerId || String(partnerId) !== String(data.aboutUser.userId)) {
        return;
      }

      setProfileData(data.aboutUser.userId, (old: any) => {
        if (!old) {
          return old;
        }

        return {
          ...old,
          aboutUser: data.aboutUser,
        };
      });

      pushRecentActivity(data.recentActivity);
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
    queryClient.invalidateQueries({ queryKey: ["portal", user?.id] });

    const tasks: Promise<unknown>[] = [];

    if (partnerId) {
      tasks.push(
        queryClient.invalidateQueries({ queryKey: ["profile", partnerId] }),
        queryClient.invalidateQueries({ queryKey: ["ours", user?.id] }),
        queryClient.invalidateQueries({ queryKey: ["timeline", user?.id] })
      );
    }

    tasks.push(
      queryClient.invalidateQueries({
        queryKey: ["gifts", user.id],
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
