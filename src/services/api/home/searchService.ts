import axios from "axios";
import { BASE_URL } from "../../../configuration/config";

export async function searchUsers(token: string, query: string) {
  const res = await axios.get(
    `${BASE_URL}/search/search-users?q=${encodeURIComponent(query)}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  return res.data.users;
}
