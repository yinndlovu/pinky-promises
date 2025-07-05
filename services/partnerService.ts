import axios from "axios";
import { BASE_URL } from "../configuration/config";

export async function getPartner(token: string) {
  const res = await axios.get(`${BASE_URL}/api/partnership/get-partner`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  return res.data.partner;
}

export async function sendPartnerRequest(token: string, partnerId: string) {
  const res = await axios.post(
    `${BASE_URL}/api/partnership/add-partner`,
    { partnerId },
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );
  return res.data;
}

export async function checkPendingRequest(token: string, partnerId: string) {
  const res = await axios.get(
    `${BASE_URL}/api/partnership/check-pending/${partnerId}`,
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );
  return res.data;
}

export async function cancelPartnerRequest(token: string, partnerId: string) {
  const res = await axios.delete(
    `${BASE_URL}/api/partnership/cancel-request/${partnerId}`,
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );
  return res.data;
}

export async function getIncomingRequest(token: string, fromUserId: string) {
  const res = await axios.get(
    `${BASE_URL}/api/partnership/incoming-request/${fromUserId}`,
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );
  return res.data;
}

export async function acceptPartnerRequest(token: string, requestId: string) {
  const res = await axios.post(
    `${BASE_URL}/api/partnership/accept-partner-request`,
    { requestId },
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );
  return res.data;
}

export async function getReceivedPartnerRequests(token: string) {
  const res = await axios.get(
    `${BASE_URL}/api/partnership/get-received-partner-requests`,
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );
  return res.data.requests;
}

export async function rejectPartnerRequest(token: string, requestId: string) {
  const res = await axios.post(
    `${BASE_URL}/api/partnership/reject-partner-request`,
    { requestId },
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );
  return res.data;
}
