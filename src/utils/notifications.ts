import * as Notifications from "expo-notifications";
import * as Device from "expo-device";
import { Platform } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { BASE_URL } from "../configuration/config";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export async function registerForPushNotificationsAsync() {
  let token;

  if (Device.isDevice) {
    const { status: existingStatus } =
      await Notifications.getPermissionsAsync();

    let finalStatus = existingStatus;

    if (existingStatus !== "granted") {
      const { status } = await Notifications.requestPermissionsAsync();

      finalStatus = status;
    }

    if (finalStatus !== "granted") {
      alert("Failed to get push token for push notification!");
      return;
    }

    try {
      const tokenObj = await Notifications.getExpoPushTokenAsync();
      const token = tokenObj.data;

      const authToken = await AsyncStorage.getItem("token");

      if (authToken) {
        try {
          await axios.post(
            `${BASE_URL}/api/push-token/save`,
            { token },
            { headers: { Authorization: `Bearer ${authToken}` } }
          );
        } catch (error) {}
      } else {
      }
    } catch (err) {}
  } else {
    alert("Must use physical device for Push Notifications");
  }

  if (Platform.OS === "android") {
    Notifications.setNotificationChannelAsync("default", {
      name: "default",
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: "#FF231F7C",
    });
  }

  return token;
}

export function setupNotificationListeners(
  onNotificationResponse: (response: Notifications.NotificationResponse) => void
) {
  const responseListener =
    Notifications.addNotificationResponseReceivedListener(
      onNotificationResponse
    );

  return () => {
    responseListener.remove();
  };
}
