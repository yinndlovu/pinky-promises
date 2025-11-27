import axios from "axios";
import { BASE_URL } from "../../../configuration/config";

export async function getNotes(token: string) {
  const res = await axios.get(`${BASE_URL}/notes`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return res.data.notes;
}

export async function updateNotes(token: string, content: string) {
  const res = await axios.put(
    `${BASE_URL}/notes/update`,
    { content },
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  return res.data.notes;
}
