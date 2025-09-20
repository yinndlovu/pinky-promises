import { BASE_URL } from "../../../configuration/config";
import axios from "axios";

export async function sendSweetMessage(token: string | null, message: string) {
  if (!token) {
    return;
  }
  
  const res = await axios.post(
    `${BASE_URL}/sweet-messages/send-sweet-message`,
    { message },
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  return res.data;
}

export async function getLastUnseenSweetMessage(token: string | null) {
  if (!token) {
    return;
  }

  const res = await axios.get(
    `${BASE_URL}/sweet-messages/get-sweet-message/last-unseen`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  return res.data;
}

export async function getSentSweetMessages(token: string | null) {
  if (!token) {
    return;
  }

  const res = await axios.get(
    `${BASE_URL}/sweet-messages/get-sweet-messages/sent`,
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );

  return res.data;
}

export async function getReceivedSweetMessages(token: string | null) {
  if (!token) {
    return;
  }

  const res = await axios.get(
    `${BASE_URL}/sweet-messages/get-sweet-messages/received`,
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
    `${BASE_URL}/sweet-messages/view-sweet-message/${sweetId}`,
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
    `${BASE_URL}/sweet-messages/delete-sweet-message/${sweetId}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  return res.data;
}
