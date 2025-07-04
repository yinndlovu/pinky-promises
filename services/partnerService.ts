import axios from "axios";
import { BASE_URL } from "../configuration/config";

export async function getPartner(token: string) {
  const res = await axios.get(`${BASE_URL}/api/partnership/get-partner`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  return res.data.partner;
}
