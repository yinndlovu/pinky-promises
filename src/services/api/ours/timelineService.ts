import axios from "axios";
import { BASE_URL } from "../../../configuration/config";

export async function getTimeline(token: string) {
  const response = await axios.get(`${BASE_URL}/timeline`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return response.data.timeline;
}

export async function createTimelineRecord(token: string, record: string) {
  const response = await axios.post(
    `${BASE_URL}/timeline/add`,
    { record },
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  return response.data.timelineRecord;
}
