import axios from "axios";
import { BASE_URL } from "../../../configuration/config";

export async function getServerTheme(token: string) {
  const response = await axios.get(`${BASE_URL}/server-theme`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data;
}
