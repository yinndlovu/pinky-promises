import axios from "axios";
import { BASE_URL } from "../../../configuration/config";

export async function getTimeline(token: string | null) {
  if (!token) {
    return;
  }

  const res = await axios.get(`${BASE_URL}/timeline/records`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return res.data.timeline;
}

export async function createTimelineRecord(
  token: string | null,
  record: string
) {
  if (!token) {
    return;
  }

  const res = await axios.post(
    `${BASE_URL}/timeline/add`,
    { record },
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  return res.data.timelineRecord;
}
