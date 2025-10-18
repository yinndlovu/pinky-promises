import axios from "axios";
import { BASE_URL } from "../../../configuration/config";

export async function initiatePasswordReset(username: string) {
  const res = await axios.put(`${BASE_URL}/auth/reset-password/initiate`, {
    username,
  });

  return res.data;
}

export async function verifyPin(token: string | null, pin: string) {
  if (!token) {
    return;
  }

  const res = await axios.post(
    `${BASE_URL}/auth/reset-password/verify`,
    {
      pin,
    },
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  return res.data;
}

export async function resetPassword(token: string | null, newPassword: string) {
  if (!token) {
    return;
  }

  const res = await axios.post(
    `${BASE_URL}/auth/reset-password`,
    {
      newPassword,
    },
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  return res.data;
}

export async function resendPin(token: string | null) {
  if (!token) {
    return;
  }

  const res = await axios.put(
    `${BASE_URL}/auth/reset-password/resend-pin`,
    {},
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  return res.data;
}

export async function checkVerificationStatus(token: string | null) {
  if (!token) {
    return;
  }

  const res = await axios.get(`${BASE_URL}/auth/reset-password/status`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return res.data;
}
