import axios from "axios";
import { BASE_URL } from "../../../configuration/config";

export async function getHomeScreenData(token: string) {
  const response = await axios.get(`${BASE_URL}/home`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return response.data;
}
