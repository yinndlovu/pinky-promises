import axios from "axios";
import { BASE_URL } from "../../../configuration/config";

export const NOTIFICATION_TYPES = [
  {
    key: "giftNotification",
    label: "Gift notifications",
    description: "Receive notifications when you receive a gift",
  },
  {
    key: "interactionNotification",
    label: "Interaction notifications",
    description: "Receive notifications when your partner interacts with you",
  },
  {
    key: "locationChangeNotification",
    label: "Location change notifications",
    description:
      "Receive notifications when your partner change their home location",
  },
  {
    key: "profileUpdateNotification",
    label: "Profile update notifications",
    description:
      "Receive notifications when your partner updates their profile",
  },
  {
    key: "oursUpdateNotification",
    label: "Ours update notifications",
    description:
      "Receive notifications when your partner updates anything between you two",
  },
  {
    key: "messageNotification",
    label: "Message notifications",
    description:
      "Receive notifications when your partner leaves a message for you",
  },
  {
    key: "movementNotification",
    label: "Movement notifications",
    description:
      "Receive notifications when your partner leaves or arrives at home",
  },
  {
    key: "reminderNotification",
    label: "Reminder notifications",
    description: "Receive casual notifications to remind you of stuff",
  },
];

export async function getNotificationPreference(token: string, type: string) {
  const res = await axios.get(`${BASE_URL}/notifications/preference/get`, {
    params: { type },
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return res.data.value;
}

export async function setNotificationPreference(
  token: string,
  type: string,
  value: boolean
) {
  const res = await axios.post(
    `${BASE_URL}/notifications/preference/set`,
    { type, value },
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  return res.data.value;
}

export async function getReminderInterval(token: string) {
  const res = await axios.get(`${BASE_URL}/notifications/interval/get`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return res.data.hours;
}

export async function setReminderInterval(token: string, hours: number) {
  const res = await axios.post(
    `${BASE_URL}/notifications/interval/set`,
    { hours },
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
  
  return res.data.hours;
}
