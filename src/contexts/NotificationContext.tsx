// external
import React, { createContext, useContext, ReactNode, useEffect } from "react";

// internal
import { setupNotificationListeners } from "../utils/notifications/notifications";
import { useAuth } from "./AuthContext";
import { navigationRef } from "../utils/navigation/navigation";

// interfaces
interface NotificationContextProps {}

const NotificationContext = createContext<NotificationContextProps | undefined>(
  undefined,
);

export const NotificationProvider = ({ children }: { children: ReactNode }) => {
  const { isAuthenticated } = useAuth();

  // use effects
  useEffect(() => {
    if (isAuthenticated) {
      const cleanup = setupNotificationListeners((response) => {
        const data = response.notification.request.content.data;

        if (!navigationRef.isReady()) {
          return;
        }

        const navigateTo = (tab: string, screen: string) => {
          (navigationRef as any).navigate("Main", {
            screen: tab,
            params: { screen },
          });
        };

        if (data?.type === "vent_message_received") {
          navigateTo("Home", "PortalScreen");
        } else if (data?.type === "sweet_message_received") {
          navigateTo("Home", "PortalScreen");
        } else if (data?.type === "user_status_update") {
          navigateTo("Home", "PartnerProfile");
        } else if (data?.type === "favorites_updated") {
          navigateTo("Home", "PartnerProfile");
        } else if (data?.type === "timeline_update") {
          navigateTo("Ours", "TimelineScreen");
        } else if (data?.type === "mood_update") {
          navigateTo("Home", "PartnerProfile");
        } else if (data?.type === "love_language_update") {
          navigateTo("Home", "PartnerProfile");
        } else if (data?.type === "home_location_update") {
          navigateTo("Home", "PartnerProfile");
        } else if (data?.type === "about_details_update") {
          navigateTo("Home", "PartnerProfile");
        } else if (data?.type === "gift_received") {
          navigateTo("Home", "PresentsScreen");
        } else if (data?.type === "special_date_created") {
          navigateTo("Ours", "OursScreen");
        } else if (data?.type === "special_date_updated") {
          navigateTo("Ours", "OursScreen");
        } else if (data?.type === "special_date_deleted") {
          navigateTo("Ours", "OursScreen");
        } else if (data?.type === "special_date_arrived") {
          navigateTo("Home", "HomeScreen");
        }
      });

      return cleanup;
    }
  }, [isAuthenticated]);

  return (
    <NotificationContext.Provider value={{}}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error(
      "useNotification must be used within a NotificationProvider",
    );
  }
  return context;
};
