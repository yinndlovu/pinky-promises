import { getHomeLocation } from "../services/api/profiles/homeLocationService";
import { checkLocationPermissions } from "../services/location/locationPermissionService";
import * as Location from "expo-location";
import { getDistance } from "../utils/location/locationUtils";
import { updateUserStatus } from "../services/api/profiles/userStatusService";
import { updateGeoInfo } from "../services/api/profiles/geoInfoService";

export const checkAndUpdateHomeStatus = async (token: string | null) => {
  try {
    if (!token) {
      return;
    }
    
    const home = await getHomeLocation(token);

    if (!home) {
      return;
    }

    const { foreground } = await checkLocationPermissions();
    if (foreground !== "granted") {
      return;
    }

    const { coords } = await Location.getCurrentPositionAsync({});
    const distance = getDistance(
      coords.latitude,
      coords.longitude,
      home.latitude,
      home.longitude
    );
    const isAtHome = distance < 150;

    await updateUserStatus(token, isAtHome, isAtHome ? undefined : distance);
    await updateGeoInfo(token, coords.latitude, coords.longitude);
  } catch (err) {}
};
