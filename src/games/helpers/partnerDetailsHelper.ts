import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { BASE_URL } from "../../configuration/config";
import { encode } from "base64-arraybuffer";
import { getPartner } from "../../services/api/profiles/partnerService";
import { v4 as uuidv4 } from "uuid";

export async function fetchPartnerProfileAndAvatar() {
  let partner: { id: string; name: string } | null = null;

  try {
    const token = await AsyncStorage.getItem("token");

    if (!token) {
      return;
    }

    partner = await getPartner(token);

    if (!partner?.id) {
      return;
    }

    const pictureRes = await axios.get(
      `${BASE_URL}/api/profile/get-profile-picture/${partner.id}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        responseType: "arraybuffer",
      }
    );
    const mime = pictureRes.headers["content-type"] || "image/jpeg";
    const avatarUrl = `data:${mime};base64,${encode(pictureRes.data)}`;

    return {
      id: partner.id,
      name: partner.name,
      avatarUrl,
    };
  } catch (error: any) {
    console.warn(
      "Failed to fetch partner avatar:",
      error.data?.response?.status || error.data?.response?.message
    );
    return {
      id: partner?.id || uuidv4(),
      name: partner?.name || "Unknown",
      avatarUrl: null,
    };
  }
}
