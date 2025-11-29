import { BASE_URL } from "../../../configuration/config";
import axios from "axios";

export async function sendSweetMessage(token: string, message: string) {
  const response = await axios.post(
    `${BASE_URL}/sweet-message/send`,
    { message },
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  return response.data;
}

export async function viewSweetMessage(token: string, sweetId: string) {
  const response = await axios.get(`${BASE_URL}/sweet-message/${sweetId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return response.data;
}

export async function deleteSweetMessage(token: string, sweetId: string) {
  const response = await axios.delete(
    `${BASE_URL}/sweet-message/${sweetId}/delete`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  return response.data;
}

export async function getSentSweetMessages(token: string) {
  const response = await axios.get(`${BASE_URL}/sweet-message/sent`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return response.data;
}

export async function getReceivedSweetMessages(token: string) {
  const response = await axios.get(`${BASE_URL}/sweet-messages/received`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return response.data;
}
