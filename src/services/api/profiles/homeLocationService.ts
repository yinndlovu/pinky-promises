import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { BASE_URL } from "../../../configuration/config";

export async function getHomeLocation(token: string) {
  const local = await AsyncStorage.getItem("homeLocation");
  if (local) {
    return JSON.parse(local);
  }

  const res = await axios.get(`${BASE_URL}/api/location/get-home-location`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const { homeLocation } = res.data;
  await AsyncStorage.setItem("homeLocation", JSON.stringify(homeLocation));
  return homeLocation;
}

export async function removeHomeLocation(token: string) {
  const res = await axios.delete(`${BASE_URL}/api/location/remove`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return res.data;
}

export async function setHomeLocation(location: {
  latitude: number;
  longitude: number;
}) {
  await AsyncStorage.setItem("homeLocation", JSON.stringify(location));
}

export async function clearHomeLocation() {
  await AsyncStorage.removeItem("homeLocation");
}
