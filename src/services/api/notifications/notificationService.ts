import { BASE_URL } from "../../../configuration/config";
import axios from "axios";

export async function markNotificationSeen(
  token: string,
  notificationId: string
) {
  const response = await axios.patch(
    `${BASE_URL}/notifications/${notificationId}/seen`,
    {},
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  return response.data;
}
