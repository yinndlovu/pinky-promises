import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { BASE_URL } from "../../configuration/config";
import { encode } from "base64-arraybuffer";

export async function fetchCurrentUserProfileAndAvatar() {
  const token = await AsyncStorage.getItem("token");

  if (!token) {
    return;
  }

  const profileRes = await axios.get(`${BASE_URL}/api/profile/get-profile`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const user = profileRes.data.user;

  const pictureRes = await axios.get(
    `${BASE_URL}/api/profile/get-profile-picture/${user.id}`,
    {
      headers: { Authorization: `Bearer ${token}` },
      responseType: "arraybuffer",
    }
  );
  const mime = pictureRes.headers["content-type"] || "image/jpeg";
  const avatarUrl = `data:${mime};base64,${encode(pictureRes.data)}`;

  return {
    id: user.id,
    name: user.name,
    avatarUrl,
  };
}
