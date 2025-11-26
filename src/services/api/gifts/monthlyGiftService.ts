import axios from "axios";
import { BASE_URL } from "../../../configuration/config";

export async function claimMonthlyGift(token: string | null, giftId: string) {
  if (!token) {
    return;
  }

  const res = await axios.put(
    `${BASE_URL}/gift/${giftId}/claim`,
    {},
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );

  return res.data;
}
