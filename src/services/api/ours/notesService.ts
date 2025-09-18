import axios from "axios";
import { BASE_URL } from "../../../configuration/config";

export async function getNotes(token: string | null) {
  if (!token) {
    return;
  }

  const res = await axios.get(`${BASE_URL}/notes/get-notes`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return res.data.notes;
}

export async function updateNotes(token: string | null, content: string) {
  if (!token) {
    return;
  }

  const res = await axios.put(
    `${BASE_URL}/notes/update-notes`,
    { content },
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  return res.data.notes;
}
