import axios from "axios";
import { BASE_URL } from "../../../configuration/config";

export async function interactWithPartner(token: string, action: string) {
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
