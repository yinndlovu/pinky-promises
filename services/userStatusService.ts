import axios from "axios";
import { BASE_URL } from "../configuration/config";

export async function updateUserStatus(token: string, isAtHome: boolean) {
  await axios.put(
    `${BASE_URL}/api/user-status/update-status`,
    { isAtHome },
    { headers: { Authorization: `Bearer ${token}` } }
  );
}

export async function fetchUserStatus(token: string, userId: string) {
  const res = await axios.get(
    `${BASE_URL}/api/user-status/get-status/${userId}`,
    { headers: { Authorization: `Bearer ${token}` } }
  );

  return res.data.status;
}
