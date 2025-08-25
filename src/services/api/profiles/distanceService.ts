import axios from "axios";
import { BASE_URL } from "../../../configuration/config";

export async function getPartnerDistance(token: string) {
  const res = await axios.get(`${BASE_URL}/location/partner-distance`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return res.data;
}
