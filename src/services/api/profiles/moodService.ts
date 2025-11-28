import axios from "axios";
import { BASE_URL } from "../../../configuration/config";

export async function updateMood(token: string, mood: string) {
  const response = await axios.put(
    `${BASE_URL}/mood/update`,
    { mood },
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  return response.data.mood;
}
