import axios from "axios";
import { BASE_URL } from "../../../configuration/config";

export interface Resolution {
  id: number;
  title: string;
  dueDate: string;
  completed: boolean;
  completedAt: string | null;
  userId: number;
  assignedByAdmin: boolean;
  assignedByUserId: number | null;
  createdAt: string;
  updatedAt: string;
}

export async function getResolutions(token: string): Promise<Resolution[]> {
  const response = await axios.get(`${BASE_URL}/resolutions`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return response.data;
}

export async function createResolution(
  token: string,
  title: string,
  dueDate: string
): Promise<Resolution> {
  const response = await axios.post(
    `${BASE_URL}/resolutions`,
    { title, dueDate },
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  return response.data;
}

export async function markResolutionComplete(
  token: string,
  resolutionId: number
): Promise<Resolution> {
  const response = await axios.patch(
    `${BASE_URL}/resolutions/${resolutionId}/complete`,
    {},
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  return response.data;
}

export async function getPartnerResolutions(
  token: string
): Promise<Resolution[]> {
  const response = await axios.get(`${BASE_URL}/resolutions/partner`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return response.data;
}

