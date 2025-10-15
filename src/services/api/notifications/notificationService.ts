import { BASE_URL } from "../../../configuration/config";
import axios from "axios";

export async function getNotifications(userId: string, token: string | null) {
  if (!token) {
    return;
  }

  const res = await axios.get(`${BASE_URL}/notifications/${userId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return res.data;
}

export async function markNotificationSeen(
  token: string | null,
  notificationId: string
) {
  if (!token) {
    return;
  }

  const res = await axios.patch(
    `${BASE_URL}/notifications/${notificationId}/seen`,
    {},
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  return res.data;
}
