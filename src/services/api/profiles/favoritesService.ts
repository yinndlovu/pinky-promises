import axios from "axios";
import { BASE_URL } from "../../../configuration/config";

export async function updateUserFavorites(token: string, favorites: any) {
  const res = await axios.put(
    `${BASE_URL}/user-favorites/update-user-favorites`,
    favorites,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  return res.data.favorites;
}
