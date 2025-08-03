import axios from "axios";
import { BASE_URL } from "../../../configuration/config";

export async function getTimeline(token: string) {
  const res = await axios.get(`${BASE_URL}/api/timeline/records`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data.timeline;
}

export async function createTimelineRecord(token: string, record: string) {
  const res = await axios.post(
    `${BASE_URL}/api/timeline/add`,
    { record },
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );
  return res.data.timelineRecord;
}
