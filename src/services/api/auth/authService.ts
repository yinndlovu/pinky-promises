import axios from "axios";
import { BASE_URL } from "../../../configuration/config";

export async function changePassword(
  token: string | null,
  currentPassword: string,
  newPassword: string,
  confirmPassword: string
) {
  if (!token) {
    return;
  }

  const res = await axios.put(
    `${BASE_URL}/auth/update-password`,
    { currentPassword, newPassword, confirmPassword },
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  return res.data.message;
}

export async function verifyPassword(token: string | null, password: string) {
  if (!token) {
    return;
  }

  const res = await axios.post(
    `${BASE_URL}/auth/verify-password`,
    { password },
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  return res.data.message;
}
