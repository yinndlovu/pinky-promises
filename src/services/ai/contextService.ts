import axios from "axios";
import { BASE_URL } from "../../configuration/config";

export async function getContext(token: string) {
  const res = await axios.get(`${BASE_URL}/ai/context`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  return res.data.context;
}
