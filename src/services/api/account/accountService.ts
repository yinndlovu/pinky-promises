import axios from "axios";
import { BASE_URL } from "../../../configuration/config";

export async function deleteAccount(token: string) {
  const res = await axios.delete(`${BASE_URL}/api/account/delete`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return res.data.message;
}
