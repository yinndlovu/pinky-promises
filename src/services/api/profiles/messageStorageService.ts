import axios from "axios";
import { BASE_URL } from "../../../configuration/config";

export async function storeMessage(
  token: string | null,
  title: string,
  message: string
) {
  if (!token) {
    return;
  }
  
  const res = await axios.post(
    `${BASE_URL}/messages/store`,
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
  const res = await axios.get(`${BASE_URL}/messages/view/${messageId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return res.data.message;
}

export async function getStoredMessages(token: string) {
  const res = await axios.get(`${BASE_URL}/messages/stored`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return res.data.messages;
}

export async function getReceivedMessages(token: string) {
  const res = await axios.get(`${BASE_URL}/messages/received`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return res.data.messages;
}

export async function updateMessage(
  token: string | null,
  messageId: string,
  title: string,
  message: string
) {
  if (!token) {
    return;
  }

  const res = await axios.put(
    `${BASE_URL}/messages/update/${messageId}`,
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

export async function deleteMessage(token: string | null, messageId: string) {
  if (!token) {
    return;
  }

  const res = await axios.delete(
    `${BASE_URL}/messages/delete/${messageId}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  return res.data;
}
