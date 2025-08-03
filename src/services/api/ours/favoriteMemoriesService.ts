import axios from "axios";
import { BASE_URL } from "../../../configuration/config";

export async function getFavoriteMemoryById(token: string, memoryId: string) {
  const res = await axios.get(
    `${BASE_URL}/api/favorite-memories/get-favorite-memory/${memoryId}`,
    { headers: { Authorization: `Bearer ${token}` } }
  );
  return res.data.memory;
}

export async function getAllFavoriteMemories(token: string) {
  const res = await axios.get(
    `${BASE_URL}/api/favorite-memories/get-favorite-memories`,
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );

  return res.data.memories;
}

export async function getRecentFavoriteMemories(token: string) {
  const res = await axios.get(
    `${BASE_URL}/api/favorite-memories/recent`,
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );

  return res.data.memories;
}

export async function createFavoriteMemory(
  token: string,
  memory: string,
  date: string
) {
  const res = await axios.post(
    `${BASE_URL}/api/favorite-memories/add-favorite-memory`,
    { memory, date },
    { headers: { Authorization: `Bearer ${token}` } }
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
    `${BASE_URL}/api/favorite-memories/edit-favorite-memory/${memoryId}`,
    { memory, date },
    { headers: { Authorization: `Bearer ${token}` } }
  );

  return res.data.memory;
}

export async function deleteFavoriteMemory(token: string, memoryId: string) {
  await axios.delete(
    `${BASE_URL}/api/favorite-memories/delete-favorite-memory/${memoryId}`,
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );
}
