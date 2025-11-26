import axios from "axios";
import { BASE_URL } from "../../../configuration/config";

export async function ventToPartner(token: string | null, message: string) {
  if (!token) {
    return;
  }
  
  const res = await axios.post(
    `${BASE_URL}/vent-message/send`,
    { message },
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  return res.data;
}

export async function viewVentMessage(token: string | null, ventId: string) {
  if (!token) {
    return;
  }

  const res = await axios.get(
    `${BASE_URL}/vent-message/${ventId}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  return res.data;
}

export async function deleteVentMessage(token: string | null, ventId: string) {
  if (!token) {
    return;
  }

  const res = await axios.delete(
    `${BASE_URL}/vent-message/${ventId}/delete`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  return res.data;
}
