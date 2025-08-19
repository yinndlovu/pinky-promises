import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { BASE_URL } from "../../configuration/config";
import { encode } from "base64-arraybuffer";
import { v4 as uuidv4 } from "uuid";

export async function fetchCurrentUserProfileAndAvatar() {
  let user: { id: string; name: string } | null = null;

  try {
    // Fetch user profile
    const token = await AsyncStorage.getItem("token");

    if (!token) {
      return;
    }

    const profileRes = await axios.get(`${BASE_URL}/api/profile/get-profile`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    user = profileRes.data.user;

    if (!user?.id) {
      return;
    }

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
  } catch (error: any) {
    console.warn(
      "Failed to fetch user avatar:",
      error.response?.status || error.message
    );
    return {
      id: user?.id || uuidv4(),
      name: user?.name || "Unknown",
      avatarUrl: null,
    };
  }
}
