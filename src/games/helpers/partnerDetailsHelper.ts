// external
import axios from "axios";
import { encode } from "base64-arraybuffer";
import { v4 as uuidv4 } from "uuid";

// internal
import useToken from "../../hooks/useToken";
import { getPartner } from "../../services/api/profiles/partnerService";
import { BASE_URL } from "../../configuration/config";

export async function fetchPartnerProfileAndAvatar() {
  // variables
  const token = useToken();

  if (!token) {
    return;
  }

  let partner: { id: string; name: string } | null = null;

  try {
    partner = await getPartner(token);

    if (!partner?.id) {
      return;
    }

    const pictureRes = await axios.get(
      `${BASE_URL}/profile/get-profile-picture/${partner.id}`,
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
    return {
      id: partner?.id || uuidv4(),
      name: partner?.name || "Unknown",
      avatarUrl: null,
    };
  }
}
