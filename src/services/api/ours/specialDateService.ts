import axios from "axios";
import { BASE_URL } from "../../../configuration/config";

export async function createSpecialDate(
  token: string | null,
  date: string,
  title: string,
  description?: string
) {
  if (!token) {
    return;
  }

  const res = await axios.post(
    `${BASE_URL}/special-date/add`,
    { date, title, description },
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  return res.data;
}

export async function updateSpecialDate(
  token: string | null,
  dateId: string,
  date: string,
  title: string,
  description?: string
) {
  if (!token) {
    return;
  }

  const res = await axios.put(
    `${BASE_URL}/special-date/${dateId}/update`,
    { date, title, description },
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  return res.data;
}

export async function deleteSpecialDate(token: string | null, dateId: string) {
  if (!token) {
    return;
  }

  const res = await axios.delete(`${BASE_URL}/special-date/${dateId}/delete`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return res.data;
}
