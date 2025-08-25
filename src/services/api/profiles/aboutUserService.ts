import axios from "axios";
import { BASE_URL } from "../../../configuration/config";

export async function getAboutUser(token: string, userId: string) {
  const res = await axios.get(
    `${BASE_URL}/more-about-you/get-about-user/${userId}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  return res.data.about;
}

export async function updateAboutUser(token: string, about: string) {
  const res = await axios.put(
    `${BASE_URL}/more-about-you/update-about-user`,
    { about },
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  return res.data.about;
}
