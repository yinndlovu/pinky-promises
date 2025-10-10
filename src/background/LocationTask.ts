// external
import * as TaskManager from "expo-task-manager";
import AsyncStorage from "@react-native-async-storage/async-storage";

// internal
import { getHomeLocation } from "../services/api/profiles/homeLocationService";
import { updateUserStatus } from "../services/api/profiles/userStatusService";
import { updateGeoInfo } from "../services/api/profiles/geoInfoService";
import { getDistance } from "../utils/location/locationUtils";

const LOCATION_TASK_NAME = "background-location-task";

TaskManager.defineTask(LOCATION_TASK_NAME, async ({ data, error }) => {
  const token = await AsyncStorage.getItem("token");

  if (!token) {
    return;
  }

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
      const isAtHome = distance < 150;

      await updateUserStatus(token, isAtHome, isAtHome ? undefined : distance);
      await updateGeoInfo(
        token,
        location.coords.latitude,
        location.coords.longitude
      );
    } catch (err) {}
  }
});

export { LOCATION_TASK_NAME };
