import axios from "axios";
import { BASE_URL } from "../../../configuration/config";

export async function getPortalActivityCount(token: string) {
  const res = await axios.get(`${BASE_URL}/count/portal-activity`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return res.data.counts;
}
