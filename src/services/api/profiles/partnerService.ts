import axios from "axios";
import { BASE_URL } from "../../../configuration/config";

export async function sendPartnerRequest(token: string, partnerId: string) {
  const response = await axios.post(
    `${BASE_URL}/partnership/add`,
    { partnerId },
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  return response.data;
}

export async function checkPendingRequest(token: string, partnerId: string) {
  const response = await axios.get(
    `${BASE_URL}/partnership/request/check/${partnerId}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  return response.data;
}

export async function cancelPartnerRequest(token: string, partnerId: string) {
  const response = await axios.delete(
    `${BASE_URL}/partnership/request/cancel/${partnerId}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  return response.data;
}

export async function getIncomingRequest(token: string, fromUserId: string) {
  const response = await axios.get(
    `${BASE_URL}/partnership/request/incoming/${fromUserId}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  return response.data;
}

export async function acceptPartnerRequest(token: string, requestId: string) {
  const response = await axios.post(
    `${BASE_URL}/partnership/request/accept`,
    { requestId },
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  return response.data;
}

export async function getReceivedPartnerRequests(token: string) {
  const response = await axios.get(`${BASE_URL}/partnership/requests`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return response.data.requests;
}

export async function getReceivedRequestsCount(token: string) {
  const response = await axios.get(`${BASE_URL}/partnership/requests/count`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return response.data;
}

export async function rejectPartnerRequest(token: string, requestId: string) {
  const response = await axios.post(
    `${BASE_URL}/partnership/request/reject`,
    { requestId },
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  return response.data;
}

export async function removePartner(token: string) {
  const response = await axios.post(
    `${BASE_URL}/partnership/remove`,
    {},
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  return response.data;
}
