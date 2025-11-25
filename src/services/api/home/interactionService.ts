import axios from "axios";
import { BASE_URL } from "../../../configuration/config";

export async function interactWithPartner(token: string | null, action: string) {
  if (!token) {
    return;
  }

  const res = await axios.post(
    `${BASE_URL}/interactions/interact/${action}`,
    {},
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  return res.data;
}
