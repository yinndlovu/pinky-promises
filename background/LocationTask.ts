import * as TaskManager from "expo-task-manager";
import * as Location from "expo-location";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { getHomeLocation } from "../services/homeLocationService";
import { updateUserStatus } from "../services/userStatusService";
import { getDistance } from "../utils/locationUtils";

const LOCATION_TASK_NAME = "background-location-task";

TaskManager.defineTask(LOCATION_TASK_NAME, async ({ data, error }) => {
  if (error) {
    return;
  }

  if (data) {
    const { locations } = data as any;
    const location = locations[0];

    if (!location) {
      return;
    }

    try {
      const token = await AsyncStorage.getItem("token");

      if (!token) {
        return;
      }

      const home = await getHomeLocation(token);

      if (!home) {
        return;
      }

      const distance = getDistance(
        location.coords.latitude,
        location.coords.longitude,
        home.latitude,
        home.longitude
      );
      const isAtHome = distance < 100;

      await updateUserStatus(token, isAtHome);
    } catch (err) {}
  }
});

export { LOCATION_TASK_NAME };
