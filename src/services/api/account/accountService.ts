import axios from "axios";
import { BASE_URL } from "../../../configuration/config";

export async function deleteAccount(token: string) {
  const response = await axios.delete(`${BASE_URL}/account/delete`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return response.data.message;
}
