import axios from "axios";
import { BASE_URL } from "../../../configuration/config";

export async function getFavoriteMemoryById(
  token: string | null,
  memoryId: string
) {
  if (!token) {
    return;
  }

  const res = await axios.get(
    `${BASE_URL}/favorite-memories/${memoryId}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  return res.data.memory;
}

export async function getAllFavoriteMemories(token: string | null) {
  if (!token) {
    return;
  }

  const res = await axios.get(`${BASE_URL}/favorite-memories`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return res.data.memories;
}

export async function createFavoriteMemory(
  token: string | null,
  memory: string,
  date: string
) {
  if (!token) {
    return;
  }

  const res = await axios.post(
    `${BASE_URL}/favorite-memories/add`,
    { memory, date },
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  return res.data.memoryRecord;
}

export async function updateFavoriteMemory(
  token: string | null,
  memoryId: string,
  memory: string,
  date: string
) {
  if (!token) {
    return;
  }

  const res = await axios.put(
    `${BASE_URL}/favorite-memories/${memoryId}/update`,
    { memory, date },
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  return res.data.memory;
}

export async function deleteFavoriteMemory(
  token: string | null,
  memoryId: string
) {
  if (!token) {
    return;
  }

  await axios.delete(`${BASE_URL}/favorite-memories/${memoryId}/delete`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}
