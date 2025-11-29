import axios from "axios";
import { BASE_URL } from "../../../configuration/config";

export async function getPortalData(token: string) {
  const response = await axios.get(`${BASE_URL}/portal`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return response.data;
}
