import axios from "axios";
import { BASE_URL } from "../../../configuration/config";

export async function saveToken(authToken: string | null, token: string) {
  if (!authToken) {
    return;
  }

  const res = await axios.post(
    `${BASE_URL}/push-token/save`,
    { token },
    {
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
    }
  );

  return res.data;
}
