import axios from "axios";
import { BASE_URL } from "../../../configuration/config";

export async function updateSetMonthlyGift(
  token: string | null,
  setMonthlyGift: string
) {
  if (!token) {
    return;
  }

  const res = await axios.put(
    `${BASE_URL}/gift/monthly-gift/update`,
    { setMonthlyGift },
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );
  
  return res.data;
}
