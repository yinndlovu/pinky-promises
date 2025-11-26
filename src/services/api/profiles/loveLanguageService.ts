import axios from "axios";
import { BASE_URL } from "../../../configuration/config";

export async function updateLoveLanguage(
  token: string | null,
  loveLanguage: string
) {
  if (!token) {
    return;
  }

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
