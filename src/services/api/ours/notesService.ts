import axios from "axios";
import { BASE_URL } from "../configuration/config";

export async function getNotes(token: string) {
  const res = await axios.get(`${BASE_URL}/api/notes/get-notes`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  return res.data.notes;
}

export async function updateNotes(token: string, content: string) {
  const res = await axios.put(
    `${BASE_URL}/api/notes/update-notes`,
    { content },
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );

  return res.data.notes;
}
