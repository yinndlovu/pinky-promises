import axios from "axios";
import { BASE_URL } from "../../../configuration/config";

export async function getSetMonthlyGift(token: string, userId: string) {
  const res = await axios.get(
    `${BASE_URL}/gift/get-set-monthly-gift/${userId}`,
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );

  return res.data;
}

export async function updateSetMonthlyGift(
  token: string,
  setMonthlyGift: string
) {
  const res = await axios.put(
    `${BASE_URL}/gift/update-set-monthly-gift`,
    { setMonthlyGift },
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );
  
  return res.data;
}
