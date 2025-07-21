import { BASE_URL } from "../configuration/config";
import axios from "axios";

export async function sendSweetMessage(token: string, message: string) {
  const res = await axios.post(
    `${BASE_URL}/api/sweet-messages/send-sweet-message`,
    { message },
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
  return res.data;
}

export async function getLastUnseenSweetMessage(token: string) {
  const res = await axios.get(
    `${BASE_URL}/api/sweet-messages/get-sweet-message/last-unseen`,
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );

  return res.data;
}

export async function getSentSweetMessages(token: string) {
  const res = await axios.get(
    `${BASE_URL}/api/sweet-messages/get-sweet-messages/sent`,
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );

  return res.data;
}

export async function getReceivedSweetMessages(token: string) {
  const res = await axios.get(
    `${BASE_URL}/api/sweet-messages/get-sweet-messages/received`,
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );

  return res.data;
}

export async function viewSweetMessage(token: string, sweetId: string) {
  const res = await axios.get(
    `${BASE_URL}/api/sweet-messages/view-sweet-message/${sweetId}`,
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );

  return res.data;
}

export async function deleteSweetMessage(token: string, sweetId: string) {
  const res = await axios.delete(
    `${BASE_URL}/api/sweet-messages/delete-sweet-message/${sweetId}`,
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );
  
  return res.data;
}
