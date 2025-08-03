import React, { createContext, useContext, ReactNode, useEffect } from "react";
import { setupNotificationListeners } from "../utils/notifications";
import { useAuth } from "./AuthContext";
import { navigationRef } from "../../App";

interface NotificationContextProps {}

const NotificationContext = createContext<NotificationContextProps | undefined>(
  undefined
);

export const NotificationProvider = ({ children }: { children: ReactNode }) => {
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    if (isAuthenticated) {
      const cleanup = setupNotificationListeners((response) => {
        const data = response.notification.request.content.data;

        if (data?.type === "vent_message_received") {
          navigationRef.navigate("PortalScreen" as never);
        } else if (data?.type === "sweet_message_received") {
          navigationRef.navigate("PortalScreen" as never);
        } else if (data?.type === "user_status_update") {
          navigationRef.navigate("PartnerProfile" as never);
        } else if (data?.type === "favorites_updated") {
          navigationRef.navigate("PartnerProfile" as never);
        } else if (data?.type === "timeline_update") {
          navigationRef.navigate("TimelineScreen" as never);
        } else if (data?.type === "mood_update") {
          navigationRef.navigate("PartnerProfile" as never);
        } else if (data?.type === "love_language_update") {
          navigationRef.navigate("PartnerProfile" as never);
        } else if (data?.type === "home_location_update") {
          navigationRef.navigate("PartnerProfile" as never);
        } else if (data?.type === "about_details_update") {
          navigationRef.navigate("PartnerProfile" as never);
        } else if (data?.type === "gift_received") {
          navigationRef.navigate("Presents" as never);
        } else if (data?.type === "special_date_created") {
          navigationRef.navigate("Ours" as never);
        } else if (data?.type === "special_date_updated") {
          navigationRef.navigate("Ours" as never);
        } else if (data?.type === "special_date_deleted") {
          navigationRef.navigate("Ours" as never);
        } else if (data?.type === "special_date_arrived") {
          navigationRef.navigate("Home" as never);
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
      "useNotification must be used within a NotificationProvider"
    );
  }
  return context;
};
