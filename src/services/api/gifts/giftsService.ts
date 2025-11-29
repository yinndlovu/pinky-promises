import axios from "axios";
import { BASE_URL } from "../../../configuration/config";

export async function getGiftsData(token: string) {
  const response = await axios.get(`${BASE_URL}/gifts`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return response.data;
}

export async function claimMonthlyGift(token: string, giftId: string) {
  const response = await axios.put(
    `${BASE_URL}/gift/${giftId}/claim`,
    {},
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );

  return response.data;
}

export async function updateSetMonthlyGift(
  token: string,
  setMonthlyGift: string
) {
  const res = await axios.put(
    `${BASE_URL}/gift/monthly-gift/update`,
    { setMonthlyGift },
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );
  
  return res.data;
}
