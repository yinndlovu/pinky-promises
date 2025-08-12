import axios from "axios";
import { BASE_URL } from "../../../configuration/config";

export async function interactWithPartner(token: string, action: string) {
  const res = await axios.post(
    `${BASE_URL}/api/interactions/interact/${action}`,
    {},
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  return res.data;
}

export async function getUnseenInteractions(token: string) {
  const res = await axios.get(`${BASE_URL}/api/interactions/unseen`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return res.data;
}
