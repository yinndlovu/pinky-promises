import axios from "axios";
import { BASE_URL } from "../../../configuration/config";

export async function updateAboutUser(token: string | null, about: string) {
  if (!token) {
    return;
  }

  const res = await axios.put(
    `${BASE_URL}/about/update`,
    { about },
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  return res.data.about;
}
