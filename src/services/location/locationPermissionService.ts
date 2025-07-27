import * as Location from "expo-location";
import { LOCATION_TASK_NAME } from "../../background/LocationTask";

export async function requestLocationPermissions() {
  const { status } = await Location.requestForegroundPermissionsAsync();

  if (status !== "granted") {
    throw new Error("Foreground location permission denied");
  }

  const { status: bgStatus } =
    await Location.requestBackgroundPermissionsAsync();

  if (bgStatus !== "granted") {
    throw new Error("Background location permission denied");
  }

  return {
    foreground: status,
    background: bgStatus,
  };
}

export async function startBackgroundLocationTracking() {
  try {
    await Location.startLocationUpdatesAsync(LOCATION_TASK_NAME, {
      accuracy: Location.Accuracy.High,
      timeInterval: 5 * 60 * 1000,
      distanceInterval: 30,
      showsBackgroundLocationIndicator: true,
      foregroundService: {
        notificationTitle: "Location Service",
        notificationBody: "Tracking your home status...",
      },
    });
  } catch (error) {
    console.error("Failed to start background location tracking:", error);
  }
}

export async function checkLocationPermissions() {
  const foregroundStatus = await Location.getForegroundPermissionsAsync();
  const backgroundStatus = await Location.getBackgroundPermissionsAsync();

  return {
    foreground: foregroundStatus.status,
    background: backgroundStatus.status,
  };
}
