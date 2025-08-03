import axios from "axios";
import { BASE_URL } from "../../../configuration/config";

export async function storeMessage(
  token: string,
  title: string,
  message: string
) {
  const res = await axios.post(
    `${BASE_URL}/api/messages/store`,
    { title, message },
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  return res.data;
}

export async function viewMessage(token: string, messageId: string) {
  const res = await axios.get(`${BASE_URL}/api/messages/view/${messageId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return res.data.message;
}

export async function getStoredMessages(token: string) {
  const res = await axios.get(`${BASE_URL}/api/messages/stored`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return res.data.messages;
}

export async function getReceivedMessages(token: string) {
  const res = await axios.get(`${BASE_URL}/api/messages/received`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return res.data.messages;
}

export async function updateMessage(
  token: string,
  messageId: string,
  title: string,
  message: string
) {
  const res = await axios.put(
    `${BASE_URL}/api/messages/update/${messageId}`,
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

  return res.data;
}

export async function deleteMessage(token: string, messageId: string) {
  const res = await axios.delete(
    `${BASE_URL}/api/messages/delete/${messageId}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  return res.data;
}
