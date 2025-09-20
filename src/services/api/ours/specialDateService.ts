import axios from "axios";
import { BASE_URL } from "../../../configuration/config";

export async function getSpecialDates(token: string | null) {
  if (!token) {
    return;
  }

  const res = await axios.get(
    `${BASE_URL}/special-dates/get-special-dates`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  return res.data.specialDates;
}

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
    `${BASE_URL}/special-dates/add-special-date`,
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
    `${BASE_URL}/special-dates/update-special-date/${dateId}`,
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

  const res = await axios.delete(
    `${BASE_URL}/special-dates/delete-special-date/${dateId}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  return res.data;
}

export async function getUpcomingSpecialDate(token: string | null) {
  if (!token) {
    return;
  }

  const res = await axios.get(
    `${BASE_URL}/special-dates/upcoming-special-date`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  return res.data.upcomingSpecialDate;
}
