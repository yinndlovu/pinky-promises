import axios from "axios";
import { BASE_URL } from "../configuration/config";

export async function changePassword(
  token: string,
  currentPassword: string,
  newPassword: string,
  confirmPassword: string
) {
  const res = await axios.put(
    `${BASE_URL}/api/auth/change-password`,
    { currentPassword, newPassword, confirmPassword },
    { headers: { Authorization: `Bearer ${token}` } }
  );
  
  return res.data.message;
}
