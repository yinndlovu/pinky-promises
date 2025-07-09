import axios from "axios";
import { BASE_URL } from "../configuration/config";

export async function getOldestUnclaimedGift(token: string) {
  const res = await axios.get(
    `${BASE_URL}/api/gift/get-oldest-unclaimed-gift`,
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );
  return res.data.gift;
}
