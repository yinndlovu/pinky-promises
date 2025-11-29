import axios from "axios";
import { BASE_URL } from "../../../configuration/config";

export async function getFavoriteMemoryById(token: string, memoryId: string) {
  const res = await axios.get(`${BASE_URL}/favorite-memories/${memoryId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return res.data.memory;
}

export async function getAllFavoriteMemories(token: string) {
  const res = await axios.get(`${BASE_URL}/favorite-memories`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return res.data.memories;
}

export async function createFavoriteMemory(
  token: string,
  memory: string,
  date: string
) {
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
  token: string,
  memoryId: string,
  memory: string,
  date: string
) {
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

export async function deleteFavoriteMemory(token: string, memoryId: string) {
  await axios.delete(`${BASE_URL}/favorite-memories/${memoryId}/delete`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}
