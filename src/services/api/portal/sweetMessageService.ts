import { BASE_URL } from "../../../configuration/config";
import axios from "axios";

export async function sendSweetMessage(token: string | null, message: string) {
  if (!token) {
    return;
  }
  
  const res = await axios.post(
    `${BASE_URL}/sweet-message/send`,
    { message },
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  return res.data;
}

export async function viewSweetMessage(token: string | null, sweetId: string) {
  if (!token) {
    return;
  }

  const res = await axios.get(
    `${BASE_URL}/sweet-message/${sweetId}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  return res.data;
}

export async function deleteSweetMessage(token: string | null, sweetId: string) {
  if (!token) {
    return;
  }

  const res = await axios.delete(
    `${BASE_URL}/sweet-message/${sweetId}/delete`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  return res.data;
}
