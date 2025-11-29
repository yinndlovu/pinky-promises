import axios from "axios";
import { BASE_URL } from "../../../configuration/config";

export async function getNotificationPreferences(token: string) {
  const response = await axios.get(`${BASE_URL}/notifications/preferences`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return response.data;
}

export async function setNotificationPreference(
  token: string,
  type: string,
  value: boolean
) {
  const response = await axios.post(
    `${BASE_URL}/notifications/preference/set`,
    { type, value },
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  return response.data.value;
}

export async function getReminderInterval(token: string) {
  const response = await axios.get(`${BASE_URL}/notifications/interval`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return response.data.hours;
}

export async function setReminderInterval(token: string, hours: number) {
  const response = await axios.post(
    `${BASE_URL}/notifications/interval/set`,
    { hours },
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  return response.data.hours;
}
