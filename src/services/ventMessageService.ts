import axios from "axios";
import { BASE_URL } from "../configuration/config";

export async function ventToPartner(token: string, message: string) {
  const res = await axios.post(
    `${BASE_URL}/api/vent-messages/send-vent-message`,
    { message },
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  return res.data;
}

export async function getLastUnseenVentMessage(token: string) {
  const res = await axios.get(
    `${BASE_URL}/api/vent-messages/get-vent-message/last-unseen`,
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );

  return res.data;
}

export async function getSentVentMessages(token: string) {
  const res = await axios.get(
    `${BASE_URL}/api/vent-messages/get-vent-messages/sent`,
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );

  return res.data;
}

export async function getReceivedVentMessages(token: string) {
  const res = await axios.get(
    `${BASE_URL}/api/vent-messages/get-vent-messages/received`,
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );

  return res.data;
}

export async function viewVentMessage(token: string, ventId: string) {
  const res = await axios.get(
    `${BASE_URL}/api/vent-messages/view-vent-message/${ventId}`,
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );

  return res.data;
}

export async function deleteVentMessage(token: string, ventId: string) {
  const res = await axios.delete(
    `${BASE_URL}/api/vent-messages/delete-vent-message/${ventId}`,
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );

  return res.data;
}
