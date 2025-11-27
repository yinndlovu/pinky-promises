import axios from "axios";
import { BASE_URL } from "../../../configuration/config";

export async function updateLoveLanguage(token: string, loveLanguage: string) {
  const res = await axios.put(
    `${BASE_URL}/love-language/update`,
    { loveLanguage },
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  return res.data.loveLanguage;
}
