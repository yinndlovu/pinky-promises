import axios from "axios";
import { BASE_URL } from "../../../configuration/config";

export async function getOldestUnclaimedGift(token: string | null) {
  if (!token) {
    return;
  }

  const res = await axios.get(`${BASE_URL}/gift/get-oldest-unclaimed-gift`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  return res.data.gift;
}

export async function claimMonthlyGift(token: string | null, giftId: string) {
  if (!token) {
    return;
  }

  const res = await axios.put(
    `${BASE_URL}/gift/claim-monthly-gift/${giftId}`,
    {},
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );

  return res.data;
}

export async function getLastFiveClaimedGifts(token: string | null) {
  if (!token) {
    return;
  }

  const res = await axios.get(`${BASE_URL}/gift/get-last-five-claimed-gifts`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  return res.data.gifts;
}
