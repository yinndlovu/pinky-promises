import axios from "axios";
import { BASE_URL } from "../../../configuration/config";

export async function updateLoveLanguage(token: string, loveLanguage: string) {
  const response = await axios.put(
    `${BASE_URL}/love-language/update`,
    { loveLanguage },
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  return response.data.loveLanguage;
}
