import axios from "axios";
import { BASE_URL } from "../../../configuration/config";

export async function getPartner(token: string | null) {
  if (!token) {
    return;
  }

  const res = await axios.get(`${BASE_URL}/partnership/get-partner`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return res.data.partner;
}

export async function sendPartnerRequest(token: string | null, partnerId: string) {
  if (!token) {
    return;
  }

  const res = await axios.post(
    `${BASE_URL}/partnership/add-partner`,
    { partnerId },
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  return res.data;
}

export async function checkPendingRequest(token: string | null, partnerId: string) {
  if (!token) {
    return;
  }

  const res = await axios.get(
    `${BASE_URL}/partnership/check-pending/${partnerId}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  return res.data;
}

export async function cancelPartnerRequest(token: string | null, partnerId: string) {
  if (!token) {
    return;
  }
  
  const res = await axios.delete(
    `${BASE_URL}/partnership/cancel-request/${partnerId}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  return res.data;
}

export async function getIncomingRequest(token: string | null, fromUserId: string) {
  if (!token) {
    return;
  }

  const res = await axios.get(
    `${BASE_URL}/partnership/incoming-request/${fromUserId}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  return res.data;
}

export async function acceptPartnerRequest(token: string | null, requestId: string) {
  if (!token) {
    return;
  }

  const res = await axios.post(
    `${BASE_URL}/partnership/accept-partner-request`,
    { requestId },
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  return res.data;
}

export async function getReceivedPartnerRequests(token: string | null) {
  if (!token) {
    return;
  }

  const res = await axios.get(
    `${BASE_URL}/partnership/get-received-partner-requests`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  return res.data.requests;
}

export async function rejectPartnerRequest(token: string | null, requestId: string) {
  if (!token) {
    return;
  }

  const res = await axios.post(
    `${BASE_URL}/partnership/reject-partner-request`,
    { requestId },
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  return res.data;
}

export async function removePartner(token: string | null) {
  if (!token) {
    return;
  }
  
  const res = await axios.post(
    `${BASE_URL}/partnership/remove-partner`,
    {},
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  return res.data;
}
