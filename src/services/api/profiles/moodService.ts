import axios from "axios";
import { BASE_URL } from "../../../configuration/config";

export async function getMood(token: string) {
  const res = await axios.get(`${BASE_URL}/mood/get-mood`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return res.data.mood;
}

export async function updateMood(token: string, mood: string) {
  const res = await axios.put(
    `${BASE_URL}/mood/update-mood`,
    { mood },
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  return res.data.mood;
}

export async function getUserMood(token: string, userId: string) {
  const res = await axios.get(`${BASE_URL}/mood/get-user-mood/${userId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return res.data.mood;
}
