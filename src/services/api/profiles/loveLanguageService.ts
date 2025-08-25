import axios from "axios";
import { BASE_URL } from "../../../configuration/config";

export async function getLoveLanguage(token: string, userId: string) {
  const res = await axios.get(
    `${BASE_URL}/love-language/get-love-language/${userId}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  return res.data.loveLanguage;
}

export async function updateLoveLanguage(token: string, loveLanguage: string) {
  const res = await axios.put(
    `${BASE_URL}/love-language/update-love-language`,
    { loveLanguage },
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  return res.data.loveLanguage;
}
