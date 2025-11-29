import axios from "axios";
import { BASE_URL } from "../../../configuration/config";

export async function storeMessage(
  token: string,
  title: string,
  message: string
) {
  const response = await axios.post(
    `${BASE_URL}/messages/store`,
    { title, message },
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  return response.data;
}

export async function viewMessage(token: string, messageId: string) {
  const response = await axios.get(`${BASE_URL}/messages/${messageId}/view`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return response.data.message;
}

export async function updateMessage(
  token: string,
  messageId: string,
  title: string,
  message: string
) {
  const response = await axios.put(
    `${BASE_URL}/messages/${messageId}/update`,
    {
      title,
      message,
    },
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  return response.data;
}

export async function deleteMessage(token: string, messageId: string) {
  const response = await axios.delete(`${BASE_URL}/messages/${messageId}/delete`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return response.data;
}
