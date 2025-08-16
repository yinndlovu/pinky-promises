import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { BASE_URL } from "../../configuration/config";
import { encode } from "base64-arraybuffer";
import { getPartner } from "../../services/api/profiles/partnerService";

export async function fetchPartnerProfileAndAvatar() {
  const token = await AsyncStorage.getItem("token");

  if (!token) {
    return;
  }

  const partner = await getPartner(token);

  if (!partner?.id) {
    return;
  }

  const pictureRes = await axios.get(
    `${BASE_URL}/api/profile/get-profile-picture/${partner.id}`,
    {
      headers: { Authorization: `Bearer ${token}` },
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
}
