import axios from "axios";
import { BASE_URL } from "../configuration/config";

export async function getRecentActivities(token: string) {
  const res = await axios.get(
    `${BASE_URL}/api/recent-activities/get-recent-activities`,
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );
  return res.data.activities;
}
