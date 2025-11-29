import axios from "axios";
import { BASE_URL } from "../../../configuration/config";

export async function getOursData(token: string) {
  const response = await axios.get(`${BASE_URL}/ours`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return response.data;
}
